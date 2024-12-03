import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("fileUrl");
  const fileName = searchParams.get("fileName") || "downloaded-file";

  if (!fileUrl) {
    return NextResponse.json(
      { error: "File URL is required" },
      { status: 400 },
    );
  }

  try {
    // Fetch the file from the external backend API
    const response = await axios.get(fileUrl, {
      responseType: "stream",
    });

    // Set the headers to force download
    return new Response(response.data, {
      headers: {
        "Content-Type": response.headers["content-type"],
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error downloading file" },
      { status: 500 },
    );
  }
}
