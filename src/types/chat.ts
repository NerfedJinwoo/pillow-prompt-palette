export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  model?: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  messages: Message[];
}

export interface SettingsConfig {
  openRouterApiKey: string;
  preferredTextModel: string;
  preferredImageModel: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  enableImageAnalysis: boolean;
  enableChatHistory: boolean;
  autoSaveChats: boolean;
  messageTemplates: string[];
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}