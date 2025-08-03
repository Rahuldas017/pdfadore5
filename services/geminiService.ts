
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { PresentationOutline } from "../types";
import { TOOLS } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This provides a clearer error message for developers if the environment variable is missing.
  throw new Error("The Gemini API key is missing. Please ensure the API_KEY environment variable is correctly configured in your deployment environment.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const textModel = "gemini-2.5-flash";

/**
 * A robust function to extract a JSON object from a string,
 * cleaning up markdown fences and attempting to repair incomplete JSON.
 * @param text The raw string from the AI response.
 * @returns A parsed JSON object or null if parsing fails.
 */
const extractJsonFromAiResponse = (text: string): any | null => {
    let cleanText = text.trim();
    
    // Find content within markdown fences ```json ... ``` or ``` ... ```
    const markdownMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        cleanText = markdownMatch[1];
    }

    // Find the first opening bracket '{' or '['
    const firstBracketIndex = cleanText.search(/[{[]/);
    if (firstBracketIndex === -1) {
        console.error("AI response did not contain a JSON object or array.", text);
        return null;
    }

    // Trim the string to start from the first bracket
    const jsonString = cleanText.substring(firstBracketIndex);

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        // The JSON might be incomplete. Try to find the last valid bracket.
        let openBrackets = 0;
        let lastValidCharIndex = -1;
        const openChar = jsonString[0];
        const closeChar = openChar === '{' ? '}' : ']';

        for (let i = 0; i < jsonString.length; i++) {
            if (jsonString[i] === openChar) {
                openBrackets++;
            } else if (jsonString[i] === closeChar) {
                openBrackets--;
            }
            if (openBrackets === 0) {
                // Found a potentially complete block, try parsing just this part
                const potentialJson = jsonString.substring(0, i + 1);
                try {
                    const result = JSON.parse(potentialJson);
                    // Successfully parsed a complete block
                    return result;
                } catch (finalError) {
                    // This block was not valid json, but there might be more text, so we continue
                }
            }
        }
        
        console.error("Failed to parse JSON from AI response even after attempting to fix.", { originalText: text, attemptedParse: jsonString, error: e });
        return null;
    }
};

export const getToolRecommendation = async (userQuery: string): Promise<{ toolId: string; recommendation: string }> => {
    const toolList = TOOLS.map(t => `- ${t.title} (id: ${t.id}): ${t.description}`).join('\n');

    const systemInstruction = `You are an expert AI assistant for a website called Pdfadore.com. Your ONLY job is to understand the user's problem and recommend ONE specific tool from the provided list that is the best fit.

You MUST respond in a JSON format. The JSON object should contain two keys: "toolId" and "recommendation".
- "toolId" must be the exact id string from the tool list.
- "recommendation" must be a short, friendly, one-sentence explanation of why you are suggesting that tool.

Here is the list of available tools:
${toolList}

Do not suggest any other tools or actions. If the user's request is unrelated to these tools, respond with a toolId of "none" and a polite message saying you can only help with PDF-related tasks.`;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: userQuery,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        toolId: {
                            type: Type.STRING,
                            description: "The unique ID of the recommended tool from the list.",
                        },
                        recommendation: {
                            type: Type.STRING,
                            description: "A friendly message explaining the recommendation.",
                        },
                    },
                    required: ["toolId", "recommendation"],
                },
            },
        });

        const parsedJson = extractJsonFromAiResponse(response.text);

        if (parsedJson && parsedJson.toolId && parsedJson.recommendation) {
            return parsedJson;
        } else {
            console.warn("Could not parse structured JSON from AI. Falling back to text response.", response.text);
            return { toolId: 'none', recommendation: response.text || "Sorry, I had trouble understanding that. Please try rephrasing your request." };
        }
    } catch (error) {
        console.error("Error getting tool recommendation:", error);
        throw new Error("Failed to get a recommendation from the AI.");
    }
};

export const summarizeText = async (text: string): Promise<string> => {
  const prompt = `Please provide a concise summary of the following document. Focus on the key points and main arguments. The document content is:\n\n---\n\n${text}`;
  
  try {
    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error("Failed to generate summary from Gemini API.");
  }
};

