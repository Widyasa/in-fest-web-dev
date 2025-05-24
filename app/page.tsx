'use client'
import { Button } from "@/components/ui/button";
import { GoogleGenAI } from "@google/genai";
import { useState } from "react";

export default function Home() {
  const [res, setRes] = useState("");
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_AI_API_KEY });

  async function main() {
    try {
      const response = await ai.models.generateContent({
        model: "gemma-3-27b-it",
        contents: "Explain how AI works in a few words",
      });
      const result = await response;
      setRes(result.text);
      console.log(result);
    } catch (error) {
      console.error("Error generating content:", error);
      setRes("An error occurred while generating content");
    }
  }

  return (
    <div className="flex flex-col gap-4 justify-center items-center h-screen">
      <Button onClick={main}>Generate</Button>
      <p className="max-w-2xl">{res}</p>
    </div>
  );
}
