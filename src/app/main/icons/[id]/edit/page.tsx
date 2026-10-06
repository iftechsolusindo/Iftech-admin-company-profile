"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ImagePlus,
  Save,
  Trash2,
} from "lucide-react";

interface Technology {
  id: number;
  name: string;
  iconUrl: string | null;
}

export default function EditTechnologyPage() {
  const params = useParams();
  const router = useRouter();

  const [technology, setTechnology] =
    useState<Technology | null>(null);

  const [name, setName] = useState("");
  const [iconFile, setIconFile] =
    useState<File | null>(null);
  const [iconPreview, setIconPreview] =
    useState("");

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [deleting, setDeleting] =
    useState(false);
  const [error, setError] =
    useState("");

  const id = params.id as string;

  useEffect(() => {
    async function loadTechnology() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/icons/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch technology."
          );
        }

        setTechnology(data.technology);
        setName(data.technology.name);
        setIconPreview(
          data.technology.iconUrl || ""
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load technology."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadTechnology();
    }
  }, [id]);

  function handleIconChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setIconFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setIconPreview(previewUrl);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "Technology name is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();

      formData.append(
        "name",
        name.trim()
      );

      if (iconFile) {
        formData.append(
          "icon",
          iconFile
        );
      }

      const response = await fetch(
        `/api/icons/${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update technology."
        );
      }

      router.push("/main/icons");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update technology."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `/api/icons/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete technology."
        );
      }

      router.push("/main/icons");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete technology."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-zinc-200 bg-white p-8">
          <p className="text-sm text-black">
            Loading technology...
          </p>
        </div>
      </div>
    );
  }

  if (!technology) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8">
          <p className="text-sm text-red-600">
            {error ||
              "Technology not found."}
          </p>

          <Link
            href="/main/icons"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-black transition hover:text-zinc-700"
          >
            <ArrowLeft size={16} />
            Back to technologies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/main/icons"
          className="mb-4 inline-flex items-center gap-2 text-sm text-black transition hover:text-zinc-600"
        >
          <ArrowLeft size={16} />
          Back to technologies
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-black">
          Edit Technology
        </h1>

        <p className="mt-1 text-sm text-black">
          Update the technology name or
          replace its icon.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-zinc-200 bg-white"
      >
        <div className="space-y-6 p-6">
          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Technology Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-black"
            >
              Technology Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="e.g. Laravel"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Technology Icon */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black">
              Technology Icon
            </label>

            <div className="rounded-xl border border-dashed border-zinc-300 p-6">
              <div className="flex flex-col items-center justify-center">
                {iconPreview ? (
                  <div className="mb-5 flex h-32 w-32 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-5">
                    <img
                      src={iconPreview}
                      alt={
                        name ||
                        "Technology icon"
                      }
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="mb-5 flex h-32 w-32 items-center justify-center rounded-xl bg-zinc-100">
                    <ImagePlus
                      size={32}
                      className="text-black"
                    />
                  </div>
                )}

                {/* Replace Icon */}
                <label className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-50">
                  <span>
                    {iconFile
                      ? "Change Icon"
                      : "Replace Icon"}
                  </span>

                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.svg,image/*"
                    onChange={
                      handleIconChange
                    }
                    className="hidden"
                  />
                </label>

                <p className="mt-2 text-xs text-black">
                  PNG, JPG, WEBP, or SVG
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-4">
          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={
              deleting || saving
            }
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={16} />

            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>

          <div className="flex items-center gap-3">
            {/* Cancel */}
            <Link
              href="/main/icons"
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-50"
            >
              Cancel
            </Link>

            {/* Save */}
            <button
              type="submit"
              disabled={
                saving || deleting
              }
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}