export const getPresentationOutline = async (text: string): Promise<PresentationOutline> => {
  const prompt = `Based on the following document, generate a concise presentation outline. Each slide must have a title and a few bullet points covering the main ideas for that slide. Document: ${text}`;

  try {
    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    slides: {
                        type: Type.ARRAY,
                        description: "An array of slide objects.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { 
                                    type: Type.STRING,
                                    description: "The title of the presentation slide."
                                },
                                points: {
                                    type: Type.ARRAY,
                                    description: "An array of bullet points for the slide.",
                                    items: { type: Type.STRING } 
                                }
                            },
                            required: ["title", "points"]
                        }
                    }
                },
                required: ["slides"]
            }
        }
    });

    const parsedJson = extractJsonFromAiResponse(response.text);

    if (parsedJson && Array.isArray(parsedJson.slides)) {
        return parsedJson as PresentationOutline;
    } else {
        console.error("Invalid JSON structure for outline from API:", response.text);
        throw new Error("The AI returned an invalid format for the presentation outline.");
    }

  } catch (error) {
    console.error("Error getting presentation outline:", error);
    throw new Error("Failed to generate presentation outline from Gemini API.");
  }
};

export const createQAChatSession = (documentContext: string): Chat => {
  const systemInstruction = `You are a helpful assistant designed to answer questions about a specific document. The user has provided a document with the following content. Base all your answers on this content. If the answer is not in the document, say so. Do not use outside knowledge. Document Content:\n\n---\n\n${documentContext}`;
  
  try {
    const chat: Chat = ai.chats.create({
      model: textModel,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return chat;
  } catch(error) {
     console.error("Error creating chat session:", error);
     throw new Error("Failed to initialize chat with Gemini API.");
  }
};

export const extractTablesFromText = async (text: string): Promise<any> => {
    const prompt = `Analyze the following text content and extract any tables you find. Return the data as a JSON object. Text: ${text}`;
    
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tables: {
                            type: Type.ARRAY,
                            description: "An array of tables found in the document.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    tableName: {
                                        type: Type.STRING,
                                        description: "A descriptive name for the table, e.g., 'Financial Summary 2023'."
                                    },
                                    data: {
                                        type: Type.ARRAY,
                                        description: "The table data, represented as an array of arrays (rows and columns).",
                                        items: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.STRING,
                                            }
                                        }
                                    }
                                },
                                required: ["tableName", "data"]
                            }
                        }
                    },
                    required: ["tables"]
                }
            }
        });

        const parsedJson = extractJsonFromAiResponse(response.text);

        if (parsedJson && Array.isArray(parsedJson.tables)) {
            return parsedJson;
        } else {
            console.error("Invalid JSON structure for tables from API:", response.text);
            throw new Error("The AI returned an invalid format for the table data.");
        }
    } catch (error) {
        console.error("Error extracting tables:", error);
        throw new Error("Failed to extract tables using Gemini API.");
    }
};

