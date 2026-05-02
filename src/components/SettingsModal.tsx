import { X, ExternalLink, ChevronDown } from 'lucide-react'
import { PROVIDERS, type Provider } from '../hooks/useAI'
import type { AIConfig } from '../types'

interface Props {
  config: AIConfig
  updateConfig: (patch: Partial<AIConfig>) => void
  onClose: () => void
}

export default function SettingsModal({ config, updateConfig, onClose }: Props) {
  const provider = PROVIDERS[config.provider]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>AI 设置</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-form">
          <div className="setting-row">
            <label>模型提供商</label>
            <div className="select-wrapper">
              <select
                value={config.provider}
                onChange={e => updateConfig({ provider: e.target.value as Provider })}
              >
                {Object.entries(PROVIDERS).map(([key, p]) => (
                  <option key={key} value={key}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="select-chevron" />
            </div>
          </div>

          <div className="setting-row">
            <label>模型</label>
            <div className="select-wrapper">
              <select
                value={config.model}
                onChange={e => updateConfig({ model: e.target.value })}
              >
                {provider.models.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="select-chevron" />
            </div>
          </div>

          <div className="setting-row">
            <label>API Key</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={e => updateConfig({ apiKey: e.target.value })}
              placeholder={`${provider.name} API Key...`}
            />
          </div>

          <a
            className="provider-link"
            href={provider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={12} />
            获取 {provider.name} API Key
          </a>
        </div>

        <div className="modal-footer">
          <p className="hint-text">
            推荐：
            <strong>智谱 GLM-4-Flash</strong>（免费）·
            <strong>SiliconFlow Qwen2.5-72B</strong>（免费）·
            <strong>OpenRouter Llama 70B</strong>（免费）
          </p>
          <button className="btn-primary" onClick={onClose}>完成</button>
        </div>
      </div>
    </div>
  )
}
