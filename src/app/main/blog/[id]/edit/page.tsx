"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import BlogEditor from "../../../../components/blogeditor";

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  contentUrl: string | null;
  imageUrl: string | null;
  published: boolean;
  content: string;


  image: string | null;
}

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [blog, setBlog] =
    useState<Blog | null>(null);

  const [title, setTitle] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [excerpt, setExcerpt] =
    useState("");

  const [content, setContent] =
    useState("");

  const [published, setPublished] =
    useState(false);

  const [image, setImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true);

        const response =
          await fetch(`/api/blogs/${id}`);

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to load blog."
          );
        }

        const blogData: Blog =
          data.blog;

        setBlog(blogData);

        setTitle(blogData.title);
        setSlug(blogData.slug);
        setExcerpt(
          blogData.excerpt || ""
        );
        setContent(
          blogData.content || ""
        );
        setPublished(
          blogData.published
        );

        if (blogData.image) {
          setImagePreview(
            blogData.image
          );
        } else {
          setImagePreview("");
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load blog."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBlog();
    }
  }, [id]);


  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    if (!title.trim()) {
      toast.error(
        "Blog title is required."
      );
      return;
    }

    if (!slug.trim()) {
      toast.error(
        "Blog slug is required."
      );
      return;
    }

    if (
      !content.trim() ||
      content === "<p></p>"
    ) {
      toast.error(
        "Blog content is required."
      );
      return;
    }

    try {
      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "slug",
        slug.trim()
      );

      formData.append(
        "excerpt",
        excerpt.trim()
      );

      formData.append(
        "content",
        content
      );

      formData.append(
        "published",
        String(published)
      );

      if (image) {
        formData.append(
          "image",
          image
        );
      }


      const response =
        await fetch(
          `/api/blogs/${id}`,
          {
            method: "PUT",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to update blog."
        );
      }

 

      toast.success(
        data.message ||
          "Blog updated successfully."
      );

 

      router.push("/main/blog");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update blog."
      );
    } finally {
      setSaving(false);
    }
  }



  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-zinc-500">
          Loading blog...
        </p>
      </div>
    );
  }



  if (!blog) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-500">
          Blog not found.
        </p>

        <Link
          href="/main/blog"
          className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Back to Blog
        </Link>
      </div>
    );
  }



  return (
    <div className="mx-auto max-w-5xl space-y-8">

      {/* ========================================
          Header
          ======================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Edit Blog
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Update your blog article.
          </p>
        </div>

        <Link
          href="/main/blog"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Cancel
        </Link>
      </div>

      {/* ========================================
          Form
          ======================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* ========================================
            Article Information
            ======================================== */}

        <div className="rounded-xl border border-zinc-200 bg-white p-6">

          <h2 className="text-base font-semibold text-zinc-900">
            Article Information
          </h2>

          <div className="mt-6 space-y-5">

            {/* Title */}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Enter blog title"
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-zinc-900"
                required
              />
            </div>

            {/* Slug */}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Slug
              </label>

              <input
                type="text"
                value={slug}
                onChange={(event) =>
                  setSlug(
                    event.target.value
                  )
                }
                placeholder="blog-slug"
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-zinc-900"
                required
              />
            </div>

            {/* Excerpt */}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Excerpt
              </label>

              <textarea
                value={excerpt}
                onChange={(event) =>
                  setExcerpt(
                    event.target.value
                  )
                }
                placeholder="Short description of the article"
                rows={4}
                className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-zinc-900"
              />
            </div>

          </div>
        </div>

        {/* ========================================
            Content
            ======================================== */}

        <div className="rounded-xl border border-zinc-200 bg-white p-6">

          <h2 className="text-base font-semibold text-zinc-900">
            Content
          </h2>

          <div className="mt-6">
            <BlogEditor
              value={content}
              onChange={setContent}
            />
          </div>

        </div>

        {/* ========================================
            Featured Image
            ======================================== */}

        <div className="rounded-xl border border-zinc-200 bg-white p-6">

          <h2 className="text-base font-semibold text-zinc-900">
            Featured Image
          </h2>

          <div className="mt-6 space-y-4">

            {imagePreview && (
              <div className="overflow-hidden rounded-lg border border-zinc-200">
                <img
                  src={imagePreview}
                  alt={title}
                  className="h-64 w-full object-cover"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleImageChange
              }
              className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
            />

            <p className="text-xs text-zinc-500">
              Leave empty to keep the
              current image.
            </p>

          </div>
        </div>

        {/* ========================================
            Publishing
            ======================================== */}

        <div className="rounded-xl border border-zinc-200 bg-white p-6">

          <h2 className="text-base font-semibold text-zinc-900">
            Publishing
          </h2>

          <div className="mt-5 flex items-center justify-between rounded-lg border border-zinc-200 p-4">

            <div>
              <p className="text-sm font-medium text-zinc-900">
                Publish article
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Published articles are
                visible on the website.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setPublished(
                  !published
                )
              }
              className={`relative h-6 w-11 rounded-full transition ${
                published
                  ? "bg-zinc-900"
                  : "bg-zinc-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  published
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>

          </div>
        </div>

        {/* ========================================
            Actions
            ======================================== */}

        <div className="flex items-center justify-end gap-3 pb-8">

          <Link
            href="/main/blog"
            className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </form>
    </div>
  );
}