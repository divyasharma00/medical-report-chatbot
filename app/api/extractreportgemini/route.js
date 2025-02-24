import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
});

const prompt = `
  Review the attached clinical report and identify any biomarkers showing significant or minor abnormalities.
  Provide a concise summary, highlighting the key numerical values and abnormal findings.
  Exclude patient-identifying details (e.g., name, date).
  If the report spans multiple pages, feel free to extend the word limit as needed.
  Ensure the summary includes the report title and all relevant details for accurate understanding.
`;

export async function POST(req, res) {
    const { base64 } = await req.json();
    const filePart = fileToGenerativePart(base64);

    console.log(filePart);
    const generatedContent = await model.generateContent([prompt, filePart]);

    console.log(generatedContent);
    const textResponse = generatedContent.response.candidates[0].content.parts[0].text;
    return new Response(textResponse, { status: 200 });
}

function fileToGenerativePart(imageData) {
    return {
        inlineData: {
            data: imageData.split(",")[1],
            mimeType: imageData.substring(
                imageData.indexOf(":") + 1,
                imageData.lastIndexOf(";")
            ),
        },
    };
}