import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "../../lib/supabase";

const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF;

const ACCESS_TOKEN =
  process.env.SUPABASE_ACCESS_TOKEN;

const PLAN =
  process.env.SUPABASE_PLAN || "free";

const STORAGE_LIMITS: Record<string, number> = {
  free: 1,
  pro: 100,
};

interface ServiceHealth {
  name?: string;
  healthy?: boolean;
  status?: string;
  error?: string;
  info?: {
    name?: string;
    version?: string;
    description?: string;
  };
}

interface DiskResponse {
  attributes?: {
    size_gb?: number;
    iops?: number;
    throughput_mibps?: number;
    type?: string;
  };
}

/**
 * ==========================================
 * Supabase Management API
 * ==========================================
 */

async function managementApi(
  endpoint: string
) {
  if (!ACCESS_TOKEN) {
    throw new Error(
      "SUPABASE_ACCESS_TOKEN belum diatur."
    );
  }

  return fetch(
    `https://api.supabase.com${endpoint}`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        Accept: "application/json",
      },

      cache: "no-store",
    }
  );
}

/**
 * ==========================================
 * Health
 * ==========================================
 */

async function getHealth() {
  if (!PROJECT_REF) {
    throw new Error(
      "SUPABASE_PROJECT_REF belum diatur."
    );
  }

  const services = [
    "auth",
    "realtime",
    "rest",
    "db",
    "storage",
  ];

  const params = new URLSearchParams();

  for (const service of services) {
    params.append(
      "services",
      service
    );
  }

  const response =
    await managementApi(
      `/v1/projects/${PROJECT_REF}/health?${params.toString()}`
    );

  const body =
    await response.text();

  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      services: [],
      error: body,
    };
  }

  let data: unknown;

  try {
    data = JSON.parse(body);
  } catch {
    data = [];
  }

  const healthServices =
    Array.isArray(data)
      ? (data as ServiceHealth[])
      : [];

  return {
    success: true,
    status: response.status,
    services: healthServices,
    error: null,
  };
}

/**
 * ==========================================
 * Database Disk
 * ==========================================
 */

async function getDisk() {
  if (!PROJECT_REF) {
    throw new Error(
      "SUPABASE_PROJECT_REF belum diatur."
    );
  }

  const response =
    await managementApi(
      `/v1/projects/${PROJECT_REF}/config/disk`
    );

  const body =
    await response.text();

  if (!response.ok) {
    return {
      success: false,
      sizeGb: 0,
      iops: 0,
      throughput: 0,
      type: "unknown",
    };
  }

  try {
    const data =
      JSON.parse(
        body
      ) as DiskResponse;

    return {
      success: true,

      sizeGb:
        data.attributes?.size_gb ?? 0,

      iops:
        data.attributes?.iops ?? 0,

      throughput:
        data.attributes
          ?.throughput_mibps ?? 0,

      type:
        data.attributes?.type ??
        "unknown",
    };
  } catch {
    return {
      success: false,
      sizeGb: 0,
      iops: 0,
      throughput: 0,
      type: "unknown",
    };
  }
}

/**
 * ==========================================
 * Database Table Count
 * ==========================================
 */

async function getTableCount(
  table: string
) {
  const {
    count,
    error,
  } = await supabase
    .from(table)
    .select("*", {
      count: "exact",
      head: true,
    });

  if (error) {
    return 0;
  }

  return count ?? 0;
}

/**
 * ==========================================
 * Storage
 *
 * Recursively scan all folders/files
 * ==========================================
 */

