import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const audioUrl = searchParams.get("url");
  const title = searchParams.get("title") || "song";

  if (!audioUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    let targetUrl: string;
    if (audioUrl.startsWith("/")) {
      targetUrl = new URL(audioUrl, request.url).toString();
    } else {
      const parsed = new URL(audioUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return new NextResponse("Invalid URL protocol", { status: 400 });
      }
      targetUrl = parsed.toString();
    }

    const upstreamResponse = await fetch(targetUrl);
    if (!upstreamResponse.ok) {
      return new NextResponse("Failed to fetch audio stream", {
        status: upstreamResponse.status,
      });
    }

    const contentType =
      upstreamResponse.headers.get("content-type") || "audio/mpeg";
    const contentLength = upstreamResponse.headers.get("content-length");

    // Extract or infer appropriate audio file extension
    let ext = "mp3";
    try {
      const urlObj = new URL(targetUrl);
      const urlExt = urlObj.pathname.split(".").pop()?.toLowerCase();
      if (
        urlExt &&
        ["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(urlExt)
      ) {
        ext = urlExt;
      } else if (contentType.includes("wav")) {
        ext = "wav";
      } else if (contentType.includes("ogg")) {
        ext = "ogg";
      } else if (contentType.includes("m4a") || contentType.includes("mp4")) {
        ext = "m4a";
      }
    } catch {
      // default to mp3
    }

    // Clean title for file naming
    const sanitizedTitle = title.replace(/[/\\?%*:|"<>]/g, "_").trim() || "song";
    const filename = sanitizedTitle.toLowerCase().endsWith(`.${ext}`)
      ? sanitizedTitle
      : `${sanitizedTitle}.${ext}`;

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }
    // Prevent caching issues
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");

    return new NextResponse(upstreamResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Audio download error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
