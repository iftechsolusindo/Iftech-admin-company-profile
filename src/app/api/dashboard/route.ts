import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      blogCount,
      projectCount,
      technologyCount,
      recentBlogs,
      recentProjects,
    ] = await Promise.all([
      prisma.blog.count(),
      prisma.project.count(),
      prisma.technologyIcons.count(),

      prisma.blog.findMany({
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
        select: {
          title: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      prisma.project.findMany({
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
        select: {
          title: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const activities = [
      ...recentBlogs.map((blog) => ({
        action:
          blog.updatedAt.getTime() !== blog.createdAt.getTime()
            ? "Blog updated"
            : "New blog created",
        title: blog.title,
        date: blog.updatedAt.toISOString(),
      })),

      ...recentProjects.map((project) => ({
        action:
          project.updatedAt.getTime() !== project.createdAt.getTime()
            ? "Project updated"
            : "New project created",
        title: project.title,
        date: project.updatedAt.toISOString(),
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 5);

    return NextResponse.json({
      success: true,

      statistics: {
        blogs: blogCount,
        projects: projectCount,
        technologies: technologyCount,
        systemStatus: "Online",
      },

      activities,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard data.",
      },
      {
        status: 500,
      }
    );
  }
}