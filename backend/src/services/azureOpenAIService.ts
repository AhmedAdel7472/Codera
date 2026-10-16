import { config } from '../config/env.js';

export class AzureOpenAIService {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor() {
    this.apiKey = config.azure.apiKey;
    this.baseURL = config.azure.baseURL;
    this.model = config.azure.model;
  }

  public async generateCompletion(
    userPrompt: string,
    systemPrompt: string = 'You are an expert AI Assessment System for inclusive tech education.'
  ): Promise<string> {
    if (!this.apiKey) {
      console.warn('[AzureOpenAI] No API key configured. Returning heuristic response.');
      return this.heuristicFallback(userPrompt);
    }

    const endpoint = `${this.baseURL}/chat/completions?api-version=2024-02-15-preview`;
    
    // Azure OpenAI Chat Completions payload
    const payload = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 800
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[AzureOpenAI] Request failed status ${response.status}:`, errorText);
        return this.heuristicFallback(userPrompt);
      }

      const json = (await response.json()) as any;
      const content = json.choices?.[0]?.message?.content?.trim();
      return content || this.heuristicFallback(userPrompt);
    } catch (err) {
      console.error('[AzureOpenAI] Error contacting Azure:', err);
      return this.heuristicFallback(userPrompt);
    }
  }

  public async generateQualitativeSummary(sessionData: any, placement: any): Promise<string> {
    const studentName = sessionData.student_name || 'الطالب';
    const score = sessionData.total_score || 0;
    const track = placement?.primaryTrack || sessionData.placed_track || 'Builder';

    const systemPrompt = `You are a clinical educational AI assistant for CodeRa. Provide a constructive, professional 2-3 sentence assessment summary in Arabic addressing the student's strengths, target track, and recommended next steps for inclusive tech learning.`;

    const userPrompt = `
الطالب: ${studentName}
الدرجة الإجمالية: ${score}/100
المسار المقترح: ${track}
تفاصيل المجالات:
${JSON.stringify(sessionData.domain_scores || {}, null, 2)}
قدم ملخصاً تحليلياً دقيقاً باللغة العربية.`;

    return this.generateCompletion(userPrompt, systemPrompt);
  }

  private heuristicFallback(prompt: string): string {
    return 'أظهر الطالب أداءً متزناً يعكس قدرة استيعابية واعدة في التفكير المنطقي وحل المشكلات. يوصى بالاستمرار في تعزيز المهارات الرقمية الموجهة ودعم التدريب العملي لضمان التقدم الأكاديمي والتقني.';
  }
}

export const azureOpenAIService = new AzureOpenAIService();
