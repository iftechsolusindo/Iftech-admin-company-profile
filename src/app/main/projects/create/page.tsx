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
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100";

const textareaClass =
  "w-full resize-none rounded-lg border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100";

export default function ProjectEditor() {
  const imageInputRef =
    useRef<HTMLInputElement>(null);

  const projectDetailsImageRef =
    useRef<HTMLInputElement>(null);

  const responsibilityImageRef =
    useRef<HTMLInputElement>(null);

  const galleryImageRef =
    useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const [client, setClient] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState("");
  const [clientLocation, setClientLocation] =
    useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("");

  const [devices, setDevices] = useState<string[]>(
    []
  );

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
    value: string
  ) => {
    setTechnologies((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              name: value,
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

      if (mainImage) {
        formData.append("image", mainImage);
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
    <div className="space-y-6">
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
              placeholder="e.g. red-balloon"
              className={inputClass}
            />
          </Field>
        </div>

        <ImageUpload
          label="Main Project Image"
          file={mainImage}
          inputRef={imageInputRef}
          onChange={setMainImage}
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
                setClient(event.target.value)
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
                setYear(event.target.value)
              }
              placeholder="e.g. 2016"
              className={inputClass}
            />
          </Field>

          <Field label="Type">
            <input
              value={type}
              onChange={(event) =>
                setType(event.target.value)
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
                setCategory(event.target.value)
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
                  className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition ${
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {device}
                </button>
              );
            }
          )}
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
          file={projectDetailsImage}
          inputRef={projectDetailsImageRef}
          onChange={setProjectDetailsImage}
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
          file={responsibilityImage}
          inputRef={
            responsibilityImageRef
          }
          onChange={
            setResponsibilityImage
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
            (responsibility, index) => (
              <div
                key={index}
                className="flex gap-3"
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
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            )
          )}
        </div>

        <AddButton
          onClick={addResponsibility}
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
            (technology, index) => (
              <div
                key={index}
                className="flex gap-3"
              >
                <input
                  value={technology.name}
                  onChange={(event) =>
                    updateTechnology(
                      index,
                      event.target.value
                    )
                  }
                  placeholder="e.g. Scala"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() =>
                    removeTechnology(index)
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
          onClick={addTechnology}
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
          file={galleryImage}
          inputRef={galleryImageRef}
          onChange={setGalleryImage}
        />
      </Section>

      {/* ACTION */}
      <div className="flex justify-end border-t border-zinc-200 pt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : "Create Project"}
        </button>
      </div>
    </div>
  );
}

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
      <label className="block text-sm font-medium text-zinc-800">
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
          className="flex min-h-28 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 text-sm text-zinc-500 transition hover:border-zinc-400 hover:bg-zinc-50"
        >
          <Upload size={17} />
          Upload Image
        </button>
      ) : (
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

          <button
            type="button"
            onClick={() => {
              onChange(null);

              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}
            className="ml-4 shrink-0 rounded-lg p-2 text-zinc-400 transition hover:bg-white hover:text-red-500"
          >
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
}