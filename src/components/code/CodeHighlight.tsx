import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Code2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CodeHighlightProps {
  code: string;
  language: string;
  title?: string;
  showLineNumbers?: boolean;
}

export function CodeHighlight({ 
  code, 
  language, 
  title = "Code Example", 
  showLineNumbers = true 
}: CodeHighlightProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied successfully",
    });
  };

  const lines = code.split('\n');

  return (
    <Card className="bg-chat-message-ai border-chat-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Code2 className="w-4 h-4 text-ai-primary" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {language}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={copyToClipboard}
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="bg-chat-background rounded-lg p-4 font-mono text-sm overflow-x-auto">
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {showLineNumbers && (
                  <span className="text-muted-foreground select-none w-8 text-right mr-4 flex-shrink-0">
                    {index + 1}
                  </span>
                )}
                <span className="flex-1">
                  {line.length === 0 ? '\u00A0' : line}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Example usage component for demonstration
export function CodeExamples() {
  const htmlExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pillow AI Integration</title>
</head>
<body>
    <!-- Place Pillow AI integration code here -->
    <div id="pillow-ai-container">
        <iframe 
            src="https://pillow-ai.lovable.app" 
            width="100%" 
            height="600"
            frameborder="0">
        </iframe>
    </div>
    
    <!-- Alternative: Direct integration -->
    <script>
        // Add Pillow AI widget to your website
        window.PillowAI = {
            apiKey: 'your-api-key',
            theme: 'dark',
            position: 'bottom-right'
        };
    </script>
    <script src="https://pillow-ai.lovable.app/widget.js"></script>
</body>
</html>`;

  const reactExample = `import { PillowAI } from './components/PillowAI';

function App() {
  return (
    <div className="App">
      <header>
        <h1>My Website</h1>
      </header>
      
      <main>
        {/* Main content */}
        <section>
          <h2>Welcome to our site</h2>
          <p>This is where your content goes.</p>
        </section>
        
        {/* Pillow AI Integration Point */}
        <section className="ai-assistant">
          <PillowAI 
            settings={{
              openRouterApiKey: process.env.REACT_APP_OPENROUTER_KEY,
              theme: 'dark',
              enableImageAnalysis: true
            }}
          />
        </section>
      </main>
    </div>
  );
}

export default App;`;

  const apiExample = `// OpenRouter API Integration Example
const sendToOpenRouter = async (message, model) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Pillow AI'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'You are Pillow AI assistant' },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 2048
    })
  });
  
  return await response.json();
};`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-ai bg-clip-text text-transparent">
          Code Integration Examples
        </h1>
        <p className="text-muted-foreground">
          Here are examples of where and how to integrate Pillow AI code in your projects
        </p>
      </div>

      <CodeHighlight
        code={htmlExample}
        language="HTML"
        title="HTML Integration - Place this in your HTML file"
      />

      <CodeHighlight
        code={reactExample}
        language="React/JSX"
        title="React Integration - Add to your React components"
      />

      <CodeHighlight
        code={apiExample}
        language="JavaScript"
        title="API Integration - Backend/Frontend API calls"
      />

      <Card className="bg-gradient-message border-chat-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-ai-primary" />
            Integration Points Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">HTML Integration</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Add iframe for embedded chat</li>
                <li>• Include widget script in &lt;head&gt;</li>
                <li>• Configure in &lt;body&gt; or before closing tag</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">React Integration</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Import PillowAI component</li>
                <li>• Add to JSX where needed</li>
                <li>• Pass configuration props</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">API Integration</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use OpenRouter endpoints</li>
                <li>• Handle authentication</li>
                <li>• Process streaming responses</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Configuration</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Set API keys securely</li>
                <li>• Configure model preferences</li>
                <li>• Customize UI theme</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}