"use client";

import { useCallback, useEffect, useState } from "react";

interface Service {
  name?: string;
  status?: string;
}

interface MonitorData {
  success: boolean;

  project: {
    ref: string;
    plan: string;
    status: string;
  };

  services: {
    total: number;
    healthy: number;
    unhealthy: number;
    details: Service[];
  };

  database: {
    usedGb: number;
    capacityGb: number;
    percentage: number;
    status: string;
    diskType: string;
    iops: number;
    throughput: number;
  };

  storage: {
    usedBytes: number;
    used: string;
    usedGb: number;
    capacityGb: number;
    percentage: number;
    status: string;
    files: number;
    buckets: number;
  };

  content: {
    blogs: number;
    projects: number;
    solutions: number;
  };

  updatedAt: string;
}

function getStatusLabel(status: string) {
  if (status === "critical") {
    return "Critical";
  }

  if (status === "warning") {
    return "Warning";
  }

  return "Normal";
}

function getStatusClass(status: string) {
  if (status === "critical") {
    return "bg-red-100 text-red-700";
  }

  if (status === "warning") {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-green-100 text-green-700";
}

function getHealthClass(status: string) {
  if (status === "ACTIVE_HEALTHY") {
    return "bg-green-500";
  }

  return "bg-red-500";
}

function getHealthLabel(status: string) {
  if (status === "ACTIVE_HEALTHY") {
    return "Operational";
  }

  return status;
}

function CapacityBar({
  percentage,
}: {
  percentage: number;
}) {
  return (
    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
      <div
        className="h-full rounded-full bg-zinc-900 transition-all"
        style={{
          width: `${Math.min(percentage, 100)}%`,
        }}
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <p className="text-sm text-zinc-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-400">
        {description}
      </p>
    </div>
  );
}

export default function MonitorPage() {
  const [data, setData] =
    useState<MonitorData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [refreshing, setRefreshing] =
    useState(false);

  const fetchMonitor = useCallback(
    async (manual = false) => {
      try {
        if (manual) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await fetch(
          "/api/monitor",
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              "Gagal mengambil data monitoring."
          );
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMonitor();

    const interval = setInterval(() => {
      fetchMonitor();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchMonitor]);

  if (loading && !data) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-sm text-zinc-500">
          Loading monitoring data...
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Monitoring Error
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <button
          onClick={() => fetchMonitor(true)}
          className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const projectHealthy =
    data.project.status === "ACTIVE_HEALTHY";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            System Monitoring
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
            Supabase Monitor
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Real-time overview of your Supabase project.
          </p>
        </div>

        <button
          onClick={() => fetchMonitor(true)}
          disabled={refreshing}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* Project status */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              Project Status
            </p>

            <div className="mt-2 flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${getHealthClass(
                  data.project.status
                )}`}
              />

              <span className="text-xl font-semibold text-zinc-900">
                {projectHealthy
                  ? "Active & Healthy"
                  : "Unhealthy"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
              Plan
            </p>

            <p className="mt-1 text-sm font-medium capitalize text-zinc-900">
              {data.project.plan}
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-zinc-100 pt-4">
          <p className="text-xs text-zinc-400">
            Project Ref
          </p>

          <p className="mt-1 font-mono text-sm text-zinc-700">
            {data.project.ref}
          </p>
        </div>
      </div>

      {/* Capacity */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            Capacity
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Current resource utilization.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Database */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Database Disk
                </p>

                <p className="mt-2 text-2xl font-semibold text-zinc-900">
                  {data.database.usedGb.toFixed(2)} GB
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  of {data.database.capacityGb} GB
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                  data.database.status
                )}`}
              >
                {getStatusLabel(
                  data.database.status
                )}
              </span>
            </div>

            <CapacityBar
              percentage={
                data.database.percentage
              }
            />

            <div className="mt-3 flex justify-between text-xs text-zinc-400">
              <span>
                {data.database.percentage.toFixed(1)}%
                used
              </span>

              <span>
                {data.database.diskType}
              </span>
            </div>
          </div>

          {/* Storage */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Storage
                </p>

                <p className="mt-2 text-2xl font-semibold text-zinc-900">
                  {data.storage.used}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  of {data.storage.capacityGb} GB
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                  data.storage.status
                )}`}
              >
                {getStatusLabel(
                  data.storage.status
                )}
              </span>
            </div>

            <CapacityBar
              percentage={
                data.storage.percentage
              }
            />

            <div className="mt-3 flex justify-between text-xs text-zinc-400">
              <span>
                {data.storage.percentage.toFixed(1)}%
                used
              </span>

              <span>
                {data.storage.files} files
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            Services
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Supabase service health.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white">
          {data.services.details.length === 0 ? (
            <div className="p-6 text-sm text-zinc-500">
              No service information available.
            </div>
          ) : (
            data.services.details.map(
              (service, index) => (
                <div
                  key={`${service.name}-${index}`}
                  className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${getHealthClass(
                        service.status ?? ""
                      )}`}
                    />

                    <span className="text-sm font-medium text-zinc-800">
                      {service.name ??
                        "Unknown Service"}
                    </span>
                  </div>

                  <span className="text-xs text-zinc-500">
                    {getHealthLabel(
                      service.status ?? "UNKNOWN"
                    )}
                  </span>
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* Statistics */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            Content
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Content stored in your database.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Blogs"
            value={data.content.blogs}
            description="Total blog entries"
          />

          <StatCard
            title="Projects"
            value={data.content.projects}
            description="Total projects"
          />

          <StatCard
            title="Solutions"
            value={data.content.solutions}
            description="Total solutions"
          />

          <StatCard
            title="Storage Files"
            value={data.storage.files}
            description={`${data.storage.buckets} storage buckets`}
          />
        </div>
      </div>

      {/* Database information */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          Database Infrastructure
        </h2>

        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">
              Disk Type
            </p>

            <p className="mt-2 text-sm font-medium text-zinc-900">
              {data.database.diskType}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">
              IOPS
            </p>

            <p className="mt-2 text-sm font-medium text-zinc-900">
              {data.database.iops}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">
              Throughput
            </p>

            <p className="mt-2 text-sm font-medium text-zinc-900">
              {data.database.throughput} MiB/s
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between border-t border-zinc-200 pt-5 text-xs text-zinc-400">
        <span>
          Auto refresh: 30 seconds
        </span>

        <span>
          Last updated{" "}
          {new Date(
            data.updatedAt
          ).toLocaleTimeString("id-ID")}
        </span>
      </div>
    </div>
  );
}