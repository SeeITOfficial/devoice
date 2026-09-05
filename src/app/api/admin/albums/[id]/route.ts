import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminApiRequest } from "@/lib/adminAuth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await validateAdminApiRequest(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();

    const album = await prisma.album.findUnique({ where: { id } });
    if (!album) {
      return NextResponse.json(
        { success: false, message: "Album not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.album.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title?.trim() : album.title,
        published: body.published !== undefined ? body.published : album.published,
      },
    });

    return NextResponse.json({ success: true, album: updated });
  } catch (error) {
    console.error("Album update error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update album." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await validateAdminApiRequest(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  try {
    const { id } = await params;

    const album = await prisma.album.findUnique({ where: { id } });
    if (!album) {
      return NextResponse.json(
        { success: false, message: "Album not found." },
        { status: 404 }
      );
    }

    // Delete all associated songs first
    await prisma.song.deleteMany({ where: { albumId: id } });
    await prisma.album.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Album delete error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete album." },
      { status: 500 }
    );
  }
}
