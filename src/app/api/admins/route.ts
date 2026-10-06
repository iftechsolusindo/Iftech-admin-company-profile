import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
      orderBy: {
        username: "asc",
      },
    });

    return NextResponse.json({
      admins,
    });
  } catch (error) {
    console.error("GET /api/admins error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch admin accounts.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!username) {
      return NextResponse.json(
        {
          message: "Username is required.",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          message: "Password is required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const existingAdmin = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          message: "Username is already in use.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
      },
    });

    return NextResponse.json(
      {
        message: "Admin account created successfully.",
        admin,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admins error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create admin account.",
      },
      { status: 500 }
    );
  }
}