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

    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) {
      return NextResponse.json(
        { success: false, message: "Song not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.song.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title?.trim() : song.title,
        published: body.published !== undefined ? body.published : song.published,
      },
    });

    return NextResponse.json({ success: true, song: updated });
  } catch (error) {
    console.error("Song update error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update song." },
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

    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) {
      return NextResponse.json(
        { success: false, message: "Song not found." },
        { status: 404 }
      );
    }

    await prisma.song.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Song delete error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete song." },
      { status: 500 }
    );
  }
}
