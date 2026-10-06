"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

interface Technology {
  name: string;
}

interface Project {
  id: number;
  title: string;
  slug: string;

  client: string | null;
  year: number | null;
  type: string | null;
  clientLocation: string | null;
  link: string | null;
  category: string | null;

  devices: string[];

  projectDetails: string | null;
  ourResponsibility: string | null;

  responsibilities: string[];
  technologies: Technology[];

  // Sesuai dengan field database Prisma
  imageUrl: string | null;
  projectDetailsImageUrl: string | null;
  ourResponsibilityImageUrl: string | null;
  galleryImageUrl: string | null;
}

type ImageType =
  | "main"
  | "projectDetails"
  | "responsibility"
  | "gallery";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [project, setProject] =
    useState<Project | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [client, setClient] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState("");
  const [clientLocation, setClientLocation] =
    useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("");

  const [devices, setDevices] =
    useState<string[]>([]);

  const [projectDetails, setProjectDetails] =
    useState("");

  const [ourResponsibility, setOurResponsibility] =
    useState("");

  const [responsibilities, setResponsibilities] =
    useState<string[]>([""]);

  const [technologies, setTechnologies] =
    useState<Technology[]>([
      {
        name: "",
      },
    ]);

  /*
   * ========================================
   * New Image Files
   * ========================================
   */

  const [mainImage, setMainImage] =
    useState<File | null>(null);

  const [projectDetailsImage, setProjectDetailsImage] =
    useState<File | null>(null);

  const [responsibilityImage, setResponsibilityImage] =
    useState<File | null>(null);

  const [galleryImage, setGalleryImage] =
    useState<File | null>(null);

  /*
   * ========================================
   * Image Preview
   *
   * Bisa berupa:
   * - URL Supabase Storage
   * - blob URL dari File baru
   * ========================================
   */

  const [mainImagePreview, setMainImagePreview] =
    useState("");

  const [
    projectDetailsImagePreview,
    setProjectDetailsImagePreview,
  ] = useState("");

  const [
    responsibilityImagePreview,
    setResponsibilityImagePreview,
  ] = useState("");

  const [
    galleryImagePreview,
    setGalleryImagePreview,
  ] = useState("");

  /*
   * ========================================
   * Remove Existing Image
   * ========================================
   */

  const [removeMainImage, setRemoveMainImage] =
    useState(false);

  const [
    removeProjectDetailsImage,
    setRemoveProjectDetailsImage,
  ] = useState(false);

  const [
    removeResponsibilityImage,
    setRemoveResponsibilityImage,
  ] = useState(false);

  const [
    removeGalleryImage,
    setRemoveGalleryImage,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ========================================
   * Load Project
   * ========================================
   */

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/projects/${id}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to load project."
          );
        }

        const projectData: Project =
          data.project;

        setProject(projectData);

        /*
         * ========================================
         * Basic Information
         * ========================================
         */

        setTitle(projectData.title || "");
        setSlug(projectData.slug || "");

        setClient(
          projectData.client || ""
        );

        setYear(
          projectData.year !== null &&
            projectData.year !== undefined
            ? String(projectData.year)
            : ""
        );

        setType(
          projectData.type || ""
        );

        setClientLocation(
          projectData.clientLocation || ""
        );

        setLink(
          projectData.link || ""
        );

        setCategory(
          projectData.category || ""
        );

        /*
         * ========================================
         * Devices
         * ========================================
         */

        setDevices(
          Array.isArray(projectData.devices)
            ? projectData.devices
            : []
        );

        /*
         * ========================================
         * Project Details
         * ========================================
         */

        setProjectDetails(
          projectData.projectDetails || ""
        );

        setOurResponsibility(
          projectData.ourResponsibility || ""
        );

        /*
         * ========================================
         * Responsibilities
         * ========================================
         */

        setResponsibilities(
          Array.isArray(
            projectData.responsibilities
          ) &&
            projectData.responsibilities.length > 0
            ? projectData.responsibilities
            : [""]
        );

        /*
         * ========================================
         * Technologies
         * ========================================
         */

        setTechnologies(
          Array.isArray(
            projectData.technologies
          ) &&
            projectData.technologies.length > 0
            ? projectData.technologies
            : [
                {
                  name: "",
                },
              ]
        );

        /*
         * ========================================
         * EXISTING IMAGES
         *
         * Ambil langsung dari URL Supabase
         * yang tersimpan di database.
         * ========================================
         */

        setMainImagePreview(
          projectData.imageUrl || ""
        );

        setProjectDetailsImagePreview(
          projectData.projectDetailsImageUrl || ""
        );

        setResponsibilityImagePreview(
          projectData.ourResponsibilityImageUrl || ""
        );

        setGalleryImagePreview(
          projectData.galleryImageUrl || ""
        );

        /*
         * Reset remove state
         */

        setRemoveMainImage(false);
        setRemoveProjectDetailsImage(false);
        setRemoveResponsibilityImage(false);
        setRemoveGalleryImage(false);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load project."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProject();
    }
  }, [id]);

  /*
   * ========================================
   * Slug
   * ========================================
   */

  const generateSlug = (
    value: string
  ) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (
    value: string
  ) => {
    setTitle(value);
  };

  /*
   * ========================================
   * Device
   * ========================================
   */

  const toggleDevice = (
    device: string
  ) => {
    setDevices((current) =>
      current.includes(device)
        ? current.filter(
            (item) => item !== device
          )
        : [...current, device]
    );
  };

  /*
   * ========================================
   * Responsibilities
   * ========================================
   */

  const addResponsibility = () => {
    setResponsibilities((current) => [
      ...current,
      "",
    ]);
  };

  const removeResponsibility = (
    index: number
  ) => {
    setResponsibilities((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const updateResponsibility = (
    index: number,
    value: string
  ) => {
    setResponsibilities((current) =>
      current.map(
        (item, itemIndex) =>
          itemIndex === index
            ? value
            : item
      )
    );
  };

  /*
   * ========================================
   * Technologies
   * ========================================
   */

  const addTechnology = () => {
    setTechnologies((current) => [
      ...current,
      {
        name: "",
      },
    ]);
  };

  const removeTechnology = (
    index: number
  ) => {
    setTechnologies((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const updateTechnology = (
    index: number,
    value: string
  ) => {
    setTechnologies((current) =>
      current.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                name: value,
              }
            : item
      )
    );
  };

  /*
   * ========================================
   * Image Change
   * ========================================
   */

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
    type: ImageType
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    /*
     * Hapus status remove karena
     * user memilih gambar baru.
     */

    if (type === "main") {
      setMainImage(file);
      setMainImagePreview(
        URL.createObjectURL(file)
      );
      setRemoveMainImage(false);
    }

    if (type === "projectDetails") {
      setProjectDetailsImage(file);
      setProjectDetailsImagePreview(
        URL.createObjectURL(file)
      );
      setRemoveProjectDetailsImage(false);
    }

    if (type === "responsibility") {
      setResponsibilityImage(file);
      setResponsibilityImagePreview(
        URL.createObjectURL(file)
      );
      setRemoveResponsibilityImage(false);
    }

    if (type === "gallery") {
      setGalleryImage(file);
      setGalleryImagePreview(
        URL.createObjectURL(file)
      );
      setRemoveGalleryImage(false);
    }

    /*
     * Reset input agar file yang sama
     * bisa dipilih kembali.
     */

    event.target.value = "";
  };

  /*
   * ========================================
   * Remove Image
   * ========================================
   */

  const handleRemoveImage = (
    type: ImageType
  ) => {
    if (type === "main") {
      setMainImage(null);
      setMainImagePreview("");
      setRemoveMainImage(true);
    }

    if (type === "projectDetails") {
      setProjectDetailsImage(null);
      setProjectDetailsImagePreview("");
      setRemoveProjectDetailsImage(true);
    }

    if (type === "responsibility") {
      setResponsibilityImage(null);
      setResponsibilityImagePreview("");
      setRemoveResponsibilityImage(true);
    }

    if (type === "gallery") {
      setGalleryImage(null);
      setGalleryImagePreview("");
      setRemoveGalleryImage(true);
    }
  };

  /*
   * ========================================
   * Submit
   * ========================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const formData =
        new FormData();

      formData.append(
        "title",
        title
      );

      formData.append(
        "slug",
        slug
      );

      formData.append(
        "client",
        client
      );

      formData.append(
        "year",
        year
      );

      formData.append(
        "type",
        type
      );

      formData.append(
        "clientLocation",
        clientLocation
      );

      formData.append(
        "link",
        link
      );

      formData.append(
        "category",
        category
      );

      formData.append(
        "devices",
        JSON.stringify(devices)
      );

      formData.append(
        "projectDetails",
        projectDetails
      );

      formData.append(
        "ourResponsibility",
        ourResponsibility
      );

      formData.append(
        "responsibilities",
        JSON.stringify(
          responsibilities
            .map((item) => item.trim())
            .filter(Boolean)
        )
      );

      formData.append(
        "technologies",
        JSON.stringify(
          technologies
            .filter(
              (technology) =>
                technology.name.trim()
            )
            .map((technology) => ({
              name: technology.name.trim(),
            }))
        )
      );

      /*
       * ========================================
       * Remove Existing Images
       * ========================================
       */

      formData.append(
        "removeImage",
        String(removeMainImage)
      );

      formData.append(
        "removeProjectDetailsImage",
        String(removeProjectDetailsImage)
      );

      formData.append(
        "removeResponsibilityImage",
        String(removeResponsibilityImage)
      );

      formData.append(
        "removeGalleryImage",
        String(removeGalleryImage)
      );

      /*
       * ========================================
       * New Images
       * ========================================
       */

      if (mainImage) {
        formData.append(
          "image",
          mainImage
        );
      }

      if (projectDetailsImage) {
        formData.append(
          "projectDetailsImage",
          projectDetailsImage
        );
      }

      if (responsibilityImage) {
        formData.append(
          "responsibilityImage",
          responsibilityImage
        );
      }

      if (galleryImage) {
        formData.append(
          "galleryImage",
          galleryImage
        );
      }

      /*
       * ========================================
       * PUT
       * ========================================
       */

      const response =
        await fetch(
          `/api/projects/${id}`,
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
            "Failed to update project."
        );
      }

      router.push(
        "/main/projects"
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update project."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ========================================
   * Loading
   * ========================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-zinc-500">
          Loading project...
        </p>
      </div>
    );
  }

  /*
   * ========================================
   * Not Found
   * ========================================
   */

  if (!project) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-500">
          {error ||
            "Project not found."}
        </p>

        <Link
          href="/main/projects"
          className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  /*
   * ========================================
   * UI
   * ========================================
   */

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Edit Project
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Update your project information.
          </p>
        </div>

        <Link
          href="/main/projects"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Cancel
        </Link>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* BASIC INFORMATION */}

        <Section
          title="Basic Information"
          description="Set the main information for this project."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Project Title"
              required
            >
              <input
                value={title}
                onChange={(event) =>
                  handleTitleChange(
                    event.target.value
                  )
                }
                placeholder="e.g. RedBalloon"
                className={inputClass}
                required
              />
            </Field>

            <Field
              label="Slug"
              required
            >
              <input
                value={slug}
                onChange={(event) =>
                  setSlug(
                    generateSlug(
                      event.target.value
                    )
                  )
                }
                placeholder="e.g. red-balloon"
                className={inputClass}
                required
              />
            </Field>
          </div>

          <ImageUpload
            label="Main Project Image"
            preview={mainImagePreview}
            file={mainImage}
            onChange={(event) =>
              handleImageChange(
                event,
                "main"
              )
            }
            onRemove={() =>
              handleRemoveImage("main")
            }
          />
        </Section>

        {/* CLIENT */}

        <Section
          title="Client Information"
          description="Information about the client and project."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Client">
              <input
                value={client}
                onChange={(event) =>
                  setClient(
                    event.target.value
                  )
                }
                placeholder="e.g. RedBalloon"
                className={inputClass}
              />
            </Field>

            <Field label="Year">
              <input
                type="number"
                value={year}
                onChange={(event) =>
                  setYear(
                    event.target.value
                  )
                }
                placeholder="e.g. 2016"
                className={inputClass}
              />
            </Field>

            <Field label="Type">
              <input
                value={type}
                onChange={(event) =>
                  setType(
                    event.target.value
                  )
                }
                placeholder="e.g. Team Extensions"
                className={inputClass}
              />
            </Field>

            <Field label="Client Location">
              <input
                value={clientLocation}
                onChange={(event) =>
                  setClientLocation(
                    event.target.value
                  )
                }
                placeholder="e.g. Sydney, Australia"
                className={inputClass}
              />
            </Field>

            <Field label="Project Link">
              <input
                type="url"
                value={link}
                onChange={(event) =>
                  setLink(
                    event.target.value
                  )
                }
                placeholder="https://example.com"
                className={inputClass}
              />
            </Field>

            <Field label="Category">
              <input
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
                placeholder="e.g. Web Development"
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        {/* DEVICE */}

        <Section
          title="Device"
          description="Select the devices supported by the project."
        >
          <div className="flex flex-wrap gap-3">
            {[
              "Desktop",
              "Mobile",
            ].map((device) => {
              const active =
                devices.includes(device);

              return (
                <button
                  key={device}
                  type="button"
                  onClick={() =>
                    toggleDevice(device)
                  }
                  className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition ${
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {device}
                </button>
              );
            })}
          </div>
        </Section>

        {/* PROJECT DETAILS */}

        <Section
          title="Project Details"
          description="Describe the project and its background."
        >
          <Field label="Description">
            <textarea
              value={projectDetails}
              onChange={(event) =>
                setProjectDetails(
                  event.target.value
                )
              }
              placeholder="Describe the project, its purpose, background, and key information..."
              rows={7}
              className={textareaClass}
            />
          </Field>

          <ImageUpload
            label="Project Details Image"
            preview={
              projectDetailsImagePreview
            }
            file={
              projectDetailsImage
            }
            onChange={(event) =>
              handleImageChange(
                event,
                "projectDetails"
              )
            }
            onRemove={() =>
              handleRemoveImage(
                "projectDetails"
              )
            }
          />
        </Section>

        {/* OUR RESPONSIBILITY */}

        <Section
          title="Our Responsibility"
          description="Describe the work handled by the team."
        >
          <Field label="Description">
            <textarea
              value={ourResponsibility}
              onChange={(event) =>
                setOurResponsibility(
                  event.target.value
                )
              }
              placeholder="Describe the responsibilities and contributions of the team..."
              rows={7}
              className={textareaClass}
            />
          </Field>

          <ImageUpload
            label="Responsibility Image"
            preview={
              responsibilityImagePreview
            }
            file={
              responsibilityImage
            }
            onChange={(event) =>
              handleImageChange(
                event,
                "responsibility"
              )
            }
            onRemove={() =>
              handleRemoveImage(
                "responsibility"
              )
            }
          />
        </Section>

        {/* RESPONSIBILITIES */}

        <Section
          title="Project Responsibilities"
          description="List the roles and responsibilities involved in the project."
        >
          <div className="space-y-3">
            {responsibilities.map(
              (
                responsibility,
                index
              ) => (
                <div
                  key={index}
                  className="flex gap-3"
                >
                  <input
                    value={
                      responsibility
                    }
                    onChange={(event) =>
                      updateResponsibility(
                        index,
                        event.target.value
                      )
                    }
                    placeholder="e.g. Back End"
                    className={
                      inputClass
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeResponsibility(
                        index
                      )
                    }
                    disabled={
                      responsibilities.length ===
                      1
                    }
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              )
            )}
          </div>

          <AddButton
            onClick={
              addResponsibility
            }
            label="Add Responsibility"
          />
        </Section>

        {/* TECHNOLOGY */}

        <Section
          title="Technology Stack"
          description="Add the technologies used in this project."
        >
          <div className="space-y-3">
            {technologies.map(
              (
                technology,
                index
              ) => (
                <div
                  key={index}
                  className="flex gap-3"
                >
                  <input
                    value={
                      technology.name
                    }
                    onChange={(event) =>
                      updateTechnology(
                        index,
                        event.target.value
                      )
                    }
                    placeholder="e.g. React"
                    className={
                      inputClass
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeTechnology(
                        index
                      )
                    }
                    disabled={
                      technologies.length ===
                      1
                    }
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              )
            )}
          </div>

          <AddButton
            onClick={
              addTechnology
            }
            label="Add Technology"
          />
        </Section>

        {/* GALLERY */}

        <Section
          title="Gallery"
          description="Add one additional image for the project gallery."
        >
          <ImageUpload
            label="Gallery Image"
            preview={
              galleryImagePreview
            }
            file={galleryImage}
            onChange={(event) =>
              handleImageChange(
                event,
                "gallery"
              )
            }
            onRemove={() =>
              handleRemoveImage("gallery")
            }
          />
        </Section>

        {/* ACTION */}

        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-6 pb-8">
          <Link
            href="/main/projects"
            className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
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

/*
 * ========================================
 * Constants
 * ========================================
 */

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100";

const textareaClass =
  "w-full resize-none rounded-lg border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100";

/*
 * ========================================
 * Section
 * ========================================
 */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-6 py-5">
        <h2 className="text-base font-semibold text-zinc-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          {description}
        </p>
      </div>

      <div className="space-y-5 p-6">
        {children}
      </div>
    </section>
  );
}

/*
 * ========================================
 * Field
 * ========================================
 */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-800">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

/*
 * ========================================
 * Add Button
 * ========================================
 */

function AddButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
    >
      <Plus size={16} />

      {label}
    </button>
  );
}

/*
 * ========================================
 * Image Upload
 * ========================================
 */

function ImageUpload({
  label,
  preview,
  file,
  onChange,
  onRemove,
}: {
  label: string;
  preview: string;
  file: File | null;
  onChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-800">
        {label}
      </label>

      {preview && (
        <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          <img
            src={preview}
            alt={label}
            className="h-64 w-full object-cover"
          />

          <button
            type="button"
            onClick={onRemove}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-zinc-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-red-500"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <label className="flex min-h-24 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 text-sm text-zinc-500 transition hover:border-zinc-400 hover:bg-zinc-50">
        <Upload size={17} />

        {file
          ? "Choose another image"
          : preview
          ? "Replace image"
          : "Upload Image"}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onChange}
          className="hidden"
        />
      </label>

      {file && (
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-500 shadow-sm">
              <Upload size={17} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-800">
                {file.name}
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">
                {(
                  file.size /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}