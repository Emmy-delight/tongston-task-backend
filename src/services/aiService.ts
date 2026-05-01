import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL ?? 'http://localhost:5000',
    'X-Title': 'T-World Module Service',
  },
});

interface SummarizeOptions {
  tone: string;
  length: string;
}

const WORD_COUNTS: Record<string, number> = {
  short: 30,
  medium: 60,
  long: 100,
};

export const summarize = async (text: string, options: SummarizeOptions): Promise<string> => {
  const { tone, length } = options;
  const wordCount = WORD_COUNTS[length] ?? 30;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000); // 10s hard timeout

  try {
    const response = await client.chat.completions.create(
      {
        model: "baidu/qianfan-ocr-fast:free", // free tier model on OpenRouter
        messages: [
          {
            role: 'system',
            content: [
              `You are a summarization assistant.`,
              `Summarize the user's text in a ${tone} tone.`,
              `Return only the summary text — no preamble, no labels, no quotes.`,
            ].join(' '),
          },
          {
            role: 'user',
            content: text,
          },
        ],
        max_tokens: 200,
        temperature: 0.5,
      },
      { signal: controller.signal }
    );

    const output = response.choices[0]?.message?.content?.trim();

    if (!output) {
      throw new Error('Empty response from AI provider');
    }

    return output;
  } catch (err: unknown) {
    const error = err as Error;

    if (error.name === 'AbortError' || error.message?.includes('abort')) {
      throw new Error('TIMEOUT');
    }

    // OpenRouter rate limit or model error — surface clearly
    if (error.message?.includes('429')) {
      throw new Error('RATE_LIMITED');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};