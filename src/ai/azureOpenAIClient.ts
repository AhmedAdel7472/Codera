export class AzureOpenAIClient {
  private endpoint: string = '';
  private apiKey: string = '';
  private model: string = 'o4-mini';

  constructor() {
    const defaultEncKey = 'NVFhTWxHZHd4Qzg1bnkzeVdLMG1GMHd2R2hMQnhFRUxkQkh2RkNhWkFSSVhiN2ZjNXpMR0pRUUo5OUNGQ2ZoaE1rNVhKM3czQUFBQUFDT0c4WFhP';
    this.endpoint = import.meta.env.VITE_AZURE_ENDPOINT || 'https://ah30309142502238-8748-resource.services.ai.azure.com/openai/v1/responses';
    const envKey = import.meta.env.VITE_AZURE_API_KEY || defaultEncKey;
    try {
      this.apiKey = typeof atob === 'function' ? atob(envKey) : envKey;
    } catch (e) {
      this.apiKey = envKey;
    }
  }

  /**
   * Attempts live completion via configured Azure AI o4-mini OpenAI endpoint.
   */
  public async generateCompletion(prompt: string, systemPrompt: string = 'You are an expert AI Assessment System.'): Promise<string | null> {
    if (!this.apiKey) {
      console.warn('[CognixAI] ❌ No API key configured — using fallback generator.');
      return null;
    }

    const payload = {
      model: this.model,
      input: `${systemPrompt}\n\nUser Prompt: ${prompt}`
    };

    // In dev mode, try target endpoint + local Vite proxy.
    // In production hosting (GitHub Pages), try target endpoint + CORS proxy wrapper.
    const endpointsToTry = import.meta.env.DEV
      ? [this.endpoint, '/api/openai-proxy']
      : [
          this.endpoint,
          `https://corsproxy.io/?${encodeURIComponent(this.endpoint)}`
        ];

    for (const url of endpointsToTry) {
      const requestId = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      console.group(`[CognixAI] 🔷 Azure OpenAI Request [${requestId}]`);
      console.log('📤 Endpoint:', url);
      console.log('📤 Model:', this.model);
      console.log('📤 Prompt (first 200 chars):', prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''));
      console.log('📤 Full payload:', JSON.stringify(payload, null, 2));
      const startTime = performance.now();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.warn(`[CognixAI] ⏰ Request [${requestId}] timed out after 10s`);
          controller.abort();
        }, 10000);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const elapsedMs = Math.round(performance.now() - startTime);
        console.log(`📥 Response Status: ${response.status} ${response.statusText} (${elapsedMs}ms)`);

        if (response.ok) {
          const data = await response.json();
          console.log('📥 Response Body:', JSON.stringify(data, null, 2));

          // 1. Extract from o4-mini responses output structure
          if (data.output && Array.isArray(data.output)) {
            for (const item of data.output) {
              if (item.type === 'message' && Array.isArray(item.content)) {
                for (const contentItem of item.content) {
                  if (contentItem.type === 'output_text' && contentItem.text) {
                    console.log('✅ Extracted text from output_text:', contentItem.text.substring(0, 100));
                    console.groupEnd();
                    return contentItem.text;
                  }
                }
              }
            }
          }

          // 2. Fallback choices structure
          if (data.choices?.[0]?.message?.content) {
            console.log('✅ Extracted text from choices:', data.choices[0].message.content.substring(0, 100));
            console.groupEnd();
            return data.choices[0].message.content;
          }

          console.warn('[CognixAI] ⚠️ Response OK but could not extract text from response body.');
        } else {
          const errBody = await response.text().catch(() => '');
          console.error(`[CognixAI] ❌ HTTP Error ${response.status}:`, errBody);
        }
      } catch (e: any) {
        const elapsedMs = Math.round(performance.now() - startTime);
        if (e?.name === 'AbortError') {
          console.error(`[CognixAI] ❌ Request aborted (timeout) after ${elapsedMs}ms`);
        } else {
          console.error(`[CognixAI] ❌ Network/fetch error after ${elapsedMs}ms:`, e?.message || e);
        }
      }
      console.log('[CognixAI] 🔄 Trying next endpoint or falling back...');
      console.groupEnd();
    }

    console.warn('[CognixAI] ⚠️ All endpoints failed — using procedural fallback generator.');
    return null;
  }
}
