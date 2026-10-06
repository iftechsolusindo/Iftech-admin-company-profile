import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "../../../lib/supabase";

const BUCKET_NAME = "Iftech-projects";

interface Technology {
  name: string;
}

/*
 * ========================================
 * Helpers
 * ========================================
 */

function parseString(
  value: FormDataEntryValue | null
): string | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

function parseBoolean(
  value: FormDataEntryValue | null
): boolean {
  if (!value || typeof value !== "string") {
    return false;
  }

  return value === "true";
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

/*
 * ========================================
 * Upload Image
 * ========================================
 */

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

/*
 * ========================================
 * Delete Image From Supabase
 * ========================================
 */

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

    const { error } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([path]);

    if (error) {
      console.error(
        "Failed to delete image:",
        error.message
      );
    }
  } catch (error) {
    console.error(
      "Failed to delete image:",
      error
    );
  }
}

/*
 * ========================================
 * GET PROJECT
 * ========================================
 */

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await context.params;

    const projectId =
      Number(id);

    if (
      !Number.isInteger(projectId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid project ID.",
        },
        {
          status: 400,
        }
      );
    }

    const project =
      await prisma.project.findUnique({
        where: {
          id: projectId,
        },
      });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Project not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Prisma project dikembalikan
     * langsung.
     *
     * Field gambar:
     *
     * imageUrl
     * projectDetailsImageUrl
     * ourResponsibilityImageUrl
     * galleryImageUrl
     *
     * URL tersebut adalah public URL
     * dari Supabase Storage.
     */

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error(
      "GET PROJECT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch project.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ========================================
 * UPDATE PROJECT
 * ========================================
 */

export async function PUT(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const uploadedImages: string[] = [];

  try {
    const { id } =
      await context.params;

    const projectId =
      Number(id);

    if (
      !Number.isInteger(projectId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid project ID.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ========================================
     * Existing Project
     * ========================================
     */

    const existingProject =
      await prisma.project.findUnique({
        where: {
          id: projectId,
        },
      });

    if (!existingProject) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Project not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * ========================================
     * Form Data
     * ========================================
     */

    const formData =
      await request.formData();

    /*
     * ========================================
     * Basic Information
     * ========================================
     */

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
     * ========================================
     * Duplicate Slug
     * ========================================
     */

    const duplicateProject =
      await prisma.project.findFirst({
        where: {
          slug,
          NOT: {
            id: projectId,
          },
        },
      });

    if (duplicateProject) {
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
     * ========================================
     * Client Information
     * ========================================
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

    /*
     * ========================================
     * Project Details
     * ========================================
     */

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
     * ========================================
     * Arrays
     * ========================================
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
     * ========================================
     * Remove Image Flags
     * ========================================
     */

    const shouldRemoveMainImage =
      parseBoolean(
        formData.get("removeImage")
      );

    const shouldRemoveProjectDetailsImage =
      parseBoolean(
        formData.get(
          "removeProjectDetailsImage"
        )
      );

    const shouldRemoveResponsibilityImage =
      parseBoolean(
        formData.get(
          "removeResponsibilityImage"
        )
      );

    const shouldRemoveGalleryImage =
      parseBoolean(
        formData.get(
          "removeGalleryImage"
        )
      );

    /*
     * ========================================
     * Existing Image URLs
     * ========================================
     */

    let imageUrl =
      existingProject.imageUrl;

    let projectDetailsImageUrl =
      existingProject.projectDetailsImageUrl;

    let ourResponsibilityImageUrl =
      existingProject.ourResponsibilityImageUrl;

    let galleryImageUrl =
      existingProject.galleryImageUrl;

    /*
     * ========================================
     * New Image Files
     * ========================================
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

    /*
     * ========================================
     * MAIN IMAGE
     * ========================================
     */

    if (mainImage instanceof File) {
      const newImageUrl =
        await uploadImage(
          mainImage,
          `projects/${slug}/main-${Date.now()}`
        );

      uploadedImages.push(
        newImageUrl
      );

      imageUrl = newImageUrl;
    } else if (
      shouldRemoveMainImage
    ) {
      imageUrl = null;
    }

    /*
     * ========================================
     * PROJECT DETAILS IMAGE
     * ========================================
     */

    if (
      projectDetailsImage instanceof File
    ) {
      const newImageUrl =
        await uploadImage(
          projectDetailsImage,
          `projects/${slug}/project-details-${Date.now()}`
        );

      uploadedImages.push(
        newImageUrl
      );

      projectDetailsImageUrl =
        newImageUrl;
    } else if (
      shouldRemoveProjectDetailsImage
    ) {
      projectDetailsImageUrl = null;
    }

    /*
     * ========================================
     * RESPONSIBILITY IMAGE
     * ========================================
     */

    if (
      responsibilityImage instanceof File
    ) {
      const newImageUrl =
        await uploadImage(
          responsibilityImage,
          `projects/${slug}/responsibility-${Date.now()}`
        );

      uploadedImages.push(
        newImageUrl
      );

      ourResponsibilityImageUrl =
        newImageUrl;
    } else if (
      shouldRemoveResponsibilityImage
    ) {
      ourResponsibilityImageUrl = null;
    }

    /*
     * ========================================
     * GALLERY IMAGE
     * ========================================
     */

    if (
      galleryImage instanceof File
    ) {
      const newImageUrl =
        await uploadImage(
          galleryImage,
          `projects/${slug}/gallery-${Date.now()}`
        );

      uploadedImages.push(
        newImageUrl
      );

      galleryImageUrl =
        newImageUrl;
    } else if (
      shouldRemoveGalleryImage
    ) {
      galleryImageUrl = null;
    }

    /*
     * ========================================
     * Update Database
     * ========================================
     */

    const project =
      await prisma.project.update({
        where: {
          id: projectId,
        },

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

    /*
     * ========================================
     * Delete Old Main Image
     * ========================================
     */

    if (
      mainImage instanceof File &&
      existingProject.imageUrl
    ) {
      await deleteImage(
        existingProject.imageUrl
      );
    }

    if (
      shouldRemoveMainImage &&
      !(mainImage instanceof File) &&
      existingProject.imageUrl
    ) {
      await deleteImage(
        existingProject.imageUrl
      );
    }

    /*
     * ========================================
     * Delete Old Project Details Image
     * ========================================
     */

    if (
      projectDetailsImage instanceof File &&
      existingProject.projectDetailsImageUrl
    ) {
      await deleteImage(
        existingProject.projectDetailsImageUrl
      );
    }

    if (
      shouldRemoveProjectDetailsImage &&
      !(projectDetailsImage instanceof File) &&
      existingProject.projectDetailsImageUrl
    ) {
      await deleteImage(
        existingProject.projectDetailsImageUrl
      );
    }

    /*
     * ========================================
     * Delete Old Responsibility Image
     * ========================================
     */

    if (
      responsibilityImage instanceof File &&
      existingProject.ourResponsibilityImageUrl
    ) {
      await deleteImage(
        existingProject.ourResponsibilityImageUrl
      );
    }

    if (
      shouldRemoveResponsibilityImage &&
      !(responsibilityImage instanceof File) &&
      existingProject.ourResponsibilityImageUrl
    ) {
      await deleteImage(
        existingProject.ourResponsibilityImageUrl
      );
    }

    /*
     * ========================================
     * Delete Old Gallery Image
     * ========================================
     */

    if (
      galleryImage instanceof File &&
      existingProject.galleryImageUrl
    ) {
      await deleteImage(
        existingProject.galleryImageUrl
      );
    }

    if (
      shouldRemoveGalleryImage &&
      !(galleryImage instanceof File) &&
      existingProject.galleryImageUrl
    ) {
      await deleteImage(
        existingProject.galleryImageUrl
      );
    }

    /*
     * ========================================
     * Success
     * ========================================
     */

    return NextResponse.json({
      success: true,
      message:
        "Project updated successfully.",
      project,
    });
  } catch (error) {
    /*
     * ========================================
     * Cleanup Newly Uploaded Images
     * ========================================
     */

    for (const imageUrl of uploadedImages) {
      await deleteImage(
        imageUrl
      );
    }

    console.error(
      "UPDATE PROJECT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update project.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ========================================
 * DELETE PROJECT
 * ========================================
 */

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await context.params;

    const projectId =
      Number(id);

    if (
      !Number.isInteger(projectId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid project ID.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ========================================
     * Find Project
     * ========================================
     */

    const project =
      await prisma.project.findUnique({
        where: {
          id: projectId,
        },
      });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Project not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * ========================================
     * Delete Database Record
     * ========================================
     */

    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    /*
     * ========================================
     * Delete Images From Supabase
     * ========================================
     */

    await deleteImage(
      project.imageUrl
    );

    await deleteImage(
      project.projectDetailsImageUrl
    );

    await deleteImage(
      project.ourResponsibilityImageUrl
    );

    await deleteImage(
      project.galleryImageUrl
    );

    /*
     * ========================================
     * Success
     * ========================================
     */

    return NextResponse.json({
      success: true,
      message:
        "Project deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE PROJECT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete project.",
      },
      {
        status: 500,
      }
    );
  }
}