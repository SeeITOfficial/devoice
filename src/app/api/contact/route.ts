import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.phone || !body.message) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, phone and message are required.",
        },
        { status: 400 }
      );
    }

    const message = await prisma.contactMessage.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        message: body.subject
          ? `Subject: ${body.subject}\n\n${body.message}`
          : body.message,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: message.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send message.",
      },
      { status: 500 }
    );
  }
}