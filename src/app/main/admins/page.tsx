"use client";

import AdminManager from "../../components/adminmanager";

export default function AdminsPage() {
  return (
    <div className="mx-auto max-w-6xl text-black">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-black">
          Manage Admin Accounts
        </h1>

        <p className="mt-1 text-sm text-black">
          Manage administrator accounts used to access the
          IFTECH admin dashboard.
        </p>
      </div>

      <AdminManager />
    </div>
  );
}