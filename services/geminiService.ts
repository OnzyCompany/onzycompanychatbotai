// The triple-slash directive for vite/client was causing a resolution error,
// likely due to a tsconfig.json misconfiguration. The directive has been
// removed and a type assertion is used on import.meta.env as a workaround.
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { Tenant, ChatMode, GroundingSource } from '../types';
import { saveLead } from './storageService';

// The API key is injected by the environment.
// Vite exposes environment variables on the client through `import.meta.env`
// and requires them to be prefixed with `VITE_`.
// FIX: Use a type assertion to bypass TypeScript error about `import.meta.env`
// when Vite client types are not correctly loaded.
const API_KEY = (import.meta as any).env.VITE_API_KEY;

let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI instance.
 * Ensures the instance is created only once and only if the API key is available.
 * @returns The GoogleGenAI instance or null if the API key is missing.
 */
function getAiInstance(): GoogleGenAI | null {
  if (ai) {
    return ai;
  }
  if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    return ai;
  }
  // Updated error message to reference the correct variable name in Vercel/Vite.
  console.error("VITE_API_KEY environment variable not set. Gemini API functionality will be disabled.");
  return null;
}


async function getChatResponse(
  prompt: string,
  mode: ChatMode,
  tenant: Tenant,
  chatInstanceRef: { current: Chat | null },
  sessionId: string | null
): Promise<{ text: string; sources?: GroundingSource[] }> {
  const aiInstance = getAiInstance();
  if (!aiInstance) {
    return {
      // Updated error message to reference the correct variable name for the user.
      text: "A configuração da API do Gemini não foi encontrada. Verifique se a chave de API (VITE_API_KEY) está configurada corretamente no ambiente."
    };
  }

  // For tenant-specific views (Admin and Embed), we only use the Assistant mode.
  // The mode switcher is effectively removed, but we keep the logic here for potential future use.
  return getAssistantResponse(prompt, tenant, chatInstanceRef, aiInstance, sessionId);
}

async function getAssistantResponse(
  prompt: string,
  tenant: Tenant,
  chatInstanceRef: { current: Chat | null },
  aiInstance: GoogleGenAI,
  sessionId: string | null
): Promise<{ text: string }> {
  if (!chatInstanceRef.current) {
    chatInstanceRef.current = aiInstance.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: tenant.prompt,
      },
    });
  }
  
  const response = await chatInstanceRef.current.sendMessage({ message: prompt });
  const responseText = response.text;
  
  // Asynchronously check for lead capture without blocking the response
  if (chatInstanceRef.current && tenant.docId) {
    checkForLeadCapture(chatInstanceRef.current, tenant, aiInstance, sessionId);
  }
  
  return { text: responseText };
}

async function checkForLeadCapture(chat: Chat, tenant: Tenant, aiInstance: GoogleGenAI, sessionId: string | null) {
    if (tenant.campos_coleta.length === 0 || !tenant.docId) return;

    const history = await chat.getHistory();
    const recentHistory = history.slice(-4);
    // We need at least a user message and an AI response for meaningful extraction.
    if (recentHistory.length < 2) return;
    
    const fullConversation = recentHistory.map(h => `${h.role === 'user' ? 'Cliente' : 'Assistente'}: ${h.parts.map(p => p.text).join('')}`).join('\n');

    // Dynamically build the schema for the JSON output based on the tenant's collection fields.
    const properties: { [key: string]: { type: Type, description: string } } = {};
    tenant.campos_coleta.forEach(field => {
        // Sanitize the field name to be a valid JSON key for Firestore (camelCase, no special chars).
        const sanitizedKey = field
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters, keeping spaces
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim()
            .split(' ')
            .map((word, index) => 
                index === 0 
                    ? word.toLowerCase() 
                    : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join('');

        properties[sanitizedKey] = {
            type: Type.STRING,
            description: `Extraia o valor para o campo "${field}" da conversa.`
        };
    });

    const extractionPrompt = `
      Com base na conversa a seguir, extraia as informações solicitadas.
      Se a informação para um campo específico não for encontrada, omita esse campo do objeto JSON final.
      
      Conversa:
      ---
      ${fullConversation}
      ---
    `;
    
    const extractionModel = 'gemini-2.5-flash';
    try {
        const response = await aiInstance.models.generateContent({
            model: extractionModel,
            contents: extractionPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: properties,
                }
            }
        });

        let resultText = response.text.trim();
        
        // Handle cases where the model wraps the JSON in a markdown code block
        const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            resultText = jsonMatch[1];
        }

        if (!resultText) {
            console.log("Lead extraction returned empty text.");
            return;
        }

        const extractedData = JSON.parse(resultText);

        // If the extracted object is not empty, save it as a new lead.
        if (Object.keys(extractedData).length > 0) {
            // The keys in extractedData are already sanitized from the schema definition.
            saveLead(tenant.docId, extractedData, sessionId);
            console.log("Lead captured and updated:", extractedData);
        }

    } catch (e) {
        console.error("Could not parse extraction JSON or capture lead.", e);
    }
}


export { getChatResponse };