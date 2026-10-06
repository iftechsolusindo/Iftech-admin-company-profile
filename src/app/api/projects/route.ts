import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "../../lib/supabase";

const BUCKET_NAME = "Iftech-projects";

interface Technology {
  name: string;
}

function parseString(
  value: FormDataEntryValue | null
): string | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

function parseArray(
  value: FormDataEntryValue | null
): string[] {
  if (!value || typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item): item is string =>
          typeof item === "string"
      )
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function parseTechnologies(
  value: FormDataEntryValue | null
): Technology[] {
  if (!value || typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (
          item
        ): item is { name: unknown } =>
          typeof item === "object" &&
          item !== null &&
          "name" in item
      )
      .map((item) => ({
        name:
          typeof item.name === "string"
            ? item.name.trim()
            : "",
      }))
      .filter(
        (item) => item.name.length > 0
      );
  } catch {
    return [];
  }
}

function getFileExtension(
  file: File
): string {
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "png" ||
    extension === "webp"
  ) {
    return extension;
  }

  return "webp";
}

async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  const extension =
    getFileExtension(file);

  const finalPath =
    `${path}.${extension}`;

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  const { error } =
    await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(
        finalPath,
        buffer,
        {
          contentType:
            file.type ||
            "image/webp",
          upsert: false,
        }
      );

  if (error) {
    throw new Error(
      `Failed to upload image: ${error.message}`
    );
  }

  const {
    data: { publicUrl },
  } =
    supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(
        finalPath
      );

  return publicUrl;
}

async function deleteImage(
  url: string | null
): Promise<void> {
  if (!url) {
    return;
  }

  try {
    const marker =
      `/storage/v1/object/public/${BUCKET_NAME}/`;

    const index =
      url.indexOf(marker);

    if (index === -1) {
      return;
    }

    const path =
      decodeURIComponent(
        url.substring(
          index + marker.length
        )
      );

    await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([path]);
  } catch {
    // Ignore cleanup errors
  }
}

/*
 * ========================================
 * GET ALL PROJECTS
 * ========================================
 */

export async function GET() {
  try {
    const projects =
      await prisma.project.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch projects.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ========================================
 * CREATE PROJECT
 * ========================================
 */

export async function POST(
  request: Request
) {
  const uploadedImages: string[] = [];

  try {
    const formData =
      await request.formData();

    const title =
      parseString(
        formData.get("title")
      );

    const slug =
      parseString(
        formData.get("slug")
      );

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Project title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Check duplicate slug
     */

    const existingProject =
      await prisma.project.findUnique({
        where: {
          slug,
        },
      });

    if (existingProject) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A project with this slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Basic information
     */

    const client =
      parseString(
        formData.get("client")
      );

    const yearValue =
      parseString(
        formData.get("year")
      );

    const year =
      yearValue
        ? Number(yearValue)
        : null;

    if (
      yearValue &&
      (!Number.isInteger(year) ||
        year! < 1900 ||
        year! > 2100)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Year must be a valid year.",
        },
        {
          status: 400,
        }
      );
    }

    const type =
      parseString(
        formData.get("type")
      );

    const clientLocation =
      parseString(
        formData.get(
          "clientLocation"
        )
      );

    const link =
      parseString(
        formData.get("link")
      );

    const category =
      parseString(
        formData.get("category")
      );

    const projectDetails =
      parseString(
        formData.get(
          "projectDetails"
        )
      );

    const ourResponsibility =
      parseString(
        formData.get(
          "ourResponsibility"
        )
      );

    /*
     * Arrays
     */

    const devices =
      parseArray(
        formData.get("devices")
      );

    const responsibilities =
      parseArray(
        formData.get(
          "responsibilities"
        )
      );

    const technologies =
      parseTechnologies(
        formData.get(
          "technologies"
        )
      );

    /*
     * Images
     */

    const mainImage =
      formData.get("image");

    const projectDetailsImage =
      formData.get(
        "projectDetailsImage"
      );

    const responsibilityImage =
      formData.get(
        "responsibilityImage"
      );

    const galleryImage =
      formData.get(
        "galleryImage"
      );

    let imageUrl: string | null =
      null;

    let projectDetailsImageUrl:
      | string
      | null = null;

    let ourResponsibilityImageUrl:
      | string
      | null = null;

    let galleryImageUrl:
      | string
      | null = null;

    /*
     * Main image
     */

    if (mainImage instanceof File) {
      imageUrl =
        await uploadImage(
          mainImage,
          `projects/${slug}/main`
        );

      uploadedImages.push(
        imageUrl
      );
    }

    /*
     * Project details image
     */

    if (
      projectDetailsImage instanceof
      File
    ) {
      projectDetailsImageUrl =
        await uploadImage(
          projectDetailsImage,
          `projects/${slug}/project-details`
        );

      uploadedImages.push(
        projectDetailsImageUrl
      );
    }

    /*
     * Responsibility image
     */

    if (
      responsibilityImage instanceof
      File
    ) {
      ourResponsibilityImageUrl =
        await uploadImage(
          responsibilityImage,
          `projects/${slug}/responsibility`
        );

      uploadedImages.push(
        ourResponsibilityImageUrl
      );
    }

    /*
     * Gallery image
     */

    if (
      galleryImage instanceof File
    ) {
      galleryImageUrl =
        await uploadImage(
          galleryImage,
          `projects/${slug}/gallery`
        );

      uploadedImages.push(
        galleryImageUrl
      );
    }

    /*
     * Create project
     */

    const project =
      await prisma.project.create({
        data: {
          title,
          slug,

          imageUrl,

          client,
          year,
          type,
          clientLocation,
          link,
          category,

          devices,

          projectDetails,
          projectDetailsImageUrl,

          ourResponsibility,
          ourResponsibilityImageUrl,

          responsibilities,

          technologies:
            technologies.length > 0
              ? technologies
              : null,

          galleryImageUrl,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Project created successfully.",
        project,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    /*
     * Cleanup uploaded images
     * if database operation fails.
     */

    for (const imageUrl of uploadedImages) {
      await deleteImage(
        imageUrl
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create project.",
      },
      {
        status: 500,
      }
    );
  }
}