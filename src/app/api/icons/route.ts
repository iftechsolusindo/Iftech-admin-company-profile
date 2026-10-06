import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "../../lib/supabase";

const BUCKET_NAME = "Iftech-technologies";

export async function GET() {
  try {
    const technologies = await prisma.technologyIcons.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      technologies,
    });
  } catch (error) {
    console.error("GET /api/icons error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch technologies.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    if (!(iconValue instanceof File)) {
      return NextResponse.json(
        {
          message: "Technology icon is required.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.technologyIcons.findUnique({
        where: {
          name,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          message:
            "Technology with this name already exists.",
        },
        { status: 409 }
      );
    }

    const extension =
      iconValue.name.split(".").pop()?.toLowerCase() ||
      "png";

    const safeName = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const filePath = `${safeName}.${extension}`;

    const fileBuffer = Buffer.from(
      await iconValue.arrayBuffer()
    );

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(filePath, fileBuffer, {
          contentType:
            iconValue.type || "image/png",
          upsert: true,
        });

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

    const {
      data: publicUrlData,
    } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const iconUrl = publicUrlData.publicUrl;

    const technology =
      await prisma.technologyIcons.create({
        data: {
          name,
          iconUrl,
        },
      });

    return NextResponse.json(
      {
        technology,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/icons error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create technology.",
      },
      { status: 500 }
    );
  }
}