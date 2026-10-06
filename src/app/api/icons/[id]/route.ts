import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "../../../lib/supabase";

const BUCKET_NAME = "Iftech-technologies";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function getFileExtension(file: File): string {
  const extension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();

  if (
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "png" ||
    extension === "webp" ||
    extension === "svg"
  ) {
    return extension;
  }

  return "png";
}

function createSafeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function deleteStorageFile(
  iconUrl: string | null
): Promise<void> {
  if (!iconUrl) {
    return;
  }

  try {
    const marker =
      `/storage/v1/object/public/${BUCKET_NAME}/`;

    const index = iconUrl.indexOf(marker);

    if (index === -1) {
      return;
    }

    const filePath = decodeURIComponent(
      iconUrl.substring(index + marker.length)
    );

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error(
        "Failed to delete storage file:",
        error
      );
    }
  } catch (error) {
    console.error(
      "Failed to process storage deletion:",
      error
    );
  }
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const technologyId = Number(id);

    if (!Number.isInteger(technologyId)) {
      return NextResponse.json(
        {
          message: "Invalid technology ID.",
        },
        { status: 400 }
      );
    }

    const technology =
      await prisma.technologyIcons.findUnique({
        where: {
          id: technologyId,
        },
      });

    if (!technology) {
      return NextResponse.json(
        {
          message: "Technology not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      technology,
    });
  } catch (error) {
    console.error("GET /api/icons/[id] error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch technology.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  let uploadedFilePath: string | null = null;

  try {
    const { id } = await context.params;

    const technologyId = Number(id);

    if (!Number.isInteger(technologyId)) {
      return NextResponse.json(
        {
          message: "Invalid technology ID.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.technologyIcons.findUnique({
        where: {
          id: technologyId,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          message: "Technology not found.",
        },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const nameValue = formData.get("name");
    const iconValue = formData.get("icon");

    if (
      typeof nameValue !== "string" ||
      !nameValue.trim()
    ) {
      return NextResponse.json(
        {
          message: "Technology name is required.",
        },
        { status: 400 }
      );
    }

    const name = nameValue.trim();

    const duplicate =
      await prisma.technologyIcons.findFirst({
        where: {
          name,
          NOT: {
            id: technologyId,
          },
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          message:
            "Technology with this name already exists.",
        },
        { status: 409 }
      );
    }

    let iconUrl = existing.iconUrl;

    /*
     * Jika user memilih icon baru,
     * upload icon baru terlebih dahulu.
     */
    if (
      iconValue instanceof File &&
      iconValue.size > 0
    ) {
      const extension = getFileExtension(iconValue);

      const safeName = createSafeName(name);

      const fileName = `${safeName}-${Date.now()}.${extension}`;

      uploadedFilePath = fileName;

      const fileBuffer = Buffer.from(
        await iconValue.arrayBuffer()
      );

      const { error: uploadError } =
        await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .upload(
            uploadedFilePath,
            fileBuffer,
            {
              contentType:
                iconValue.type || "image/png",
              upsert: false,
            }
          );

      if (uploadError) {
        console.error(
          "Supabase upload error:",
          uploadError
        );

        return NextResponse.json(
          {
            message: uploadError.message,
          },
          { status: 500 }
        );
      }

      const { data: publicUrlData } =
        supabaseAdmin.storage
          .from(BUCKET_NAME)
          .getPublicUrl(uploadedFilePath);

      iconUrl = publicUrlData.publicUrl;
    }

    const technology =
      await prisma.technologyIcons.update({
        where: {
          id: technologyId,
        },
        data: {
          name,
          iconUrl,
        },
      });

    /*
     * Setelah database berhasil di-update,
     * hapus icon lama jika memang diganti.
     */
    if (
      iconValue instanceof File &&
      iconValue.size > 0 &&
      existing.iconUrl &&
      existing.iconUrl !== iconUrl
    ) {
      await deleteStorageFile(existing.iconUrl);
    }

    return NextResponse.json({
      technology,
      message: "Technology updated successfully.",
    });
  } catch (error) {
    /*
     * Jika upload icon baru berhasil tetapi
     * update database gagal, hapus icon baru.
     */
    if (uploadedFilePath) {
      try {
        await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove([uploadedFilePath]);
      } catch {
        // Ignore cleanup error
      }
    }

    console.error("PUT /api/icons/[id] error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to update technology.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const technologyId = Number(id);

    if (!Number.isInteger(technologyId)) {
      return NextResponse.json(
        {
          message: "Invalid technology ID.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.technologyIcons.findUnique({
        where: {
          id: technologyId,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          message: "Technology not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Hapus database terlebih dahulu.
     */
    await prisma.technologyIcons.delete({
      where: {
        id: technologyId,
      },
    });

    /*
     * Kemudian hapus icon dari Supabase Storage.
     */
    await deleteStorageFile(existing.iconUrl);

    return NextResponse.json({
      message: "Technology deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/icons/[id] error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete technology.",
      },
      { status: 500 }
    );
  }
}