import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, ChatSession, SettingsConfig } from "@/types/chat";
import { OpenRouterService } from "@/services/openrouter";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEYS = {
  SESSIONS: "pillow-ai-sessions",
  SETTINGS: "pillow-ai-settings",
  ACTIVE_SESSION: "pillow-ai-active-session",
};

const DEFAULT_SETTINGS: SettingsConfig = {
  openRouterApiKey: "",
  preferredTextModel: "google/gemma-2-9b-it:free",
  preferredImageModel: "black-forest-labs/flux-schnell:free",
  systemPrompt: "You are Pillow AI, a helpful and intelligent assistant. Be conversational, accurate, and provide detailed responses when appropriate.",
  temperature: 0.7,
  maxTokens: 2048,
  enableImageAnalysis: true,
  enableChatHistory: true,
  autoSaveChats: true,
  messageTemplates: [
    "Explain this concept in simple terms:",
    "Analyze this image and describe what you see:",
    "Create a detailed plan for:",
    "Compare and contrast:",
    "Summarize the key points of:",
    "Generate creative ideas for:",
    "Review and improve this text:",
    "What are the pros and cons of:",
  ],
};

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsConfig>(DEFAULT_SETTINGS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openRouterService, setOpenRouterService] = useState<OpenRouterService | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const savedActiveSession = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);

    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        timestamp: new Date(session.timestamp),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      setSessions(parsedSessions);
    }

    if (savedSettings) {
      const parsedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      setSettings(parsedSettings);
      if (parsedSettings.openRouterApiKey) {
        setOpenRouterService(new OpenRouterService(parsedSettings.openRouterApiKey));
      }
    }

    if (savedActiveSession) {
      setActiveSessionId(savedActiveSession);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (settings.autoSaveChats && sessions.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }
  }, [sessions, settings.autoSaveChats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (settings.openRouterApiKey) {
      setOpenRouterService(new OpenRouterService(settings.openRouterApiKey));
    } else {
      setOpenRouterService(null);
    }
  }, [settings]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, activeSessionId);
    }
  }, [activeSessionId]);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: "New Chat",
      lastMessage: "",
      timestamp: new Date(),
      messageCount: 0,
      messages: [],
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
  }, [activeSessionId]);

  const renameSession = useCallback((sessionId: string, newTitle: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, title: newTitle }
        : session
    ));
  }, []);

  const addMessage = useCallback((sessionId: string, message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };

    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session;

      const updatedMessages = [...session.messages, newMessage];
      const title = session.title === "New Chat" && message.role === "user" 
        ? message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "")
        : session.title;

      return {
        ...session,
        title,
        messages: updatedMessages,
        lastMessage: message.content,
        messageCount: updatedMessages.length,
        timestamp: new Date(),
      };
    }));

    return newMessage.id;
  }, []);

  const updateMessage = useCallback((sessionId: string, messageId: string, updates: Partial<Message>) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session;

      return {
        ...session,
        messages: session.messages.map(msg => 
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      };
    }));
  }, []);

  const sendMessage = useCallback(async (content: string, imageFile?: File) => {
    if (!openRouterService) {
      toast({
        title: "API Key Required",
        description: "Please configure your OpenRouter API key in settings.",
        variant: "destructive",
      });
      return;
    }

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = createNewSession();
    }

    setIsGenerating(true);

    try {
      // Handle image upload if present
      let imageUrl: string | undefined;
      if (imageFile) {
        // Convert image to base64 for API
        const reader = new FileReader();
        imageUrl = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }

      // Add user message
      const userMessageId = addMessage(currentSessionId, {
        content,
        role: "user",
        imageUrl,
      });

      // Add assistant message (initially generating)
      const assistantMessageId = addMessage(currentSessionId, {
        content: "",
        role: "assistant",
        model: settings.preferredTextModel,
        isGenerating: true,
      });

      // Prepare messages for API
      const session = sessions.find(s => s.id === currentSessionId);
      const conversationHistory = session?.messages.slice(-10) || []; // Last 10 messages for context
      
      const apiMessages = [
        { role: "system", content: settings.systemPrompt },
        ...conversationHistory
          .filter(msg => !msg.isGenerating)
          .map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        { role: "user", content }
      ];

      // Stream response
      let fullResponse = "";
      
      await openRouterService.sendMessageStream(
        apiMessages,
        settings.preferredTextModel,
        {
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
        },
        (chunk: string) => {
          fullResponse += chunk;
          updateMessage(currentSessionId!, assistantMessageId, {
            content: fullResponse,
            isGenerating: true,
          });
        },
        () => {
          updateMessage(currentSessionId!, assistantMessageId, {
            content: fullResponse,
            isGenerating: false,
          });
          setIsGenerating(false);
        },
        (error: Error) => {
          console.error("OpenRouter error:", error);
          updateMessage(currentSessionId!, assistantMessageId, {
            content: `Error: ${error.message}`,
            isGenerating: false,
          });
          setIsGenerating(false);
          toast({
            title: "Generation Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      );

    } catch (error) {
      console.error("Send message error:", error);
      setIsGenerating(false);
      toast({
        title: "Message Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  }, [activeSessionId, sessions, settings, openRouterService, addMessage, updateMessage, createNewSession]);

  const stopGeneration = useCallback(() => {
    setIsGenerating(false);
    // In a real implementation, you'd also cancel the API request
    toast({
      title: "Generation Stopped",
      description: "Message generation has been cancelled.",
    });
  }, []);

  const regenerateResponse = useCallback(async (messageId: string) => {
    if (!activeSessionId || !openRouterService) return;

    const session = sessions.find(s => s.id === activeSessionId);
    if (!session) return;

    const messageIndex = session.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || session.messages[messageIndex].role !== "assistant") return;

    // Get the user message that prompted this response
    const userMessage = session.messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== "user") return;

    setIsGenerating(true);

    // Update the assistant message to show it's regenerating
    updateMessage(activeSessionId, messageId, {
      content: "",
      isGenerating: true,
    });

    try {
      // Prepare conversation history up to the user message
      const historyMessages = session.messages.slice(0, messageIndex);
      const apiMessages = [
        { role: "system", content: settings.systemPrompt },
        ...historyMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      let fullResponse = "";

      await openRouterService.sendMessageStream(
        apiMessages,
        settings.preferredTextModel,
        {
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
        },
        (chunk: string) => {
          fullResponse += chunk;
          updateMessage(activeSessionId, messageId, {
            content: fullResponse,
            isGenerating: true,
          });
        },
        () => {
          updateMessage(activeSessionId, messageId, {
            content: fullResponse,
            isGenerating: false,
          });
          setIsGenerating(false);
        },
        (error: Error) => {
          console.error("Regeneration error:", error);
          updateMessage(activeSessionId, messageId, {
            content: `Error: ${error.message}`,
            isGenerating: false,
          });
          setIsGenerating(false);
          toast({
            title: "Regeneration Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      );

    } catch (error) {
      console.error("Regenerate error:", error);
      setIsGenerating(false);
      toast({
        title: "Regeneration Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  }, [activeSessionId, sessions, settings, openRouterService, updateMessage]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return {
    sessions,
    activeSession,
    activeSessionId,
    settings,
    isGenerating,
    createNewSession,
    setActiveSessionId,
    deleteSession,
    renameSession,
    sendMessage,
    stopGeneration,
    regenerateResponse,
    updateSettings: setSettings,
  };
}