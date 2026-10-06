import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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

    if (!username || !password) {
      return NextResponse.json(
        {
          message:
            "Username and password are required.",
        },
        { status: 400 }
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          username,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Invalid username or password.",
        },
        { status: 401 }
      );
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          message:
            "Invalid username or password.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      message: "Login successful.",
      user: {
        id: user.id,
        username: user.username,
      },
    });

    response.cookies.set(
      "auth-user",
      String(user.id),
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "POST /api/auth/login error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to login.",
      },
      { status: 500 }
    );
  }
}