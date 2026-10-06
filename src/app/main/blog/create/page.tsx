"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  ImagePlus,
  Save,
  Send,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import BlogEditor from "../../../components/blogeditor";

export default function CreateBlogPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const [image, setImage] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    setSlug(generateSlug(value));
  }

  async function handleSubmit(
    status: "draft" | "published"
  ) {
    if (!title.trim()) {
      toast.error(
        "Judul blog harus diisi terlebih dahulu."
      );
      return;
    }

    if (!slug.trim()) {
      toast.error(
        "Slug blog harus diisi terlebih dahulu."
      );
      return;
    }

    if (
      !content.trim() ||
      content === "<p></p>"
    ) {
      toast.error(
        "Konten blog harus diisi terlebih dahulu."
      );
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

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
        String(status === "published")
      );

      if (image) {
        formData.append(
          "image",
          image
        );
      }

      const response = await fetch(
        "/api/blogs",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.message ||
            data.error ||
            "Gagal menyimpan blog."
        );

        return;
      }

      toast.success(
        status === "published"
          ? "Blog berhasil dipublish."
          : "Blog berhasil disimpan sebagai draft."
      );

      setTitle("");
      setSlug("");
      setExcerpt("");
      setContent("");
      setImage(null);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan blog."
      );
    } finally {
      setLoading(false);
    }
  }

  function handlePreview() {
    toast.info(
      "Preview akan tersedia setelah halaman blog publik dibuat."
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/main/blog"
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-100"
          >
            <ArrowLeft size={17} />
          </Link>

          <div>
            <div className="mb-1 flex items-center gap-2 text-xs text-zinc-400">
              <Link
                href="/main/blog"
                className="transition hover:text-zinc-700"
              >
                Blog
              </Link>

              <span>/</span>

              <span className="text-zinc-600">
                Create
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Create Blog
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Create a new article for the
              IFTECH Solusindo website.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview */}
          <button
            type="button"
            disabled={loading}
            onClick={handlePreview}
            className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            <Eye size={16} />

            Preview
          </button>

          {/* Save Draft */}
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              handleSubmit("draft")
            }
            className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            <Save size={16} />

            {loading
              ? "Saving..."
              : "Save Draft"}
          </button>

          {/* Publish */}
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              handleSubmit("published")
            }
            className="flex h-10 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
          >
            <Send size={16} />

            {loading
              ? "Publishing..."
              : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
        {/* Main */}
        <div className="min-w-0 space-y-6">
          {/* Article Information */}
          <section className="space-y-5 rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
              <FileText
                size={18}
                className="text-amber-500"
              />

              <h2 className="text-sm font-semibold text-zinc-900">
                Article Information
              </h2>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-zinc-700"
              >
                Blog Title{" "}
                <span className="text-amber-500">
                  *
                </span>
              </label>

              <input
                id="title"
                value={title}
                onChange={(e) =>
                  handleTitleChange(
                    e.target.value
                  )
                }
                placeholder="Enter your blog title"
                className="h-12 w-full rounded-lg border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-zinc-700"
              >
                URL Slug{" "}
                <span className="text-amber-500">
                  *
                </span>
              </label>

              <div className="flex min-h-11 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-4">
                <span className="mr-1 shrink-0 text-xs text-zinc-400">
                  /blog/
                </span>

                <input
                  id="slug"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      generateSlug(
                        e.target.value
                      )
                    )
                  }
                  placeholder="blog-url-slug"
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <label
                htmlFor="excerpt"
                className="block text-sm font-medium text-zinc-700"
              >
                Excerpt
              </label>

              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) =>
                  setExcerpt(
                    e.target.value
                  )
                }
                rows={3}
                placeholder="Write a short summary of your article..."
                className="w-full resize-y rounded-lg border border-zinc-200 px-4 py-3 text-sm leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
              />

              <p className="text-right text-xs text-zinc-400">
                {excerpt.length} characters
              </p>
            </div>
          </section>

          {/* Content */}
          <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="border-b border-zinc-100 pb-4">
              <h2 className="text-sm font-semibold text-zinc-900">
                Article Content
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Write and format your article
                content.
              </p>
            </div>

            <BlogEditor
              onChange={setContent}
            />

            <p className="text-right text-xs text-zinc-400">
              {
                content
                  .replace(/<[^>]*>/g, "")
                  .trim().length
              }{" "}
              characters
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Publishing */}
          <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-zinc-900">
              Publishing
            </h2>

            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500">
                Status
              </p>

              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                <span className="h-2 w-2 rounded-full bg-zinc-400" />

                <span className="text-sm text-zinc-700">
                  Draft
                </span>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleSubmit("draft")
                }
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                <Save size={15} />

                Save as Draft
              </button>
            </div>
          </section>

          {/* Featured Image */}
          <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Featured Image
              </h2>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Choose the main image for your
                article.
              </p>
            </div>

            <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 text-center transition hover:border-amber-400 hover:bg-amber-50/30">
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm">
                <ImagePlus size={19} />
              </span>

              <span className="text-xs font-medium text-zinc-700">
                {image
                  ? image.name
                  : "Click to upload"}
              </span>

              <span className="mt-1 text-[11px] text-zinc-400">
                PNG, JPG or WEBP
              </span>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const selectedFile =
                    e.target.files?.[0] ??
                    null;

                  setImage(
                    selectedFile
                  );
                }}
              />
            </label>
          </section>

          {/* SEO */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-zinc-900">
              SEO Information
            </h2>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Search preview artikel.
            </p>

            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-zinc-500">
                Search preview
              </p>

              <div className="rounded-lg bg-zinc-50 p-3">
                <p className="text-sm font-medium text-blue-700">
                  {title ||
                    "Blog title preview"}
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  iftechsolusindo.com/blog/
                  {slug || "blog-slug"}
                </p>

                <p className="mt-1 line-clamp-3 text-xs leading-5 text-zinc-500">
                  {excerpt ||
                    "Your article excerpt will appear here."}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}