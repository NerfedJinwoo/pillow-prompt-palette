import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Key, 
  MessageSquare, 
  Image, 
  Brain, 
  Zap,
  Shield,
  Database,
  Sparkles,
  Info
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface SettingsConfig {
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

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsConfig;
  onSettingsUpdate: (settings: SettingsConfig) => void;
}

// Top 10 free models from OpenRouter (example list)
const TEXT_MODELS = [
  { id: "google/gemma-2-9b-it:free", name: "Google Gemma 2 9B", provider: "Google" },
  { id: "microsoft/phi-3-mini-128k-instruct:free", name: "Microsoft Phi-3 Mini", provider: "Microsoft" },
  { id: "google/gemma-2-27b-it:free", name: "Google Gemma 2 27B", provider: "Google" },
  { id: "meta-llama/llama-3.1-8b-instruct:free", name: "Llama 3.1 8B", provider: "Meta" },
  { id: "microsoft/phi-3-medium-128k-instruct:free", name: "Microsoft Phi-3 Medium", provider: "Microsoft" },
  { id: "huggingfaceh4/zephyr-7b-beta:free", name: "Zephyr 7B Beta", provider: "HuggingFace" },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B Instruct", provider: "Mistral AI" },
  { id: "openchat/openchat-7b:free", name: "OpenChat 7B", provider: "OpenChat" },
  { id: "gryphe/mythomist-7b:free", name: "MythoMist 7B", provider: "Gryphe" },
  { id: "undi95/toppy-m-7b:free", name: "Toppy M 7B", provider: "Undi95" },
];

const IMAGE_MODELS = [
  { id: "black-forest-labs/flux-schnell:free", name: "FLUX Schnell", provider: "Black Forest Labs" },
  { id: "stabilityai/stable-diffusion-3-medium:free", name: "Stable Diffusion 3", provider: "Stability AI" },
  { id: "bytedance/sdxl-lightning-4step:free", name: "SDXL Lightning", provider: "ByteDance" },
  { id: "stabilityai/stable-diffusion-xl-base-1.0:free", name: "SDXL Base", provider: "Stability AI" },
  { id: "runwayml/stable-diffusion-v1-5:free", name: "Stable Diffusion 1.5", provider: "RunwayML" },
  { id: "prompthero/openjourney:free", name: "OpenJourney", provider: "PromptHero" },
  { id: "wavymulder/analog-diffusion:free", name: "Analog Diffusion", provider: "WavyMulder" },
  { id: "22h/vintedois-diffusion-v0-1:free", name: "Vintedois Diffusion", provider: "22h" },
  { id: "nitrosocke/nitro-diffusion:free", name: "Nitro Diffusion", provider: "Nitrosocke" },
  { id: "dallinmackay/van-gogh-diffusion:free", name: "Van Gogh Diffusion", provider: "Dallin Mackay" },
];

const DEFAULT_TEMPLATES = [
  "Explain this concept in simple terms:",
  "Analyze this image and describe what you see:",
  "Create a detailed plan for:",
  "Compare and contrast:",
  "Summarize the key points of:",
  "Generate creative ideas for:",
  "Review and improve this text:",
  "What are the pros and cons of:",
];

