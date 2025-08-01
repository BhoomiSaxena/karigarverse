import { NextRequest, NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLE_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.ASSEMBLE_API_KEY) {
      return NextResponse.json(
        { error: "AssemblyAI API key not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const language = (formData.get("language") as string) || "en";

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload audio file to AssemblyAI
    const uploadUrl = await client.files.upload(buffer);

    // Configure transcription parameters
    const config = {
      audio_url: uploadUrl,
      language_code: language === "hi" ? "hi" : "en",
      punctuate: true,
      format_text: true,
    };

    // Request transcription
    const transcript = await client.transcripts.transcribe(config);

    if (transcript.status === "error") {
      console.error("AssemblyAI transcription error:", transcript.error);
      return NextResponse.json(
        { error: "Transcription failed", details: transcript.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transcript: transcript.text,
      confidence: transcript.confidence,
      status: transcript.status,
    });
  } catch (error) {
    console.error("Transcription API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
