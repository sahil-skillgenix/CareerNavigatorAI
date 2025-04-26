import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Simple test function to verify OpenAI connectivity
 */
export async function testOpenAI(): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "user", content: "Say hello" }
      ],
      max_tokens: 10,
    });

    return response.choices[0].message.content || "No content returned";
  } catch (error) {
    console.error("OpenAI test error:", error);
    if (error instanceof Error) {
      throw new Error(`OpenAI test failed: ${error.message}`);
    }
    throw new Error("OpenAI test failed with unknown error");
  }
}