async function getStorageUsage() {
  const {
    data: buckets,
    error,
  } = await supabaseAdmin.storage.listBuckets();

  if (error) {
    return {
      bytes: 0,
      files: 0,
      buckets: 0,
    };
  }

  if (!buckets) {
    return {
      bytes: 0,
      files: 0,
      buckets: 0,
    };
  }

  let totalBytes = 0;
  let totalFiles = 0;

  async function scanFolder(
    bucketId: string,
    path: string
  ): Promise<void> {
    const {
      data: items,
      error,
    } =
      await supabaseAdmin.storage
        .from(bucketId)
        .list(path, {
          limit: 1000,
          offset: 0,
          sortBy: {
            column: "name",
            order: "asc",
          },
        });

    if (error || !items) {
      return;
    }

    for (const item of items) {
      const currentPath = path
        ? `${path}/${item.name}`
        : item.name;

      const isFolder =
        item.id === null &&
        item.metadata === null;

      if (isFolder) {
        await scanFolder(
          bucketId,
          currentPath
        );

        continue;
      }

      const fileSize =
        item.metadata?.size ?? 0;

      totalFiles += 1;
      totalBytes += fileSize;
    }
  }

  for (const bucket of buckets) {
    await scanFolder(
      bucket.id,
      ""
    );
  }

  return {
    bytes: totalBytes,
    files: totalFiles,
    buckets: buckets.length,
  };
}

/**
 * ==========================================
 * Utility
 * ==========================================
 */

function getPercentage(
  used: number,
  capacity: number
) {
  if (capacity <= 0) {
    return 0;
  }

  return Math.min(
    (used / capacity) * 100,
    100
  );
}

function getCapacityStatus(
  percentage: number
) {
  if (percentage >= 90) {
    return "critical";
  }

  if (percentage >= 70) {
    return "warning";
  }

  return "normal";
}

function formatBytes(
  bytes: number
) {
  if (bytes <= 0) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    ),
    units.length - 1
  );

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(2)} ${units[index]}`;
}

/**
 * ==========================================
 * GET /api/monitor
 * ==========================================
 */

export async function GET() {
  try {
    const [
      health,
      disk,
      storage,
      blogs,
      projects,
      solutions,
    ] = await Promise.all([
      getHealth(),
      getDisk(),
      getStorageUsage(),

      getTableCount("blogs"),
      getTableCount("projects"),
      getTableCount("solutions"),
    ]);

    /**
     * ========================================
     * Health
     * ========================================
     */

    const healthyServices =
      health.services.filter(
        (service) =>
          service.status ===
          "ACTIVE_HEALTHY"
      );

    const unhealthyServices =
      health.services.filter(
        (service) =>
          service.status !==
          "ACTIVE_HEALTHY"
      );

    let projectStatus =
      "UNKNOWN";

    if (health.success) {
      if (
        health.services.length > 0 &&
        unhealthyServices.length === 0
      ) {
        projectStatus =
          "ACTIVE_HEALTHY";
      } else {
        projectStatus =
          "UNHEALTHY";
      }
    }

    /**
     * ========================================
     * Storage
     * ========================================
     */

    const storageCapacity =
      STORAGE_LIMITS[PLAN] ??
      STORAGE_LIMITS.free;

    const storageGb =
      storage.bytes /
      1024 /
      1024 /
      1024;

    const storagePercentage =
      getPercentage(
        storageGb,
        storageCapacity
      );

    const storageStatus =
      getCapacityStatus(
        storagePercentage
      );

    /**
     * ========================================
     * Response
     * ========================================
     */

    return NextResponse.json({
      success: true,

      project: {
        ref:
          PROJECT_REF ??
          "unknown",

        plan: PLAN,

        status:
          projectStatus,

        healthApiAvailable:
          health.success,

        healthError:
          health.error,
      },

      services: {
        total:
          health.services.length,

        healthy:
          healthyServices.length,

        unhealthy:
          unhealthyServices.length,

        details:
          health.services,
      },

      database: {
        usedGb: 0,

        percentage: 0,

        status:
          disk.success
            ? "normal"
            : "unknown",

        diskType:
          disk.type,

        iops:
          disk.iops,

        throughput:
          disk.throughput,

        capacityGb:
          disk.sizeGb,

        available:
          disk.success,
      },

      storage: {
        usedBytes:
          storage.bytes,

        used:
          formatBytes(
            storage.bytes
          ),

        usedGb:
          Number(
            storageGb.toFixed(4)
          ),

        capacityGb:
          storageCapacity,

        percentage:
          storagePercentage,

        status:
          storageStatus,

        files:
          storage.files,

        buckets:
          storage.buckets,
      },

      content: {
        blogs,
        projects,
        solutions,
      },

      updatedAt:
        new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}