export function SettingsPanel({ isOpen, onClose, settings, onSettingsUpdate }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<SettingsConfig>(settings);
  const [newTemplate, setNewTemplate] = useState("");

  const handleSave = () => {
    onSettingsUpdate(localSettings);
    toast({
      title: "Settings Saved",
      description: "Your configuration has been updated successfully.",
    });
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: SettingsConfig = {
      openRouterApiKey: "",
      preferredTextModel: TEXT_MODELS[0].id,
      preferredImageModel: IMAGE_MODELS[0].id,
      systemPrompt: "You are Pillow AI, a helpful and intelligent assistant. Be conversational, accurate, and provide detailed responses when appropriate.",
      temperature: 0.7,
      maxTokens: 2048,
      enableImageAnalysis: true,
      enableChatHistory: true,
      autoSaveChats: true,
      messageTemplates: DEFAULT_TEMPLATES,
    };
    setLocalSettings(defaultSettings);
  };

  const addTemplate = () => {
    if (newTemplate.trim()) {
      setLocalSettings(prev => ({
        ...prev,
        messageTemplates: [...prev.messageTemplates, newTemplate.trim()]
      }));
      setNewTemplate("");
    }
  };

  const removeTemplate = (index: number) => {
    setLocalSettings(prev => ({
      ...prev,
      messageTemplates: prev.messageTemplates.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-chat-message-ai border-chat-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5" />
            Pillow AI Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI assistant preferences, API keys, and behavior settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="api" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-chat-input">
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API & Models
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Behavior
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-4">
            <Card className="bg-chat-background border-chat-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-ai-primary" />
                  API Configuration
                </CardTitle>
                <CardDescription>
                  Configure your OpenRouter API key to access AI models. Get your key from{" "}
                  <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" 
                     className="text-ai-primary hover:underline">
                    openrouter.ai
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">OpenRouter API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={localSettings.openRouterApiKey}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, openRouterApiKey: e.target.value }))}
                    placeholder="Enter your OpenRouter API key"
                    className="bg-chat-input border-chat-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key is stored locally and never sent to external servers except OpenRouter.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-chat-background border-chat-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="w-4 h-4 text-ai-primary" />
                    Text Models
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Preferred Text Model</Label>
                    <Select
                      value={localSettings.preferredTextModel}
                      onValueChange={(value) => setLocalSettings(prev => ({ ...prev, preferredTextModel: value }))}
                    >
                      <SelectTrigger className="bg-chat-input border-chat-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-chat-message-ai border-chat-border">
                        {TEXT_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{model.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {model.provider}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-chat-background border-chat-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Image className="w-4 h-4 text-ai-primary" />
                    Image Models
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Preferred Image Model</Label>
                    <Select
                      value={localSettings.preferredImageModel}
                      onValueChange={(value) => setLocalSettings(prev => ({ ...prev, preferredImageModel: value }))}
                    >
                      <SelectTrigger className="bg-chat-input border-chat-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-chat-message-ai border-chat-border">
                        {IMAGE_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{model.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {model.provider}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-4">
            <Card className="bg-chat-background border-chat-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-ai-primary" />
                  AI Behavior Settings
                </CardTitle>
                <CardDescription>
                  Customize how Pillow AI responds and behaves in conversations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={localSettings.systemPrompt}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    placeholder="Define how the AI should behave..."
                    className="min-h-[100px] bg-chat-input border-chat-border"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">
                      Temperature: {localSettings.temperature}
                    </Label>
                    <input
                      id="temperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={localSettings.temperature}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower = more focused, Higher = more creative
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min="100"
                      max="4096"
                      value={localSettings.maxTokens}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                      className="bg-chat-input border-chat-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card className="bg-chat-background border-chat-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-ai-primary" />
                  Feature Settings
                </CardTitle>
                <CardDescription>
                  Enable or disable specific features and capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Image Analysis</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow AI to analyze and describe uploaded images
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.enableImageAnalysis}
                    onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, enableImageAnalysis: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Chat History</Label>
                    <p className="text-sm text-muted-foreground">
                      Save and display conversation history in sidebar
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.enableChatHistory}
                    onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, enableChatHistory: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-Save Chats</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save conversations to local storage
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.autoSaveChats}
                    onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, autoSaveChats: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card className="bg-chat-background border-chat-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-ai-primary" />
                  Message Templates
                </CardTitle>
                <CardDescription>
                  Quick message templates for common tasks and prompts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value)}
                    placeholder="Add a new template..."
                    className="bg-chat-input border-chat-border"
                    onKeyDown={(e) => e.key === "Enter" && addTemplate()}
                  />
                  <Button onClick={addTemplate} className="bg-gradient-ai hover:opacity-90">
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {localSettings.messageTemplates.map((template, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gradient-message rounded-lg border border-chat-border"
                    >
                      <span className="text-sm">{template}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTemplate(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                {localSettings.messageTemplates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No templates added yet</p>
                    <p className="text-sm">Add templates for quick access to common prompts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleReset} className="border-chat-border">
            Reset to Default
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose} className="border-chat-border">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gradient-ai hover:opacity-90">
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}