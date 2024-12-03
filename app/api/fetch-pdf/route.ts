import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get("url");

  if (!pdfUrl) {
    return NextResponse.json({ error: "Missing PDF URL" }, { status: 400 });
  }

  try {
    // Fetch the PDF from the external URL
    const response = await fetch(pdfUrl);
    const pdfBuffer = await response.arrayBuffer();

    // Return the PDF as a binary response
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 500 });
  }
}
