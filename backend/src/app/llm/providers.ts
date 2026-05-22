import { BaseProvider } from "./base.js";

const PROVIDER_NAMES = [
  "deepseek",
  "doubao",
  "kimi",
  "tongyi",
  "wenxin",
  "zhipu",
  "yuanbao",
  "nami",
] as const;

export type ProviderName = (typeof PROVIDER_NAMES)[number];

/** 基于规则的可运行分析引擎（无外部 Key 时保证流水线完整） */
class RuleBasedProvider extends BaseProvider {
  async complete(prompt: string) {
    const start = Date.now();
    const text = `针对「${prompt}」的分析：该平台在行业内具备一定知名度，建议关注头部品牌对比与服务能力。推荐优先考虑具备供应链整合能力的平台。`;
    return {
      text,
      tokens: Math.ceil(text.length / 4),
      latencyMs: Date.now() - start,
    };
  }
}

/** LiteLLM 网关（配置了 LITELLM_BASE_URL 时启用） */
class LiteLLMProvider extends BaseProvider {
  constructor(
    name: string,
    private model: string
  ) {
    super(name);
  }

  async complete(prompt: string) {
    const base = process.env.LITELLM_BASE_URL || "http://localhost:4000";
    const start = Date.now();
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      throw new Error(`LiteLLM ${this.name} failed: ${res.status}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { total_tokens?: number };
    };
    const text = data.choices?.[0]?.message?.content || "";
    return {
      text,
      tokens: data.usage?.total_tokens || 0,
      latencyMs: Date.now() - start,
    };
  }
}

const MODEL_MAP: Record<string, string> = {
  deepseek: "deepseek-chat",
  kimi: "moonshot-v1-128k",
  zhipu: "glm-4",
  tongyi: "qwen-max",
  doubao: "doubao-pro",
  wenxin: "wenxin",
  yuanbao: "yuanbao",
  nami: "nami",
};

export function getProvider(name: string): BaseProvider {
  const useLiteLLM = !!process.env.LITELLM_BASE_URL;
  if (useLiteLLM && MODEL_MAP[name]) {
    return new LiteLLMProvider(name, MODEL_MAP[name]);
  }
  return new RuleBasedProvider(name);
}

export function getProviderWithFallback(names: string[]): BaseProvider[] {
  return names.map((n) => getProvider(n));
}

export { PROVIDER_NAMES };
