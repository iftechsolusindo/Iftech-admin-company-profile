"use client";

import Link from "next/link";
import {
  Search,
  Plus,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Blog {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  updatedAt: string;
}

interface BlogResponse {
  success: boolean;
  blogs?: Blog[];
  message?: string;
  error?: string;
}

interface DeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  async function fetchBlogs() {
    try {
      setLoading(true);

      const response = await fetch("/api/blogs", {
        method: "GET",
        cache: "no-store",
      });

      const data: BlogResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to fetch blogs."
        );
      }

      setBlogs(data.blogs ?? []);
    } catch (error) {
      setBlogs([]);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load blogs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function handleDelete(blog: Blog) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${blog.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(blog.id);

      const response = await fetch(
        `/api/blogs/${blog.id}`,
        {
          method: "DELETE",
        }
      );

      const data: DeleteResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to delete blog."
        );
      }

      setBlogs((currentBlogs) =>
        currentBlogs.filter(
          (item) => item.id !== blog.id
        )
      );

      toast.success(
        data.message ||
          "Blog deleted successfully."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete blog."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredBlogs = blogs.filter((blog) => {
    const searchValue =
      search.trim().toLowerCase();

    const matchesSearch =
      blog.title
        .toLowerCase()
        .includes(searchValue) ||
      blog.slug
        .toLowerCase()
        .includes(searchValue);

    const status = blog.published
      ? "Published"
      : "Draft";

    const matchesStatus =
      statusFilter === "All Status" ||
      status === statusFilter;

    return (
      matchesSearch &&
      matchesStatus
    );
  });

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-zinc-400">
            <span>Dashboard</span>

            <span>/</span>

            <span className="text-zinc-600">
              Blog
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Blog
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage your articles and
            publications.
          </p>
        </div>

        <Link
          href="/main/blog/create"
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-medium text-white transition hover:bg-amber-600"
        >
          <Plus size={17} />

          Create Blog
        </Link>
      </div>

      {/* Toolbar */}
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-700 outline-none transition placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
            />
          </div>

          {/* Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-600 outline-none focus:border-amber-500"
          >
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Article
                </th>

                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Status
                </th>

                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Updated
                </th>

                <th className="w-28 px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Loading */}
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-16 text-center"
                  >
                    <p className="text-sm text-zinc-400">
                      Loading articles...
                    </p>
                  </td>
                </tr>
              ) : filteredBlogs.length > 0 ? (
                filteredBlogs.map((blog) => {
                  const status = blog.published
                    ? "Published"
                    : "Draft";

                  const isDeleting =
                    deletingId === blog.id;

                  return (
                    <tr
                      key={blog.id}
                      className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50"
                    >
                      {/* Article */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                            <FileText size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-900">
                              {blog.title}
                            </p>

                            <p className="mt-1 truncate text-xs text-zinc-400">
                              /blog/
                              {blog.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {status === "Published" ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />

                            Draft
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-sm text-zinc-500">
                        {formatDate(
                          blog.updatedAt
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit */}
                          <Link
                            href={`/main/blog/${blog.id}/edit`}
                            title="Edit blog"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                          >
                            <Pencil size={16} />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            title="Delete blog"
                            disabled={isDeleting}
                            onClick={() =>
                              handleDelete(blog)
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Empty */
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-16 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                        <FileText size={20} />
                      </div>

                      <p className="mt-3 text-sm font-medium text-zinc-700">
                        No articles found
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        Try another search
                        or create a new
                        article.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3">
          <p className="text-xs text-zinc-400">
            Showing{" "}
            {filteredBlogs.length} of{" "}
            {blogs.length} articles
          </p>
        </div>
      </div>
    </div>
  );
}