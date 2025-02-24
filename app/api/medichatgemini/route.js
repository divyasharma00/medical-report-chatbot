import { NextResponse } from 'next/server';
import { queryPineconeVectorStore } from "@/utils";
import { Pinecone } from "@pinecone-database/pinecone";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, Message, StreamData, streamText } from "ai";

// Constants
const MAX_DURATION = 60;  // Allow streaming responses for up to 60 seconds
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const google = createGoogleGenerativeAI({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  apiKey: GEMINI_API_KEY
});

// Initialize the Google Generative Model
const model = google('models/gemini-1.5-pro-latest', {
  safetySettings: [{ category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }]
});

// Handle POST request
export async function POST(req) {
  try {
    const reqBody = await req.json();
    const { messages, data } = reqBody;
    const userQuestion = messages[messages.length - 1].content;
    const reportData = data.reportData;

    const query = buildQuery(reportData, userQuestion);

    // Retrieve relevant passages from Pinecone vector store
    const retrievals = await queryPineconeVectorStore(pinecone, 'reprtify', "default", query);
    
    // Create the final prompt for model inference
    const finalPrompt = createPrompt(reportData, userQuestion, retrievals);

    const dataStream = new StreamData();
    dataStream.append({ retrievals });

    // Stream the response from the model
    const result = await streamText({
      model,
      prompt: finalPrompt,
      onFinish() {
        dataStream.close();
      }
    });

    // Return the stream response
    return result.toDataStreamResponse({ data: dataStream });
  } catch (error) {
    console.error("Error processing the request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Helper to build the query for Pinecone vector store
function buildQuery(reportData, userQuestion) {
  return `Represent this for searching relevant passages: patient medical report says: \n${reportData}. \n\n${userQuestion}`;
}

// Helper to construct the final prompt with relevant sections
function createPrompt(reportData, userQuestion, retrievals) {
  return `
    Here is a summary of a patient's clinical report, and a user query. Some generic clinical findings are also provided that may or may not be relevant for the report.
    Go through the clinical report and answer the user query.
    Ensure the response is factually accurate, and demonstrates a thorough understanding of the query topic and the clinical report.
    Before answering, enrich your knowledge by reviewing the provided clinical findings. 
    The clinical findings are generic insights and not part of the patient's medical report. Exclude any clinical finding that is not relevant for the patient's case.

    **Patient's Clinical report summary:** 
    ${reportData}
    **end of patient's clinical report**

    **User Query:**
    ${userQuestion}?
    **end of user query**

    **Generic Clinical findings:**
    ${retrievals}
    **end of generic clinical findings**

    Provide thorough justification for your answer.
    **Answer:**
  `;
}