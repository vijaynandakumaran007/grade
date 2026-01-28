
import { GoogleGenAI, Type } from "@google/genai";
import { GradingResponse, Question } from "./types";

const MODEL_NAME = 'gemini-3-pro-preview';

export const gradeSubmission = async (
  title: string,
  questions: Question[],
  pdfBase64: string
): Promise<GradingResponse> => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("API Key is missing. Please ensure your environment is configured.");
  }

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  const questionPrompt = questions.map((q, idx) => {
    return `Question ${idx + 1} (${q.marks} marks possible): ${q.text}`;
  }).join("\n");

  const pdfPart = {
    inlineData: {
      mimeType: 'application/pdf',
      data: pdfBase64,
    },
  };

  const textPart = {
    text: `Assignment Title: ${title}\n\nStrict Grading Criteria:\n${questionPrompt}\n\nInstructions: Analyze the attached PDF document. For each question, find the corresponding answer in the student's work. Evaluate the accuracy, depth, and clarity. Sum the marks to provide a final score. Provide a breakdown of marks for each question in the feedback.`
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ parts: [pdfPart, textPart] }],
      config: {
        systemInstruction: `You are a world-class academic proctor and subject matter expert. 
        Your goal is to provide a 'PERFECT' correction.
        1. BE RIGOROUS: Only award marks for information explicitly present or correctly inferred in the PDF.
        2. DETAILED FEEDBACK: For every question, mention what the student did well and exactly where they lost marks.
        3. FORMATTING: Use professional academic language and structure feedback as a bulleted list.
        4. TOTAL SCORE: Sum the marks for all questions. The total score must be a number representing the percentage (0-100).
        
        Output MUST be valid JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: {
              type: Type.STRING,
              description: "A comprehensive, bulleted breakdown of the student's performance across all questions.",
            },
            score: {
              type: Type.NUMBER,
              description: "The calculated total score percentage (0-100).",
            },
          },
          required: ["feedback", "score"],
        },
      },
    });

    const result = JSON.parse(response.text.trim());
    return result as GradingResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
