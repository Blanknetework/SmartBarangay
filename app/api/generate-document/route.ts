import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  BARANGAY_CLEARANCE_TEMPLATE, 
  CERTIFICATE_OF_INDIGENCY_TEMPLATE, 
  BUSINESS_PERMIT_TEMPLATE,
  CERTIFICATE_OF_RESIDENCY_TEMPLATE
} from "@/lib/templates";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toTitleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function fillStrictTemplate(template: string, data: any): string {
  const fullName = toTitleCase(`${data.firstName || ""} ${data.lastName || ""}`.trim());
  const replacements: Record<string, string> = {
    full_name: escapeHtml(fullName || "N/A"),
    age: escapeHtml(String(data.age || "N/A")),
    civil_status: escapeHtml(toTitleCase(data.civilStatus || "Single")),
    address: escapeHtml(toTitleCase(data.address || "No Address Provided")),
    purpose: escapeHtml(toTitleCase(data.purpose || "General Requirements")),
    city: escapeHtml(toTitleCase(data.city || "Unknown City")),
    barangay_name: "Tangos",
    years_of_residency: escapeHtml(String(data.yearsOfResidency || "1")),
    date: escapeHtml(
      new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    ),
  };

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => replacements[key] || "");
}

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
    } else if (templateType === "Certificate of Residency") {
      baseTemplate = CERTIFICATE_OF_RESIDENCY_TEMPLATE;
    } else {
      baseTemplate = BARANGAY_CLEARANCE_TEMPLATE; 
    }

    // Strict formatting path: use deterministic templates only.
    if (
      templateType === "Barangay Clearance" ||
      templateType === "Certificate of Indigency" ||
      templateType === "Business Permit" ||
      templateType === "Certificate of Residency"
    ) {
      const strictHtml = fillStrictTemplate(baseTemplate, data);
      return NextResponse.json({ html: strictHtml.trim() });
    }

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
   - IMPORTANT: Only use standard CSS colors (hex colors like #000000, #FFFFFF) and color names (black, white, red, blue, etc). NEVER use lab(), lch(), oklch(), oklab(), or any modern CSS color functions.
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

    const result = await model.generateContent(prompt);
    let generatedHtml = result.response.text() || "";
    if (generatedHtml.startsWith("\`\`\`html")) {
      generatedHtml = generatedHtml.replace(/\`\`\`html/, "").replace(/\`\`\`$/, "");
    }

    return NextResponse.json({ html: generatedHtml.trim() });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate document" }, { status: 500 });
  }
}
