import { useState, useCallback } from 'react';
import type { AIRequest, AIResponse } from '../types';

export type Provider = 'zhipu' | 'deepseek' | 'siliconflow' | 'openrouter';

interface ProviderConfig {
  name: string;
  endpoint: string;
  defaultModel: string;
  models: { id: string; name: string; free?: boolean }[];
  docsUrl: string;
}

export const PROVIDERS: Record<Provider, ProviderConfig> = {
  zhipu: {
    name: '智谱 AI',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    defaultModel: 'glm-4-flash',
    models: [
      { id: 'glm-4-flash', name: 'GLM-4-Flash（免费）', free: true },
      { id: 'glm-4-air', name: 'GLM-4-Air' },
      { id: 'glm-4-plus', name: 'GLM-4-Plus' },
    ],
    docsUrl: 'https://open.bigmodel.cn/dev/api',
  },
  deepseek: {
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/chat/completions',
    defaultModel: 'deepseek-chat',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek-V3' },
      { id: 'deepseek-reasoner', name: 'DeepSeek-R1' },
    ],
    docsUrl: 'https://platform.deepseek.com/api_keys',
  },
  siliconflow: {
    name: '硅基流动',
    endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
    defaultModel: 'Qwen/Qwen2.5-72B-Instruct',
    models: [
      { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen2.5-72B（免费）', free: true },
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3' },
      { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama-3.3-70B（免费）', free: true },
    ],
    docsUrl: 'https://cloud.siliconflow.cn/account/ak',
  },
  openrouter: {
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'meta-llama/llama-3.1-70b-instruct:free',
    models: [
      { id: 'meta-llama/llama-3.1-70b-instruct:free', name: 'Llama 3.1 70B（免费）', free: true },
      { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek V3（免费）', free: true },
      { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash' },
    ],
    docsUrl: 'https://openrouter.ai/settings/keys',
  },
};

const CONFIG_KEY = 'ai-reader-ai-config';

interface AIConfig {
  provider: Provider;
  model: string;
  apiKey: string;
}

function loadConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { provider: 'zhipu', model: PROVIDERS.zhipu.defaultModel, apiKey: '' };
}

function saveConfig(config: AIConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

function getPrompt(req: AIRequest): string {
  switch (req.type) {
    case 'summarize':
      return `请用中文总结以下文本内容，控制在200字以内：\n\n${req.text}`;
    case 'explain':
      return `请用中文解释以下段落的含义和背景，帮助读者深入理解：\n\n${req.text}`;
    case 'characters':
      return `请分析以下文本中出现的人物，列出他们的名字、身份和相互关系：\n\n${req.text}`;
    case 'vocabulary':
      return `请从以下文本中挑选5个较难或有文学价值的词汇/短语，给出中文释义和用法说明：\n\n${req.text}`;
    case 'ask':
      return `基于以下文本内容，回答问题。\n\n文本：${req.text}\n\n问题：${req.question}`;
    default:
      return req.text;
  }
}

async function callProvider(config: AIConfig, prompt: string): Promise<string> {
  const { provider, model, apiKey } = config;
  const p = PROVIDERS[provider];

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'AI Reader';
  }

  const res = await fetch(p.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      ...(provider === 'zhipu' ? {} : { max_tokens: 2048 }),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return (
    data.choices?.[0]?.message?.content ||
    data.content?.[0]?.text ||
    '无返回内容'
  );
}

export function useAI() {
  const [config, setConfigState] = useState<AIConfig>(loadConfig);
  const [response, setResponse] = useState<AIResponse>({
    content: '',
    loading: false,
  });

  const updateConfig = useCallback((patch: Partial<AIConfig>) => {
    setConfigState(prev => {
      const next = { ...prev, ...patch };
      // When provider changes, reset to its default model
      if (patch.provider && patch.provider !== prev.provider) {
        next.model = PROVIDERS[patch.provider].defaultModel;
      }
      saveConfig(next);
      return next;
    });
  }, []);

  const send = useCallback(
    async (req: AIRequest) => {
      if (!config.apiKey) {
        setResponse({ content: '', loading: false, error: '请先设置 API Key' });
        return;
      }
      setResponse({ content: '', loading: true });
      try {
        const text = await callProvider(config, getPrompt(req));
        setResponse({ content: text, loading: false });
      } catch (e: any) {
        setResponse({ content: '', loading: false, error: e.message });
      }
    },
    [config]
  );

  return { config, updateConfig, response, send };
}
