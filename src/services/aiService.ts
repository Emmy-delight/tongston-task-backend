interface SummarizeOptions {
  tone: string;
  length: string;
}

const WORD_COUNTS: Record<string, number> = {
  short: 30,
  medium: 60,
  long: 100,
};

// Mock AI — swap body for real OpenAI call if key is available
export const summarize = async (text: string, options: SummarizeOptions): Promise<string> => {
  const { tone, length } = options;

  // Simulate network latency
  const delay = 300 + Math.random() * 500;
  await new Promise<void>((resolve) => setTimeout(resolve, delay));

  // Simulate 5% timeout rate — realistic for assessment
  if (Math.random() < 0.05) {
    throw new Error('TIMEOUT');
  }

  const wordCount = WORD_COUNTS[length] ?? 30;
  const snippet = text.split(' ').slice(0, wordCount).join(' ');

  return `[${tone.toUpperCase()} SUMMARY]: ${snippet}...`;
};

/*
  ── Real OpenAI version ──────────────────────────────────────────────────────
  Uncomment and install: npm i openai

  import OpenAI from 'openai';
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  export const summarize = async (text: string, options: SummarizeOptions): Promise<string> => {
    const { tone, length } = options;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `Summarize in a ${tone} tone. Keep it ${length}.` },
          { role: 'user', content: text },
        ],
      }, { signal: controller.signal });
      return response.choices[0].message.content ?? '';
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') throw new Error('TIMEOUT');
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  };
  ─────────────────────────────────────────────────────────────────────────────
*/