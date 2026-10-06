import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      message: "Logout successful.",
    });

    response.cookies.set("auth-user", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/logout error:", error);

    return NextResponse.json(
      {
        message: "Failed to logout.",
      },
      {
        status: 500,
      }
    );
  }
}