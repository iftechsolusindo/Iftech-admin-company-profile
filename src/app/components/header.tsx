"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/main": "Dashboard",
  "/main/blog": "Blog",
  "/main/projects": "Projects",
  "/main/solutions": "Solutions",
  "/main/monitor": "Monitor",
};

export default function Header() {
  const pathname = usePathname();

  const title = pageTitles[pathname] ?? "Admin Panel";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-zinc-200 bg-white px-8">
      {/* Page title */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>

        <p className="mt-0.5 text-xs text-zinc-500">
          Manage your company profile
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
       

        {/* Divider */}
        <div className="h-8 w-px bg-zinc-200" />

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
            A
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-zinc-900">Admin</p>

            <p className="text-xs text-zinc-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}