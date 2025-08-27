import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [credentials, setCredentials] = useState({
    id: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (credentials.id === "admin" && credentials.password === "admin") {
      localStorage.setItem("pillow-auth", "authenticated");
      toast({
        title: "Welcome to Pillow AI",
        description: "Successfully authenticated. Initializing AI systems...",
      });
      onLogin();
    } else {
      toast({
        title: "Authentication Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-chat-background flex items-center justify-center p-4">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30 animate-pulse" />
      
      <Card className="w-full max-w-md bg-chat-message-ai/50 backdrop-blur-sm border-chat-border shadow-ai">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-ai rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-ai bg-clip-text text-transparent">
              Pillow AI
            </CardTitle>
            <CardDescription className="text-muted-foreground flex items-center justify-center gap-1 mt-2">
              <Sparkles className="w-4 h-4" />
              Advanced AI Assistant
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">User ID</Label>
              <Input
                id="id"
                type="text"
                placeholder="Enter your ID"
                value={credentials.id}
                onChange={(e) => setCredentials(prev => ({ ...prev, id: e.target.value }))}
                className="bg-chat-input border-chat-border focus:ring-ai-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="bg-chat-input border-chat-border focus:ring-ai-primary"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-ai hover:opacity-90 transition-all duration-300 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                "Access Pillow AI"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo credentials:</p>
            <p className="font-mono bg-chat-input px-2 py-1 rounded mt-1">
              ID: admin | Password: admin
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}