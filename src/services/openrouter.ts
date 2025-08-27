import { OpenRouterResponse } from "@/types/chat";

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(
    messages: Array<{ role: string; content: string }>,
    model: string,
    options: {
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<OpenRouterResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Pillow AI",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 2048,
        stream: options.stream ?? false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async sendMessageStream(
    messages: Array<{ role: string; content: string }>,
    model: string,
    options: {
      temperature?: number;
      max_tokens?: number;
    } = {},
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Pillow AI",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 2048,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `OpenRouter API error: ${response.status} ${response.statusText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to get response reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // Ignore parsing errors for partial chunks
            }
          }
        }
      }

      onComplete();
    } catch (error) {
      onError(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async generateImage(
    prompt: string,
    model: string,
    options: {
      width?: number;
      height?: number;
      steps?: number;
    } = {}
  ): Promise<{ imageUrl: string }> {
    // Note: Image generation through OpenRouter may have different endpoints
    // This is a placeholder implementation - actual implementation would depend
    // on the specific image model's API requirements
    
    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Pillow AI",
      },
      body: JSON.stringify({
        model,
        prompt,
        size: `${options.width || 1024}x${options.height || 1024}`,
        n: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `OpenRouter Image API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      imageUrl: data.data?.[0]?.url || "",
    };
  }

  async analyzeImage(
    imageUrl: string,
    prompt: string,
    model: string
  ): Promise<string> {
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ];

    const response = await this.sendMessage(messages as any, model);
    return response.choices[0]?.message?.content || "Failed to analyze image";
  }
}