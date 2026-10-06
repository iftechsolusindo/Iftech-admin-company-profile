import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "../../lib/supabase";

const BUCKET_NAME = "Iftech-blogs";

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      blogs,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch blogs.",
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

export async function POST(request: Request) {
  let contentPath: string | null = null;
  let imagePath: string | null = null;

  try {
    const formData = await request.formData();

    const title = formData.get("title");
    const slug = formData.get("slug");
    const excerpt = formData.get("excerpt");
    const content = formData.get("content");
    const published = formData.get("published");
    const image = formData.get("image");

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Content is required.",
        },
        {
          status: 400,
        }
      );
    }

    const cleanTitle = title.trim();
    const cleanSlug = slug.trim();
    const cleanContent = content.trim();

    const cleanExcerpt =
      typeof excerpt === "string" &&
      excerpt.trim()
        ? excerpt.trim()
        : null;

    const isPublished =
      published === "true";

    const existingBlog =
      await prisma.blog.findUnique({
        where: {
          slug: cleanSlug,
        },
      });

    if (existingBlog) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const fileId =
      `${Date.now()}-${cleanSlug}`;

    /*
     * Upload content
     */

    contentPath =
      `contents/${fileId}.txt`;

    const contentBuffer =
      Buffer.from(
        cleanContent,
        "utf-8"
      );

    const {
      error: contentUploadError,
    } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(
        contentPath,
        contentBuffer,
        {
          contentType:
            "text/plain; charset=utf-8",
          upsert: false,
        }
      );

    if (contentUploadError) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to upload blog content.",
          error:
            contentUploadError.message,
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Upload featured image
     */

    if (
      image instanceof File &&
      image.size > 0
    ) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          image.type
        )
      ) {
        await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove([
            contentPath,
          ]);

        contentPath = null;

        return NextResponse.json(
          {
            success: false,
            message:
              "Only JPG, PNG, and WEBP images are allowed.",
          },
          {
            status: 400,
          }
        );
      }

      const extension =
        image.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      imagePath =
        `images/${fileId}.${extension}`;

      const imageBuffer =
        Buffer.from(
          await image.arrayBuffer()
        );

      const {
        error: imageUploadError,
      } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(
          imagePath,
          imageBuffer,
          {
            contentType:
              image.type,
            upsert: false,
          }
        );

      if (imageUploadError) {
        await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove([
            contentPath,
          ]);

        contentPath = null;

        return NextResponse.json(
          {
            success: false,
            message:
              "Failed to upload featured image.",
            error:
              imageUploadError.message,
          },
          {
            status: 500,
          }
        );
      }
    }

    /*
     * Save blog
     */

    const blog =
      await prisma.blog.create({
        data: {
          title: cleanTitle,
          slug: cleanSlug,
          excerpt: cleanExcerpt,
          contentUrl: contentPath,
          imageUrl: imagePath,
          published: isPublished,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: isPublished
          ? "Blog published successfully."
          : "Blog saved as draft.",
        blog,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    const filesToDelete = [
      contentPath,
      imagePath,
    ].filter(
      (
        path
      ): path is string =>
        Boolean(path)
    );

    if (
      filesToDelete.length > 0
    ) {
      try {
        await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove(
            filesToDelete
          );
      } catch {
        // Ignore cleanup errors
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create blog.",
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

export async function PUT(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  let newContentPath: string | null = null;
  let newImagePath: string | null = null;

  try {
    const { id } =
      await context.params;

    const blogId = Number(id);

    if (Number.isNaN(blogId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid blog ID.",
        },
        {
          status: 400,
        }
      );
    }

    const existingBlog =
      await prisma.blog.findUnique({
        where: {
          id: blogId,
        },
      });

    if (!existingBlog) {
      return NextResponse.json(
        {
          success: false,
          message: "Blog not found.",
        },
        {
          status: 404,
        }
      );
    }

    const formData =
      await request.formData();

    const title =
      formData.get("title");

    const slug =
      formData.get("slug");

    const excerpt =
      formData.get("excerpt");

    const content =
      formData.get("content");

    const published =
      formData.get("published");

    const image =
      formData.get("image");

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Content is required.",
        },
        {
          status: 400,
        }
      );
    }

    const cleanTitle =
      title.trim();

    const cleanSlug =
      slug.trim();

    const cleanContent =
      content.trim();

    const cleanExcerpt =
      typeof excerpt === "string" &&
      excerpt.trim()
        ? excerpt.trim()
        : null;

    const isPublished =
      published === "true";

    /*
     * Check slug
     */

    const slugOwner =
      await prisma.blog.findUnique({
        where: {
          slug: cleanSlug,
        },
        select: {
          id: true,
        },
      });

    if (
      slugOwner &&
      slugOwner.id !== blogId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Upload new content
     */

    const fileId =
      `${Date.now()}-${cleanSlug}`;

    newContentPath =
      `contents/${fileId}.txt`;

    const contentBuffer =
      Buffer.from(
        cleanContent,
        "utf-8"
      );

    const {
      error: contentUploadError,
    } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(
        newContentPath,
        contentBuffer,
        {
          contentType:
            "text/plain; charset=utf-8",
          upsert: false,
        }
      );

    if (contentUploadError) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to upload blog content.",
          error:
            contentUploadError.message,
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Upload new image
     */

    if (
      image instanceof File &&
      image.size > 0
    ) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          image.type
        )
      ) {
        await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove([
            newContentPath,
          ]);

        newContentPath = null;

        return NextResponse.json(
          {
            success: false,
            message:
              "Only JPG, PNG, and WEBP images are allowed.",
          },
          {
            status: 400,
          }
        );
      }

      const extension =
        image.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      newImagePath =
        `images/${fileId}.${extension}`;

      const imageBuffer =
        Buffer.from(
          await image.arrayBuffer()
        );

      const {
        error: imageUploadError,
      } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(
          newImagePath,
          imageBuffer,
          {
            contentType:
              image.type,
            upsert: false,
          }
        );

      if (imageUploadError) {
        await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove([
            newContentPath,
          ]);

        newContentPath = null;

        return NextResponse.json(
          {
            success: false,
            message:
              "Failed to upload featured image.",
            error:
              imageUploadError.message,
          },
          {
            status: 500,
          }
        );
      }
    }

    /*
     * Keep old image if
     * no new image was uploaded.
     */

    const finalImagePath =
      newImagePath ||
      existingBlog.imageUrl;

    /*
     * Update database
     */

    const updatedBlog =
      await prisma.blog.update({
        where: {
          id: blogId,
        },
        data: {
          title: cleanTitle,
          slug: cleanSlug,
          excerpt: cleanExcerpt,
          contentUrl:
            newContentPath,
          imageUrl:
            finalImagePath,
          published:
            isPublished,
        },
      });

    /*
     * Delete old content
     */

    if (
      existingBlog.contentUrl &&
      existingBlog.contentUrl !==
        newContentPath
    ) {
      try {
        await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove([
            existingBlog.contentUrl,
          ]);
      } catch {
        // Ignore cleanup errors
      }
    }

    /*
     * Delete old image
     */

    if (
      newImagePath &&
      existingBlog.imageUrl &&
      existingBlog.imageUrl !==
        newImagePath
    ) {
      try {
        await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove([
            existingBlog.imageUrl,
          ]);
      } catch {
        // Ignore cleanup errors
      }
    }

    newContentPath = null;
    newImagePath = null;

    return NextResponse.json({
      success: true,
      message: isPublished
        ? "Blog updated and published successfully."
        : "Blog updated and saved as draft.",
      blog: updatedBlog,
    });
  } catch (error) {
    const filesToDelete = [
      newContentPath,
      newImagePath,
    ].filter(
      (
        path
      ): path is string =>
        Boolean(path)
    );

    if (
      filesToDelete.length > 0
    ) {
      try {
        await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove(
            filesToDelete
          );
      } catch {
        // Ignore cleanup errors
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update blog.",
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
