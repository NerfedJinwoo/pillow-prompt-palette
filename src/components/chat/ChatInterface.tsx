import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Image, 
  Paperclip, 
  StopCircle, 
  RefreshCw,
  Brain,
  User,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  model?: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

interface ChatInterfaceProps {
  sessionId: string;
  messages: Message[];
  onSendMessage: (content: string, imageFile?: File) => void;
  onStopGeneration: () => void;
  onRegenerateResponse: (messageId: string) => void;
  isGenerating: boolean;
}

export function ChatInterface({
  sessionId,
  messages,
  onSendMessage,
  onStopGeneration,
  onRegenerateResponse,
  isGenerating,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    onSendMessage(input.trim(), selectedImage || undefined);
    setInput("");
    setSelectedImage(null);
    setImagePreview(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied successfully",
    });
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-chat-background">
      {/* Header */}
      <div className="p-4 border-b border-chat-border bg-chat-message-ai/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-ai rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">Pillow AI Assistant</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Multi-model AI • Image Analysis • Creative Generation
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {messages.length} messages
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-ai rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Welcome to Pillow AI</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your advanced AI assistant with multi-model capabilities. Ask questions, analyze images, 
                or generate creative content.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <div className="p-4 rounded-lg bg-gradient-message border border-chat-border">
                  <h4 className="font-medium mb-1">💬 Natural Conversations</h4>
                  <p className="text-sm text-muted-foreground">Chat naturally with advanced AI models</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-message border border-chat-border">
                  <h4 className="font-medium mb-1">🖼️ Image Analysis</h4>
                  <p className="text-sm text-muted-foreground">Upload and analyze images with AI</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-message border border-chat-border">
                  <h4 className="font-medium mb-1">🎨 Creative Generation</h4>
                  <p className="text-sm text-muted-foreground">Generate images and creative content</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-message border border-chat-border">
                  <h4 className="font-medium mb-1">📚 Chat History</h4>
                  <p className="text-sm text-muted-foreground">All conversations saved and searchable</p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8 bg-gradient-ai">
                    <AvatarFallback className="bg-transparent">
                      <Brain className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex flex-col gap-2 max-w-[70%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-chat-message-user text-white"
                        : "bg-chat-message-ai border border-chat-border"
                    }`}
                  >
                    {message.imageUrl && (
                      <img
                        src={message.imageUrl}
                        alt="Uploaded image"
                        className="max-w-full h-auto rounded-lg mb-2"
                      />
                    )}
                    
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    
                    {message.isGenerating && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        Generating response...
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.model && <Badge variant="outline" className="text-xs">{message.model}</Badge>}
                    
                    {message.role === "assistant" && !message.isGenerating && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyMessage(message.content)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRegenerateResponse(message.id)}
                          className="h-6 w-6 p-0"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {message.role === "user" && (
                  <Avatar className="w-8 h-8 bg-muted">
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-chat-border bg-chat-message-ai/10">
        <div className="max-w-4xl mx-auto">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-32 max-h-32 rounded-lg border border-chat-border"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
              >
                ×
              </Button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Message Pillow AI..."
                className="min-h-[44px] max-h-[120px] resize-none bg-chat-input border-chat-border focus:ring-ai-primary pr-20"
                disabled={isGenerating}
              />
              
              <div className="absolute right-2 bottom-2 flex gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 w-8 p-0"
                  disabled={isGenerating}
                >
                  <Image className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost" 
                  className="h-8 w-8 p-0"
                  disabled={isGenerating}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {isGenerating ? (
              <Button
                type="button"
                onClick={onStopGeneration}
                variant="outline"
                className="px-4 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Stop
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!input.trim() && !selectedImage}
                className="px-6 bg-gradient-ai hover:opacity-90 transition-all duration-300"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            )}
          </form>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Pillow AI can analyze images, generate content, and engage in natural conversations.
          </p>
        </div>
      </div>
    </div>
  );
}