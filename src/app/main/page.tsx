"use client";

import {
  FileText,
  FolderKanban,
  Code2,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardData {
  statistics: {
    blogs: number;
    projects: number;
    technologies: number;
    systemStatus: string;
  };
  activities: {
    action: string;
    title: string;
    date: string;
  }[];
}

const statisticConfig = [
  {
    key: "blogs",
    title: "Total Blog",
    description: "Blog entries",
    icon: FileText,
  },
  {
    key: "projects",
    title: "Projects",
    description: "Displayed projects",
    icon: FolderKanban,
  },
  {
    key: "technologies",
    title: "Technology Stack",
    description: "Available technologies",
    icon: Code2,
  },
  {
    key: "systemStatus",
    title: "System Status",
    description: "Current system status",
    icon: Activity,
  },
] as const;

function formatDate(date: string) {
  const now = new Date();
  const target = new Date(date);

  const diff = now.getTime() - target.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  if (days < 7) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return target.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch("/api/dashboard", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const result = await response.json();

        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm text-zinc-500">Welcome back</p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
          Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Manage the content and information displayed on the IFTECH
          SOLUSINDO company profile website.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statisticConfig.map((item) => {
          const Icon = item.icon;

          let value = "—";

          if (!loading && data) {
            if (item.key === "blogs") {
              value = String(data.statistics.blogs);
            }

            if (item.key === "projects") {
              value = String(data.statistics.projects);
            }

            if (item.key === "technologies") {
              value = String(data.statistics.technologies);
            }

            if (item.key === "systemStatus") {
              value = data.statistics.systemStatus;
            }
          }

          return (
            <div
              key={item.key}
              className="rounded-xl border border-zinc-200 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-500">
                    {item.title}
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-zinc-900">
                    {loading ? "..." : value}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                  <Icon
                    size={19}
                    strokeWidth={1.8}
                    className="text-zinc-700"
                  />
                </div>
              </div>

              <p className="mt-3 text-xs text-zinc-400">
                {item.description}
              </p>
            </div>
          );
        })}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-6 py-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Recent Activity
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Latest changes made in the admin panel.
          </p>
        </div>

        <div className="divide-y divide-zinc-100">
          {loading ? (
            <div className="px-6 py-8 text-center text-sm text-zinc-400">
              Loading activity...
            </div>
          ) : data?.activities.length ? (
            data.activities.map((activity, index) => (
              <div
                key={`${activity.title}-${index}`}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-800">
                    {activity.action}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {activity.title}
                  </p>
                </div>

                <span className="text-xs text-zinc-400">
                  {formatDate(activity.date)}
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-sm text-zinc-400">
              No recent activity.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}