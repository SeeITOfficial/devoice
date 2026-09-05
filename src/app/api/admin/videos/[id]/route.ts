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

    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) {
      return NextResponse.json(
        { success: false, message: "Video not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.video.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title?.trim() || null : video.title,
      },
    });

    return NextResponse.json({ success: true, video: updated });
  } catch (error) {
    console.error("Video update error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update video." },
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

    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) {
      return NextResponse.json(
        { success: false, message: "Video not found." },
        { status: 404 }
      );
    }

    await prisma.video.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Video delete error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete video." },
      { status: 500 }
    );
  }
}
