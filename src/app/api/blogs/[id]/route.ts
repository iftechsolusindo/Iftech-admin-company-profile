import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "../../../lib/supabase";

const BUCKET_NAME = "Iftech-blogs";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/*
 * ========================================
 * GET
 * Get one blog by ID
 *
 * Selain mengambil data blog dari database,
 * endpoint ini juga mengambil isi file .txt
 * dari Supabase Storage.
 *
 * Flow:
 *
 * Database
 *    ↓
 * contentUrl
 *    ↓
 * Supabase Storage
 *    ↓
 * download .txt
 *    ↓
 * data.text()
 *    ↓
 * return blog + content
 *
 * ========================================
 */

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const blogId = Number(id);

    if (!Number.isInteger(blogId)) {
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

    /*
     * ========================================
     * Get blog from database
     * ========================================
     */

    const blog = await prisma.blog.findUnique({
      where: {
        id: blogId,
      },

      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        contentUrl: true,
        imageUrl: true,
        published: true,
      },
    });

    if (!blog) {
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

    /*
     * ========================================
     * Get content from Supabase Storage
     * ========================================
     */

    let content = "";

    if (blog.contentUrl) {
      const {
        data,
        error,
      } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .download(blog.contentUrl);

      if (error) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Failed to download blog content.",
            error: error.message,
          },
          {
            status: 500,
          }
        );
      }

      /*
       * Convert .txt file into string
       */

      content = await data.text();
    }

    /*
     * ========================================
     * Get image from Supabase Storage
     * ========================================
     */

    let image = null;

    if (blog.imageUrl) {
      const {
        data,
        error,
      } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .download(blog.imageUrl);

      if (error) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Failed to download blog image.",
            error: error.message,
          },
          {
            status: 500,
          }
        );
      }

      /*
       * Convert image into Base64
       */

      const imageBuffer =
        Buffer.from(
          await data.arrayBuffer()
        );

      const base64 =
        imageBuffer.toString("base64");

      /*
       * Get image MIME type
       *
       * Contoh:
       * image/jpeg
       * image/png
       * image/webp
       */

      const mimeType =
        data.type ||
        "image/jpeg";

      image =
        `data:${mimeType};base64,${base64}`;
    }

    /*
     * ========================================
     * Return blog + content + image
     * ========================================
     */

    return NextResponse.json({
      success: true,

      blog: {
        ...blog,

        /*
         * HTML content dari .txt
         */
        content,

        /*
         * Base64 image
         */
        image,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch blog.",
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

/*
 * ========================================
 * PUT
 * Update blog
 * ========================================
 */

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  let newContentPath: string | null =
    null;

  let newImagePath: string | null =
    null;

  try {
    const { id } = await params;

    const blogId = Number(id);

    if (!Number.isInteger(blogId)) {
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

    /*
     * ========================================
     * Get existing blog
     * ========================================
     */

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

    /*
     * ========================================
     * Get FormData
     * ========================================
     */

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

    /*
     * ========================================
     * Validation
     * ========================================
     */

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

    /*
     * ========================================
     * Clean data
     * ========================================
     */

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
     * ========================================
     * Check duplicate slug
     * ========================================
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
     * ========================================
     * Generate file ID
     * ========================================
     */

    const fileId =
      `${Date.now()}-${cleanSlug}`;

    /*
     * ========================================
     * Upload new content
     * ========================================
     */

    newContentPath =
      `contents/${fileId}.txt`;

    const contentBuffer =
      Buffer.from(
        cleanContent,
        "utf-8"
      );

    const {
      error: contentUploadError,
    } =
      await supabaseAdmin.storage
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
     * ========================================
     * Upload new image
     *
     * Only upload when user selected
     * a new image.
     * ========================================
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

      /*
       * Validate image type
       */

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

      /*
       * Get image extension
       */

      const extension =
        image.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      /*
       * Generate image path
       */

      newImagePath =
        `images/${fileId}.${extension}`;

      /*
       * Convert image to Buffer
       */

      const imageBuffer =
        Buffer.from(
          await image.arrayBuffer()
        );

      /*
       * Upload image
       */

      const {
        error: imageUploadError,
      } =
        await supabaseAdmin.storage
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
        /*
         * Content sudah terupload,
         * jadi hapus kembali jika
         * image gagal.
         */

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
     * ========================================
     * Determine image path
     * ========================================
     *
     * Jika ada image baru:
     *     gunakan image baru
     *
     * Jika tidak ada image baru:
     *     gunakan image lama
     *
     */

    const finalImagePath =
      newImagePath !== null
        ? newImagePath
        : existingBlog.imageUrl;

    /*
     * ========================================
     * Update database
     * ========================================
     */

    const blog =
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
     * ========================================
     * Remove old content
     * ========================================
     *
     * Dilakukan setelah database
     * berhasil diperbarui.
     *
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
     * ========================================
     * Remove old image
     * ========================================
     *
     * Hanya dilakukan jika user
     * mengganti image.
     *
     */

    if (
      newImagePath !== null &&
      existingBlog.imageUrl
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

    /*
     * File baru sudah berhasil
     * disimpan.
     *
     * Set null supaya tidak
     * ikut dihapus oleh catch.
     */

    newContentPath = null;
    newImagePath = null;

    /*
     * ========================================
     * Response
     * ========================================
     */

    return NextResponse.json({
      success: true,
      message:
        "Blog updated successfully.",
      blog,
    });
  } catch (error) {
    /*
     * ========================================
     * Cleanup newly uploaded files
     * ========================================
     */

    const newFiles = [
      newContentPath,
      newImagePath,
    ].filter(
      (
        path
      ): path is string =>
        Boolean(path)
    );

    if (
      newFiles.length > 0
    ) {
      try {
        await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove(
            newFiles
          );
      } catch {
        // Ignore cleanup errors
      }
    }

    /*
     * ========================================
     * Error response
     * ========================================
     */

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

/*
 * ========================================
 * DELETE
 * Delete blog
 * ========================================
 */

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const blogId = Number(id);

    if (!Number.isInteger(blogId)) {
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

    /*
     * ========================================
     * Get blog
     * ========================================
     */

    const blog =
      await prisma.blog.findUnique({
        where: {
          id: blogId,
        },
      });

    if (!blog) {
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

    /*
     * ========================================
     * Delete database record
     * ========================================
     */

    await prisma.blog.delete({
      where: {
        id: blogId,
      },
    });

    /*
     * ========================================
     * Delete files from Supabase
     * ========================================
     */

    const filesToDelete = [
      blog.contentUrl,
      blog.imageUrl,
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

    /*
     * ========================================
     * Response
     * ========================================
     */

    return NextResponse.json({
      success: true,
      message:
        "Blog deleted successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete blog.",
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