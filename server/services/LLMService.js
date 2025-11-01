const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({});

async function getResponse(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a content moderation AI.
Analyze the following content and respond ONLY in JSON format:
{
  "isSynthetic": <boolean>,
  "age_rating": <"safe" | "sensitive" | "explicit">,
  "isHarmful": <boolean>
}
Do not include any explanations or additional text. Only return the JSON object.
Content:
${prompt}`
          }
        ],
      },
    ],
  });

  return response.text;
}

exports.getResponse = getResponse;