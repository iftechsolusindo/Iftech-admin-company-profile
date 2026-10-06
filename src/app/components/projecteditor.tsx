"use client";

import { useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

interface Technology {
  name: string;
  icon: string;
}

export default function ProjectEditor() {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const projectDetailsImageRef =
    useRef<HTMLInputElement>(null);
  const responsibilityImageRef =
    useRef<HTMLInputElement>(null);
  const galleryImageRef =
    useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [client, setClient] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState("");
  const [clientLocation, setClientLocation] =
    useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("");

  const [devices, setDevices] = useState<string[]>([]);

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
        icon: "",
      },
    ]);

  const [mainImage, setMainImage] =
    useState<File | null>(null);

  const [projectDetailsImage, setProjectDetailsImage] =
    useState<File | null>(null);

  const [responsibilityImage, setResponsibilityImage] =
    useState<File | null>(null);

  const [galleryImage, setGalleryImage] =
    useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);

    if (!slug) {
      setSlug(generateSlug(value));
    }
  };

  const toggleDevice = (device: string) => {
    setDevices((current) =>
      current.includes(device)
        ? current.filter((item) => item !== device)
        : [...current, device]
    );
  };

  const addResponsibility = () => {
    setResponsibilities((current) => [
      ...current,
      "",
    ]);
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  const updateResponsibility = (
    index: number,
    value: string
  ) => {
    setResponsibilities((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    );
  };

  const addTechnology = () => {
    setTechnologies((current) => [
      ...current,
      {
        name: "",
        icon: "",
      },
    ]);
  };

  const removeTechnology = (index: number) => {
    setTechnologies((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  const updateTechnology = (
    index: number,
    field: keyof Technology,
    value: string
  ) => {
    setTechnologies((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("slug", slug);
      formData.append(
        "description",
        description
      );

      formData.append("client", client);
      formData.append("year", year);
      formData.append("type", type);
      formData.append(
        "clientLocation",
        clientLocation
      );
      formData.append("link", link);
      formData.append("category", category);

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
          responsibilities.filter(
            (item) => item.trim()
          )
        )
      );

      formData.append(
        "technologies",
        JSON.stringify(
          technologies.filter(
            (technology) =>
              technology.name.trim()
          )
        )
      );

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

      const response = await fetch(
        "/api/projects",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to create project."
        );
      }

      window.location.href =
        "/main/projects";
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create project."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Basic Information */}
      <section className="rounded-xl border border-zinc-200 bg-white">
        <SectionHeader
          title="Basic Information"
          description="Main information displayed for the project."
        />

        <div className="grid gap-6 p-6">
          <div className="grid gap-6 md:grid-cols-2">
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
                placeholder="RedBalloon"
                className={inputClass}
              />
            </Field>

            <Field label="Slug" required>
              <input
                value={slug}
                onChange={(event) =>
                  setSlug(
                    generateSlug(
                      event.target.value
                    )
                  )
                }
                placeholder="red-balloon"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Short description of the project..."
              rows={4}
              className={textareaClass}
            />
          </Field>

          <ImageUpload
            label="Main Project Image"
            file={mainImage}
            inputRef={imageInputRef}
            onChange={setMainImage}
          />
        </div>
      </section>

      {/* Client Information */}
      <section className="rounded-xl border border-zinc-200 bg-white">
        <SectionHeader
          title="Client Information"
          description="Information about the project client."
        />

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <Field label="Client">
            <input
              value={client}
              onChange={(event) =>
                setClient(event.target.value)
              }
              placeholder="RedBalloon"
              className={inputClass}
            />
          </Field>

          <Field label="Year">
            <input
              type="number"
              value={year}
              onChange={(event) =>
                setYear(event.target.value)
              }
              placeholder="2016"
              className={inputClass}
            />
          </Field>

          <Field label="Type">
            <input
              value={type}
              onChange={(event) =>
                setType(event.target.value)
              }
              placeholder="Team Extensions"
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
              placeholder="Sydney, Australia"
              className={inputClass}
            />
          </Field>

          <Field label="Link">
            <input
              type="url"
              value={link}
              onChange={(event) =>
                setLink(event.target.value)
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
              placeholder="Web Development"
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {/* Device */}
      <section className="rounded-xl border border-zinc-200 bg-white">
        <SectionHeader
          title="Device"
          description="Select the devices supported by the project."
        />

        <div className="flex gap-3 p-6">
          {["Desktop", "Mobile"].map(
            (device) => {
              const active =
                devices.includes(device);

              return (
                <button
                  key={device}
                  type="button"
                  onClick={() =>
                    toggleDevice(device)
                  }
                  className={`rounded-lg border px-5 py-3 text-sm font-medium transition ${
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {device}
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* Project Details */}
      <section className="rounded-xl border border-zinc-200 bg-white">
        <SectionHeader
          title="Project Details"
          description="Describe the project and its background."
        />

        <div className="grid gap-6 p-6">
          <Field label="Project Details">
            <textarea
              value={projectDetails}
              onChange={(event) =>
                setProjectDetails(
                  event.target.value
                )
              }
              placeholder="Describe the project..."
              rows={6}
              className={textareaClass}
            />
          </Field>

          <ImageUpload
            label="Project Details Image"
            file={projectDetailsImage}
            inputRef={
              projectDetailsImageRef
            }
            onChange={
              setProjectDetailsImage
            }
          />
        </div>
      </section>

      {/* Our Responsibility */}
      <section className="rounded-xl border border-zinc-200 bg-white">
        <SectionHeader
          title="Our Responsibility"
          description="Explain the work and responsibilities handled."
        />

        <div className="grid gap-6 p-6">
          <Field label="Our Responsibility">
            <textarea
              value={ourResponsibility}
              onChange={(event) =>
                setOurResponsibility(
                  event.target.value
                )
              }
              placeholder="Describe our responsibility..."
              rows={6}
              className={textareaClass}
            />
          </Field>

          <ImageUpload
            label="Responsibility Image"
            file={responsibilityImage}
            inputRef={
              responsibilityImageRef
            }
            onChange={
              setResponsibilityImage
            }
          />
        </div>
      </section>

      {/* Project Responsibilities */}
      <section className="rounded-xl border border-zinc-200 bg-white">
        <SectionHeader
          title="Project Responsibilities"
          description="List the responsibilities handled in this project."
        />

        <div className="space-y-3 p-6">
          {responsibilities.map(
            (responsibility, index) => (
              <div
                key={index}
                className="flex items-center gap-3"
              >
                <input
                  value={responsibility}
                  onChange={(event) =>
                    updateResponsibility(
                      index,
                      event.target.value
                    )
                  }
                  placeholder="e.g. Back End"
                  className={inputClass}
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
                  className="rounded-lg border border-zinc-200 p-2.5 text-zinc-400 transition hover:bg-zinc-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            )
          )}

          <button
            type="button"
            onClick={
              addResponsibility
            }
            className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            <Plus size={16} />
            Add Responsibility
          </button>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="rounded-xl border border-zinc-200 bg-white">
        <SectionHeader
          title="Technology Stack"
          description="Add technologies and their icon URLs."
        />

        <div className="space-y-4 p-6">
          {technologies.map(
            (technology, index) => (
              <div
                key={index}
                className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
              >
                <input
                  value={technology.name}
                  onChange={(event) =>
                    updateTechnology(
                      index,
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Technology name"
                  className={inputClass}
                />

                <input
                  value={technology.icon}
                  onChange={(event) =>
                    updateTechnology(
                      index,
                      "icon",
                      event.target.value
                    )
                  }
                  placeholder="Icon URL"
                  className={inputClass}
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
                  className="rounded-lg border border-zinc-200 px-3 text-zinc-400 transition hover:bg-zinc-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            )
          )}

          <button
            type="button"
            onClick={addTechnology}
            className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            <Plus size={16} />
            Add Technology
          </button>
        </div>
      </section>

      {/* Gallery */}
      <section className="rounded-xl border border-zinc-200 bg-white">
        <SectionHeader
          title="Gallery"
          description="Add one additional project image."
        />

        <div className="p-6">
          <ImageUpload
            label="Gallery Image"
            file={galleryImage}
            inputRef={galleryImageRef}
            onChange={setGalleryImage}
          />
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : "Create Project"}
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400";

const textareaClass =
  "w-full resize-none rounded-lg border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400";

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
      <label className="text-sm font-medium text-zinc-800">
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

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-zinc-200 px-6 py-5">
      <h2 className="font-semibold text-zinc-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function ImageUpload({
  label,
  file,
  inputRef,
  onChange,
}: {
  label: string;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-800">
        {label}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const selectedFile =
            event.target.files?.[0];

          if (selectedFile) {
            onChange(selectedFile);
          }
        }}
      />

      {!file ? (
        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-500 transition hover:border-zinc-400 hover:bg-zinc-50"
        >
          <Upload size={18} />
          Upload Image
        </button>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-zinc-500">
              <Upload size={17} />
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-800">
                {file.name}
              </p>

              <p className="text-xs text-zinc-500">
                {(file.size / 1024 / 1024).toFixed(
                  2
                )}{" "}
                MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onChange(null);

              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-white hover:text-red-500"
          >
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
}