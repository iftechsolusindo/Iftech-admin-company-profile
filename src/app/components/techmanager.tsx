"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Upload,
  X,
  Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Technology {
  id: number;
  name: string;
  iconUrl: string | null;
}

export default function TechnologyManager() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [technologies, setTechnologies] =
    useState<Technology[]>([]);

  const [name, setName] = useState("");

  const [icon, setIcon] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [loadingList, setLoadingList] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const loadTechnologies = async () => {
    try {
      setLoadingList(true);

      const response = await fetch(
        "/api/icons",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get("content-type");

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        throw new Error(
          `API returned ${response.status}. Make sure /api/icons/route.ts exists.`
        );
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to load technologies."
        );
      }

      setTechnologies(
        result.technologies ?? []
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to load technologies."
      );
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadTechnologies();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert(
        "Technology name is required."
      );
      return;
    }

    if (!icon) {
      alert(
        "Technology icon is required."
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append(
        "name",
        name.trim()
      );

      formData.append("icon", icon);

      const response = await fetch(
        "/api/icons",
        {
          method: "POST",
          body: formData,
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        throw new Error(
          `API returned ${response.status}. Make sure /api/icons/route.ts exists.`
        );
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to create technology."
        );
      }

      setName("");
      setIcon(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadTechnologies();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create technology."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveIcon = () => {
    setIcon(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = (id: number) => {
    router.push(
      `/main/icons/${id}/edit`
    );
  };

  const handleDelete = async (
    technology: Technology
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${technology.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(technology.id);

      const response = await fetch(
        `/api/icons/${technology.id}`,
        {
          method: "DELETE",
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        throw new Error(
          `API returned ${response.status}.`
        );
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to delete technology."
        );
      }

      setTechnologies((current) =>
        current.filter(
          (item) =>
            item.id !== technology.id
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete technology."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* Add Technology */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-black">
            Add Technology
          </h2>

          <p className="mt-1 text-sm text-black">
            Add a technology and its icon.
          </p>
        </div>

        <div className="space-y-5">
          {/* Technology Name */}
          <div>
            <label
              htmlFor="technology-name"
              className="mb-2 block text-sm font-medium text-black"
            >
              Technology Name
            </label>

            <input
              id="technology-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter technology name"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-black placeholder:text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Technology Icon */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black">
              Technology Icon
            </label>

            <div className="flex items-center gap-3">
              <label
                htmlFor="technology-icon"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-100"
              >
                <Upload size={18} />

                <span>
                  Choose Icon
                </span>
              </label>

              <input
                ref={fileInputRef}
                id="technology-icon"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0] ??
                    null;

                  setIcon(file);
                }}
                className="hidden"
              />
            </div>

            {icon && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-white">
                    <img
                      src={URL.createObjectURL(icon)}
                      alt={icon.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-black">
                      {icon.name}
                    </p>

                    <p className="text-xs text-black">
                      {(
                        icon.size /
                        1024
                      ).toFixed(1)}{" "}
                      KB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveIcon}
                  className="ml-3 rounded-md p-2 text-black transition hover:bg-zinc-200"
                  title="Remove icon"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={18} />

              {loading
                ? "Adding..."
                : "Add Technology"}
            </button>
          </div>
        </div>
      </div>

      {/* Technology List */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-black">
            Technology List
          </h2>

          <p className="mt-1 text-sm text-black">
            Manage the technologies used
            across your projects.
          </p>
        </div>

        {loadingList ? (
          <div className="py-10 text-center">
            <p className="text-sm text-black">
              Loading technologies...
            </p>
          </div>
        ) : technologies.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 py-10 text-center">
            <p className="text-sm text-black">
              No technologies found.
            </p>

            <p className="mt-1 text-xs text-black">
              Add your first technology
              above.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200">
            <div className="divide-y divide-zinc-200">
              {technologies.map(
                (technology) => (
                  <div
                    key={technology.id}
                    className="flex items-center justify-between gap-4 px-4 py-4"
                  >
                    {/* Technology Info */}
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white">
                        {technology.iconUrl ? (
                          <img
                            src={
                              technology.iconUrl
                            }
                            alt={
                              technology.name
                            }
                            className="h-9 w-9 object-contain"
                          />
                        ) : (
                          <span className="text-xs text-black">
                            No Icon
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-black">
                          {technology.name}
                        </p>

                        <p className="mt-1 text-xs text-black">
                          Technology ID:{" "}
                          {technology.id}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(
                            technology.id
                          )
                        }
                        className="rounded-lg border border-zinc-300 p-2 text-black transition hover:bg-zinc-100"
                        title="Edit technology"
                      >
                        <Pencil
                          size={18}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            technology
                          )
                        }
                        disabled={
                          deletingId ===
                          technology.id
                        }
                        className="rounded-lg border border-zinc-300 p-2 text-black transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete technology"
                      >
                        <Trash2
                          size={18}
                        />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}