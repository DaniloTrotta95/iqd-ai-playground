import { NextRequest, NextResponse } from "next/server";
import { getTechSpecByName } from "@/actions/techspec.actions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    
    if (!name) {
      return NextResponse.json(
        { error: "Techspec name is required" },
        { status: 400 }
      );
    }

    const url = await getTechSpecByName(name);
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error fetching techspec URL:", error);
    return NextResponse.json(
      { error: "Failed to fetch techspec URL" },
      { status: 500 }
    );
  }
}
