const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({});

async function getModerationResponse(prompt) {
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
  "misinformation": <boolean>,
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

async function getResponse(post, prompt, mediaBuffer, mediaType) {
  let contents = [];
  if (mediaBuffer && mediaType) {
    // Convert Buffer to base64 string
    const base64Data = mediaBuffer.toString('base64');
    
    // Determine mimeType based on mediaType enum
    let mimeType;
    if (mediaType === "image") {
      // Try to detect actual image type from buffer, default to jpeg
      const fileSignature = mediaBuffer.toString('hex', 0, 4);
      if (fileSignature.startsWith('ffd8')) {
        mimeType = "image/jpeg";
      } else if (fileSignature.startsWith('89504e47')) {
        mimeType = "image/png";
      } else if (fileSignature.startsWith('47494638')) {
        mimeType = "image/gif";
      } else {
        mimeType = "image/jpeg"; // default
      }
    } else if (mediaType === "video") {
      mimeType = "video/mp4"; // default, could be enhanced to detect actual video type
    } else {
      mimeType = "image/jpeg"; // fallback
    }
    
    contents = [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      },
      {
        text: `You are a helpful AI assistant that answers user  queries about posts on a social media platform.
Given the following post: "${post}", provide a detailed and informative response to the user's query: "${prompt}"`
      },
    ];
  } else {
    contents = [
      {
        text: `You are a helpful AI assistant that answers user  queries about posts on a social media platform.
Given the following post: "${post}", provide a detailed and informative response to the user's query: "${prompt}"`
      },
    ];
  }
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
  });

  return response.text;
}

exports.getModerationResponse = getModerationResponse;
exports.getResponse = getResponse;