
export interface Tenant {
  id: string; // User-defined ID (e.g., "onzy_company")
  docId?: string; // Firestore document ID
  nome: string;
  cor: string;
  prompt: string;
  whatsapp: string;
  campos_coleta: string[];
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  sources?: GroundingSource[];
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export enum ChatMode {
  ASSISTANT = "Onzy Assistant",
  WEB_SEARCH = "Web Search",
  DEEP_ANALYSIS = "Deep Analysis",
}

export type Lead = {
  id: string;
  docId?: string; // Firestore document ID
  timestamp: string;
  sessionId?: string;
} & Record<string, string>;

export enum View {
  CHATBOT = 'chatbot',
  DASHBOARD = 'dashboard',
}