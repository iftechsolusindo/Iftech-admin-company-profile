import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const adminId = Number(id);

    if (!Number.isInteger(adminId)) {
      return NextResponse.json(
        {
          message: "Invalid admin ID.",
        },
        { status: 400 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: {
        id: adminId,
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        {
          message: "Admin account not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      admin,
    });
  } catch (error) {
    console.error("GET /api/admins/[id] error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch admin account.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const adminId = Number(id);

    if (!Number.isInteger(adminId)) {
      return NextResponse.json(
        {
          message: "Invalid admin ID.",
        },
        { status: 400 }
      );
    }

    const existingAdmin = await prisma.user.findUnique({
      where: {
        id: adminId,
      },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        {
          message: "Admin account not found.",
        },
        { status: 404 }
      );
    }

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

    if (password && password.length < 6) {
      return NextResponse.json(
        {
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const duplicateAdmin = await prisma.user.findFirst({
      where: {
        username,
        NOT: {
          id: adminId,
        },
      },
    });

    if (duplicateAdmin) {
      return NextResponse.json(
        {
          message: "Username is already in use.",
        },
        { status: 409 }
      );
    }

    const updateData: {
      username: string;
      password?: string;
    } = {
      username,
    };

    if (password) {
      updateData.password = await bcrypt.hash(
        password,
        10
      );
    }

    const admin = await prisma.user.update({
      where: {
        id: adminId,
      },
      data: updateData,
      select: {
        id: true,
        username: true,
      },
    });

    return NextResponse.json({
      message: "Admin account updated successfully.",
      admin,
    });
  } catch (error) {
    console.error("PUT /api/admins/[id] error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to update admin account.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const adminId = Number(id);

    if (!Number.isInteger(adminId)) {
      return NextResponse.json(
        {
          message: "Invalid admin ID.",
        },
        { status: 400 }
      );
    }

    const authUser = request.headers.get("x-auth-user");

    if (authUser && Number(authUser) === adminId) {
      return NextResponse.json(
        {
          message: "You cannot delete your own account.",
        },
        { status: 400 }
      );
    }

    const existingAdmin = await prisma.user.findUnique({
      where: {
        id: adminId,
      },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        {
          message: "Admin account not found.",
        },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: {
        id: adminId,
      },
    });

    return NextResponse.json({
      message: "Admin account deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/admins/[id] error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete admin account.",
      },
      { status: 500 }
    );
  }
}