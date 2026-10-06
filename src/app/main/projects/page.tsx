"use client";

import Link from "next/link";
import {
  Search,
  Plus,
  FolderKanban,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

interface Project {
  id: number;
  title: string;
  client: string | null;
  year: number | null;
  type: string | null;
  category: string | null;
  imageUrl: string | null;
  createdAt: string;
}

interface ProjectResponse {
  success: boolean;
  projects?: Project[];
  message?: string;
  error?: string;
}

interface DeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  /*
   * ========================================
   * Fetch Projects
   * ========================================
   */

  async function fetchProjects() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/projects",
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const data: ProjectResponse =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to fetch projects."
        );
      }

      setProjects(
        data.projects ?? []
      );
    } catch (error) {
      setProjects([]);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  /*
   * ========================================
   * Delete
   * ========================================
   */

  async function handleDelete(
    project: Project
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${project.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        project.id
      );

      setError("");

      const response =
        await fetch(
          `/api/projects/${project.id}`,
          {
            method: "DELETE",
          }
        );

      const data: DeleteResponse =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to delete project."
        );
      }

      setProjects(
        (currentProjects) =>
          currentProjects.filter(
            (item) =>
              item.id !==
              project.id
          )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete project."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * ========================================
   * Search & Filter
   * ========================================
   */

  const filteredProjects =
    useMemo(() => {
      return projects.filter(
        (project) => {
          const searchValue =
            search
              .trim()
              .toLowerCase();

          const matchesSearch =
            project.title
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            project.client
              ?.toLowerCase()
              .includes(
                searchValue
              );

          const matchesFilter =
            filter === "All" ||
            project.category ===
              filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      projects,
      search,
      filter,
    ]);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-zinc-400">
            <span>Dashboard</span>

            <span>/</span>

            <span className="text-zinc-600">
              Projects
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Projects
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage projects displayed on the company website.
          </p>
        </div>

        <Link
          href="/main/projects/create"
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-medium text-white transition hover:bg-amber-600"
        >
          <Plus size={17} />

          Create Project
        </Link>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            Something went wrong
          </p>

          <p className="mt-1 text-xs text-red-600">
            {error}
          </p>
        </div>
      )}

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
              placeholder="Search projects..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-700 outline-none transition placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
            />
          </div>

          {/* Filter */}

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value
              )
            }
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-600 outline-none focus:border-amber-500"
          >
            <option value="All">
              All Categories
            </option>

            <option value="Web Development">
              Web Development
            </option>

            <option value="Mobile Development">
              Mobile Development
            </option>

            <option value="Team Extensions">
              Team Extensions
            </option>
          </select>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Project
                </th>

                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Client
                </th>

                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Year
                </th>

                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Category
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
                    colSpan={5}
                    className="px-5 py-16 text-center"
                  >
                    <p className="text-sm text-zinc-400">
                      Loading projects...
                    </p>
                  </td>
                </tr>
              ) : filteredProjects.length >
                0 ? (
                filteredProjects.map(
                  (project) => {
                    const isDeleting =
                      deletingId ===
                      project.id;

                    return (
                      <tr
                        key={project.id}
                        className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50"
                      >
                        {/* Project */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                              {project.imageUrl ? (
                                <img
                                  src={
                                    project.imageUrl
                                  }
                                  alt={
                                    project.title
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-zinc-400">
                                  <FolderKanban
                                    size={
                                      18
                                    }
                                  />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-zinc-900">
                                {
                                  project.title
                                }
                              </p>

                              <p className="mt-1 truncate text-xs text-zinc-400">
                                {
                                  project.type ||
                                  "—"
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Client */}

                        <td className="px-5 py-4 text-sm text-zinc-500">
                          {project.client ||
                            "—"}
                        </td>

                        {/* Year */}

                        <td className="px-5 py-4 text-sm text-zinc-500">
                          {project.year ||
                            "—"}
                        </td>

                        {/* Category */}

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                            {project.category ||
                              "Uncategorized"}
                          </span>
                        </td>

                        {/* Actions */}

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit */}

                            <Link
                              href={`/main/projects/${project.id}/edit`}
                              title="Edit project"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                            >
                              <Pencil
                                size={
                                  16
                                }
                              />
                            </Link>

                            {/* Delete */}

                            <button
                              type="button"
                              title="Delete project"
                              disabled={
                                isDeleting
                              }
                              onClick={() =>
                                handleDelete(
                                  project
                                )
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2
                                size={
                                  16
                                }
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              ) : (
                /* Empty */

                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-16 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                        <FolderKanban
                          size={20}
                        />
                      </div>

                      <p className="mt-3 text-sm font-medium text-zinc-700">
                        No projects found
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        Try another search
                        or create a new
                        project.
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
            {
              filteredProjects.length
            }{" "}
            of{" "}
            {projects.length}{" "}
            projects
          </p>
        </div>
      </div>
    </div>
  );
}