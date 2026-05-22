/** LLM Provider 基类 - 对应规格 BaseProvider */

export abstract class BaseProvider {
  constructor(public readonly name: string) {}

  abstract complete(prompt: string): Promise<{
    text: string;
    tokens: number;
    latencyMs: number;
  }>;
}
