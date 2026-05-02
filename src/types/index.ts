export interface Chapter {
  title: string;
  content: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  chapters: Chapter[];
  addedAt: number;
  lastReadAt: number;
  currentChapter: number;
  currentScroll: number;
}

export interface AIRequest {
  type: 'summarize' | 'explain' | 'characters' | 'ask' | 'vocabulary';
  text: string;
  question?: string;
}

export interface AIResponse {
  content: string;
  loading: boolean;
  error?: string;
}

export interface AIConfig {
  provider: 'zhipu' | 'deepseek' | 'siliconflow' | 'openrouter';
  model: string;
  apiKey: string;
}
