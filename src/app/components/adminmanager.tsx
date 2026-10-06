"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

interface Admin {
  id: number;
  username: string;
}

interface AdminForm {
  username: string;
  password: string;
}

export default function AdminManager() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [editingAdmin, setEditingAdmin] =
    useState<Admin | null>(null);

  const [deletingAdmin, setDeletingAdmin] =
    useState<Admin | null>(null);

  const [form, setForm] = useState<AdminForm>({
    username: "",
    password: "",
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchAdmins() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admins", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch admin accounts."
        );
      }

      setAdmins(data.admins);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch admin accounts."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdmins();
  }, []);

  function openCreateModal() {
    setEditingAdmin(null);

    setForm({
      username: "",
      password: "",
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditModal(admin: Admin) {
    setEditingAdmin(admin);

    setForm({
      username: admin.username,
      password: "",
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingAdmin(null);

    setForm({
      username: "",
      password: "",
    });

    setError("");
  }

  function openDeleteModal(admin: Admin) {
    setDeletingAdmin(admin);
    setError("");
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (deleting) return;

    setDeleteModalOpen(false);
    setDeletingAdmin(null);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const username = form.username.trim();

    if (!username) {
      setError("Username is required.");
      return;
    }

    if (!editingAdmin && !form.password) {
      setError("Password is required.");
      return;
    }

    if (form.password && form.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url = editingAdmin
        ? `/api/admins/${editingAdmin.id}`
        : "/api/admins";

      const method = editingAdmin ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${
              editingAdmin ? "update" : "create"
            } admin account.`
        );
      }

      await fetchAdmins();

      setSuccess(
        editingAdmin
          ? "Admin account updated successfully."
          : "Admin account created successfully."
      );

      setModalOpen(false);
      setEditingAdmin(null);

      setForm({
        username: "",
        password: "",
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save admin account."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingAdmin) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `/api/admins/${deletingAdmin.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete admin account."
        );
      }

      await fetchAdmins();

      setDeleteModalOpen(false);
      setDeletingAdmin(null);

      setSuccess(
        "Admin account deleted successfully."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete admin account."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 text-black">
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {error && !modalOpen && !deleteModalOpen && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black">
            Admin Accounts
          </h2>

          <p className="mt-1 text-sm text-black">
            {admins.length} admin account
            {admins.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          <Plus size={17} />
          Add Admin
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-black">
                  ID
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-black">
                  Username
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-black">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-sm text-black"
                  >
                    Loading admin accounts...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-sm text-black"
                  >
                    No admin accounts found.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-b border-zinc-100 last:border-b-0"
                  >
                    <td className="px-5 py-4 text-sm text-black">
                      {admin.id}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-black">
                      {admin.username}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(admin)
                          }
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-black transition hover:bg-zinc-100"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal(admin)
                          }
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-black">
                  {editingAdmin
                    ? "Edit Admin Account"
                    : "Add Admin Account"}
                </h3>

                <p className="mt-1 text-sm text-black">
                  {editingAdmin
                    ? "Update the administrator account."
                    : "Create a new administrator account."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-black transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="admin-username"
                  className="mb-2 block text-sm font-medium text-black"
                >
                  Username
                </label>

                <input
                  id="admin-username"
                  type="text"
                  value={form.username}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  placeholder="Enter username"
                  disabled={saving}
                  autoComplete="username"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-2 block text-sm font-medium text-black"
                >
                  Password
                </label>

                <input
                  id="admin-password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder={
                    editingAdmin
                      ? "Leave empty to keep current password"
                      : "Enter password"
                  }
                  disabled={saving}
                  autoComplete={
                    editingAdmin
                      ? "new-password"
                      : "new-password"
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-zinc-100"
                />

                {editingAdmin && (
                  <p className="mt-2 text-xs text-black">
                    Leave this field empty if you do not
                    want to change the password.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingAdmin
                    ? "Update Admin"
                    : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && deletingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
                <Trash2
                  size={20}
                  className="text-red-600"
                />
              </div>

              <h3 className="text-lg font-semibold text-black">
                Delete Admin Account?
              </h3>

              <p className="mt-2 text-sm leading-6 text-black">
                Are you sure you want to delete the admin
                account{" "}
                <span className="font-semibold">
                  {deletingAdmin.username}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}