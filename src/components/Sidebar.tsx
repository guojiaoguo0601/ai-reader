import { useState } from 'react'
import { Sparkles, Settings, X, Send, Loader2, BookOpen, User, HelpCircle, Languages } from 'lucide-react'
import type { AIRequest } from '../types'

interface Props {
  selectedText: string
  response: { content: string; loading: boolean; error?: string }
  send: (req: AIRequest) => void
  onOpenSettings: () => void
}

const TOOLS = [
  { type: 'summarize' as const, label: '总结', icon: BookOpen, desc: '总结本章内容' },
  { type: 'explain' as const, label: '深度解读', icon: Sparkles, desc: '解析段落含义' },
  { type: 'characters' as const, label: '人物分析', icon: User, desc: '梳理人物关系' },
  { type: 'vocabulary' as const, label: '词汇精选', icon: Languages, desc: '提取重点词汇' },
]

export default function Sidebar({ selectedText, response, send, onOpenSettings }: Props) {
  const [question, setQuestion] = useState('')

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3><Sparkles size={16} /> AI 助手</h3>
        <button className="icon-btn" onClick={onOpenSettings} title="设置">
          <Settings size={16} />
        </button>
      </div>

      <div className="tools-grid">
        {TOOLS.map(tool => (
          <button
            key={tool.type}
            className="tool-btn"
            disabled={!selectedText || response.loading}
            onClick={() => send({ type: tool.type, text: selectedText })}
          >
            <tool.icon size={16} />
            <span>{tool.label}</span>
            <small>{tool.desc}</small>
          </button>
        ))}
      </div>

      <div className="ask-section">
        <div className="ask-header">
          <HelpCircle size={14} />
          <span>自由提问</span>
        </div>
        <div className="ask-input-row">
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="输入你的问题..."
            onKeyDown={e => {
              if (e.key === 'Enter' && question.trim()) {
                send({ type: 'ask', text: selectedText || '无选中内容', question: question.trim() })
                setQuestion('')
              }
            }}
          />
          <button
            className="icon-btn"
            disabled={!question.trim() || response.loading}
            onClick={() => {
              send({ type: 'ask', text: selectedText || '无选中内容', question: question.trim() })
              setQuestion('')
            }}
          >
            {response.loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>

      <div className="ai-response">
        {(response.content || response.error) && (
          <div className="response-header">
            <span>AI 回答</span>
            <button className="icon-btn" onClick={() => {}} title="清除">
              <X size={14} />
            </button>
          </div>
        )}
        {response.error ? (
          <p className="error-text">{response.error}</p>
        ) : response.content ? (
          <div className="response-content">{response.content}</div>
        ) : (
          <div className="ai-placeholder">
            <Sparkles size={32} />
            <p>选中文字后点击上方功能按钮<br/>或使用自由提问</p>
          </div>
        )}
      </div>
    </div>
  )
}
