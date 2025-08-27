import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  LogOut, 
  Brain, 
  Edit3, 
  Trash2,
  Search,
  Sparkles
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onSettingsOpen: () => void;
  onLogout: () => void;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onSettingsOpen,
  onLogout,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRename = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditTitle(currentTitle);
  };

  const saveRename = () => {
    if (editingSessionId && editTitle.trim()) {
      onRenameSession(editingSessionId, editTitle.trim());
    }
    setEditingSessionId(null);
    setEditTitle("");
  };

  const cancelRename = () => {
    setEditingSessionId(null);
    setEditTitle("");
  };

  return (
    <div className="w-80 bg-chat-sidebar border-r border-chat-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-chat-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-ai rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Pillow AI</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Advanced Assistant
            </p>
          </div>
        </div>
        
        <Button 
          onClick={onNewSession}
          className="w-full bg-gradient-ai hover:opacity-90 transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-chat-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-chat-input border-chat-border"
          />
        </div>
      </div>

      {/* Chat Sessions */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                activeSessionId === session.id
                  ? "bg-gradient-message border border-chat-border"
                  : "hover:bg-chat-message-ai/30"
              }`}
              onClick={() => onSessionSelect(session.id)}
            >
              {editingSessionId === session.id ? (
                <div className="space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename();
                      if (e.key === "Escape") cancelRename();
                    }}
                    className="text-sm bg-chat-input border-chat-border"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={saveRename} className="text-xs h-6">
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelRename} className="text-xs h-6">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-ai-primary flex-shrink-0" />
                        <h3 className="font-medium text-sm truncate">{session.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.lastMessage}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {session.messageCount} messages
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {session.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRename(session.id, session.title);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Chat Session</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{session.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteSession(session.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {filteredSessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No conversations found</p>
              <p className="text-sm">Start a new chat to begin</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-chat-border space-y-2">
        <Button
          variant="ghost"
          onClick={onSettingsOpen}
          className="w-full justify-start hover:bg-chat-message-ai/30"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        
        <Separator />
        
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}