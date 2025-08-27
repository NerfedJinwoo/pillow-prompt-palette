import { useState, useEffect } from "react";
import { LoginPage } from "@/components/auth/LoginPage";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { useChat } from "@/hooks/useChat";
import { toast } from "@/hooks/use-toast";

export default function PillowAI() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
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
    updateSettings,
  } = useChat();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("pillow-auth");
      setIsAuthenticated(authStatus === "authenticated");
      setIsLoading(false);
    };

    // Simulate loading time for better UX
    setTimeout(checkAuth, 500);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    toast({
      title: "Welcome to Pillow AI",
      description: "All systems ready. How can I assist you today?",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("pillow-auth");
    setIsAuthenticated(false);
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out of Pillow AI.",
    });
  };

  const handleSessionSelect = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const handleNewSession = () => {
    createNewSession();
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-chat-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-ai rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-semibold bg-gradient-ai bg-clip-text text-transparent">
              Initializing Pillow AI
            </h2>
            <p className="text-muted-foreground">Loading your AI assistant...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Main application
  return (
    <div className="min-h-screen bg-chat-background flex">
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        onSettingsOpen={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeSession ? (
          <ChatInterface
            sessionId={activeSession.id}
            messages={activeSession.messages}
            onSendMessage={sendMessage}
            onStopGeneration={stopGeneration}
            onRegenerateResponse={regenerateResponse}
            isGenerating={isGenerating}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-20 h-20 bg-gradient-ai rounded-full flex items-center justify-center mx-auto">
                <svg 
                  className="w-10 h-10 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Ready to Chat</h2>
                <p className="text-muted-foreground mb-6">
                  Select an existing conversation or start a new chat to begin interacting with Pillow AI.
                </p>
                <button
                  onClick={handleNewSession}
                  className="px-6 py-3 bg-gradient-ai text-white rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
                >
                  Start New Conversation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsUpdate={updateSettings}
      />
    </div>
  );
}