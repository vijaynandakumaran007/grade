
import { GoogleGenAI, Type } from "@google/genai";
import { GradingResponse, Question } from "./types";

const MODEL_NAME = 'gemini-3-pro-preview';

export const gradeSubmission = async (
  title: string, 
  questions: Question[], 
  pdfBase64: string // Expecting raw base64 string without data URL prefix
): Promise<GradingResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const questionPrompt = questions.map((q, idx) => {
    return `Question ${idx + 1} (${q.marks} marks): ${q.text}`;
  }).join("\n");

  const pdfPart = {
    inlineData: {
      mimeType: 'application/pdf',
      data: pdfBase64,
    },
  };

  const textPart = {
    text: `Assignment Title: ${title}\n\nPlease evaluate the attached student assignment PDF based on these specific questions:\n\n${questionPrompt}\n\nProvide constructive feedback for the student and a total numerical score.`
  };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { parts: [pdfPart, textPart] },
    config: {
      systemInstruction: `You are an expert academic proctor. 
      Analyze the provided PDF content carefully against the requested questions.
      1. Provide a consolidated constructive feedback summary for the student.
      2. Calculate a total numerical score by summing up marks awarded for each question based on the PDF content.
      Ensure the score does not exceed the total possible marks.
      Return the result in valid JSON format.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feedback: {
            type: Type.STRING,
            description: "Constructive feedback summary for the student.",
          },
          score: {
            type: Type.NUMBER,
            description: "Total numerical grade awarded.",
          },
        },
        required: ["feedback", "score"],
      },
    },
  });

  try {
    return JSON.parse(response.text.trim()) as GradingResponse;
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return {
      feedback: "The AI evaluator was able to read your PDF but had trouble formatting the result. Please check with your proctor.",
      score: 0
    };
  }
};