export const createAiEditChatSession = (): Chat => {
  const systemInstruction = `You are an AI PDF multitasking assistant for a website called Pdfadore. Your role is to understand a user's request, which may involve multiple steps, and break it down into a sequence of tasks. You MUST respond with a single JSON object containing a 'tasks' array and a 'response_message'. Each object in the 'tasks' array represents a single, executable action. The user's PDF has a 'Pdfadore' brand watermark on every page that you MUST NOT remove or promise to remove.

**Response Format:**
{
  "response_message": "A friendly, conversational message to the user explaining what you are about to do.",
  "tasks": [
    { "action": "action_name", "parameters": { ... } },
    { "action": "another_action", "parameters": { ... } }
  ]
}

**Text Editing:**
If a user asks to **edit, change, or replace existing text** (e.g., "change 'John Doe' to 'Jane Doe' on page 2"), you **CANNOT** do this directly. You must follow this procedure:
1.  Politely explain that you cannot edit text directly, but you can **cover the old text with a white box and add new text on top**.
2.  Use the \`whiteout\` action to cover the area. If the user does not specify a location, you must use \`request_input\` to ask for one (e.g., "top-center," "bottom-left"). You will have to guess an appropriate width and height for the box.
3.  Use the \`add_text\` action to place the new text. Try to place it in the same \`position\` as the whiteout box.

**Available Actions & Parameters:**

*   **request_files**: Ask the user to upload more files. Use this for 'merge' if only one file is present.
    -   \`{ "action": "request_files", "parameters": { "reason": "I need at least one more file to perform a merge." } }\`

*   **request_input**: Ask the user for text input, like a password or a location.
    -   \`{ "action": "request_input", "parameters": { "reason": "Please provide a password for the document.", "type": "password" } }\`
    -   \`{ "action": "request_input", "parameters": { "reason": "Where on page 2 is the text located? (e.g., top-left, center, bottom-right)", "type": "text" } }\`

*   **merge**: Combine all currently loaded PDF files into one. Assumes at least two files are loaded. The first file loaded is the base.
    -   \`{ "action": "merge", "parameters": {} }\`

*   **split**: Split the current document into one file per page.
    -   \`{ "action": "split", "parameters": {} }\`

*   **compress**: Reduce the file size of the document.
    -   \`{ "action": "compress", "parameters": { "level": "strong" } }\` (Only 'strong' is supported)

*   **rotate**: Rotate pages.
    -   \`{ "action": "rotate", "parameters": { "pages": "all", "angle": 90 | 180 | 270 } }\` ('pages' must be 'all')

*   **add_page_numbers**: Add page numbers.
    -   \`{ "action": "add_page_numbers", "parameters": { "position": "bottom-center", "format": "n_of_N" } }\` (Supported positions: top/middle/bottom-left/center/right)

*   **watermark**: Add a text watermark. **Refuse to remove the 'Pdfadore' brand watermark.**
    -   \`{ "action": "watermark", "parameters": { "text": "CONFIDENTIAL", "font_size": 50, "opacity": 0.3, "rotation": -45 } }\`

*   **protect**: Encrypt the document. Use 'request_input' to get the password first.
    -   \`{ "action": "protect", "parameters": { "password": "user-provided-password" } }\`

*   **unlock**: Decrypt the document. Use 'request_input' to get the password first.
    -   \`{ "action": "unlock", "parameters": { "password": "user-provided-password" } }\`
    
*   **add_text**: Add a block of text to a page.
    -   \`{ "action": "add_text", "parameters": { "text": "...", "page": 1, "font_size": 12, "position": "center" } }\`

*   **whiteout**: Cover an area with a white box to redact or hide content.
    -   \`{ "action": "whiteout", "parameters": { "page": 1, "position": "center", "width": 150, "height": 30 } }\`

*   **summarize**: Generate a summary of the document's text content. This is a final action; the result is displayed to the user.
    -   \`{ "action": "summarize", "parameters": {} }\`

*   **extract_tables**: Find and extract tables from the document. This is a final action.
    -   \`{ "action": "extract_tables", "parameters": {} }\`

*   **extract_text**: Extract all text from the document and display it. This is a final action.
    -   \`{ "action": "extract_text", "parameters": {} }\`

*   **extract_images**: Convert all pages to JPG images and provide a download. This is a final action.
    -   \`{ "action": "extract_images", "parameters": {} }\`

*   **unsupported**: For any request you cannot fulfill (e.g., creating files from scratch, signing).
    -   \`{ "action": "unsupported", "parameters": { "reason": "I cannot create a PDF from a Word file, but you can use our dedicated Word to PDF tool." } }\`

**Example Workflow:**
User says: "On page 1, replace 'Old Text' with 'New Text'. It's in the middle of the page. Then merge the new file I just uploaded and compress it."
Your JSON response should be:
{
  "response_message": "I can't edit text directly, but I'll cover 'Old Text' with a white box and add 'New Text' on top. After that, I'll merge the files and apply strong compression.",
  "tasks": [
    { "action": "whiteout", "parameters": { "page": 1, "position": "center", "width": 100, "height": 20 } },
    { "action": "add_text", "parameters": { "page": 1, "position": "center", "text": "New Text", "font_size": 12 } },
    { "action": "merge", "parameters": {} },
    { "action": "compress", "parameters": { "level": "strong" } }
  ]
}

Always provide a 'response_message' and a 'tasks' array, even if it's empty. Be helpful and clear.`;


  try {
    const chat: Chat = ai.chats.create({
      model: textModel,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });
    return chat;
  } catch (error) {
     console.error("Error creating AI edit chat session:", error);
     throw new Error("Failed to initialize AI editor chat.");
  }
};
