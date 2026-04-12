import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { 
  BARANGAY_CLEARANCE_TEMPLATE, 
  CERTIFICATE_OF_INDIGENCY_TEMPLATE, 
  BUSINESS_PERMIT_TEMPLATE 
} from "@/lib/templates";

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key",
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in your .env.local file." },
        { status: 500 }
      );
    }

    const { templateType, data } = await req.json();

    if (!templateType || !data) {
      return NextResponse.json({ error: "Missing templateType or data" }, { status: 400 });
    }

    let baseTemplate = "";
    if (templateType === "Barangay Clearance") {
      baseTemplate = BARANGAY_CLEARANCE_TEMPLATE;
    } else if (templateType === "Certificate of Indigency") {
      baseTemplate = CERTIFICATE_OF_INDIGENCY_TEMPLATE;
    } else if (templateType === "Business Permit") {
      baseTemplate = BUSINESS_PERMIT_TEMPLATE;
    } else {
      baseTemplate = BARANGAY_CLEARANCE_TEMPLATE; // fallback
    }

    // Prepare prompt to enforce correct capitalization and grammar while formatting
    const prompt = `
You are an AI document processor for a Philippine Barangay.
Your task is to take this raw resident data and properly fill it into the provided HTML template.

Instructions:
1. Replace EXACTLY these placeholders in the HTML template:
   {{full_name}} -> with the Resident's Full Name (Properly Capitalized)
   {{age}} -> with the Resident's Age
   {{civil_status}} -> with the Resident's Civil Status (e.g. Single, Married)
   {{address}} -> with the Resident's Address (Properly Capitalized)
   {{purpose}} -> with the Purpose or Business Name (Properly Formatted)
   {{city}} -> The Resident's City ("${data.city}")
   {{barangay_name}} -> "Tangos" (or the default barangay)
   {{date}} -> Exactly this date: "${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}"

2. Important formatting rules:
   - Fix any grammatical errors or strange capitalizations in the input data.
   - Do NOT change the core HTML tags or structure.
   - Return ONLY the finalized valid HTML string. Do not use markdown codeblocks (no \`\`\`html and \`\`\`), just the raw HTML output.

Raw Data:
Full Name: ${data.firstName} ${data.lastName}
Age: ${data.age}
Civil Status: ${data.civilStatus || "Single"}
Address: ${data.address || "No Address Provided"}
City: ${data.city || "Unknown City"}
Purpose/Business: ${data.purpose || "General Requirements"}

HTML Template:
${baseTemplate}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let generatedHtml = response.text || "";
    // Clean up if it returned markdown block
    if (generatedHtml.startsWith("\`\`\`html")) {
      generatedHtml = generatedHtml.replace(/\`\`\`html/, "").replace(/\`\`\`$/, "");
    }

    return NextResponse.json({ html: generatedHtml.trim() });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate document" }, { status: 500 });
  }
}
