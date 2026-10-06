"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Lightbulb,
  Activity,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/main",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/main/projects",
    icon: FolderKanban,
  },
  {
    name: "Technologies",
    href: "/main/icons",
    icon: Lightbulb,
  },
  {
    name: "Blog",
    href: "/main/blog",
    icon: FileText,
  },
  {
    name: "Monitor",
    href: "/main/monitor",
    icon: Activity,
  },
  {
    name: "Admin Accounts",
    href: "/main/admins",
    icon: ShieldCheck,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to logout.");
      }

      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-zinc-200 px-6">
          <Link
            href="/main"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
              <span className="text-[10px] font-bold tracking-wider text-white">
                IFTECH
              </span>
            </div>

            <div>
              <h1 className="text-sm font-bold tracking-tight text-black">
                IFTECH ADMIN
              </h1>

              <p className="text-xs text-zinc-500">
                Dashboard
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Management
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.href === "/main"
                  ? pathname === "/main"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-black text-white"
                      : "text-black hover:bg-zinc-100"
                  }`}
                >
                  <Icon size={18} />

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-zinc-200 p-4">
          <div className="mb-3 rounded-lg bg-zinc-50 px-3 py-3">
            <p className="text-xs font-medium text-black">
              IFTECH Admin Dashboard
            </p>

            <p className="mt-1 text-[11px] text-zinc-500">
              Manage your company profile
            </p>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={18} />

            <span>
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}