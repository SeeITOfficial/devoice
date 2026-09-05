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

    const item = await prisma.galleryItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json(
        { success: false, message: "Gallery item not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.galleryItem.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title?.trim() || null : item.title,
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Gallery item update error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update gallery item." },
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

    const item = await prisma.galleryItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json(
        { success: false, message: "Gallery item not found." },
        { status: 404 }
      );
    }

    await prisma.galleryItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gallery item delete error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete gallery item." },
      { status: 500 }
    );
  }
}
