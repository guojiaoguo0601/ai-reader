import { useState } from 'react'
import { X, Mail, Lock, User, LogIn, Loader2 } from 'lucide-react'

interface Props {
  onClose: () => void
  onSignIn: (email: string, password: string) => Promise<{ error?: Error }>
  onSignUp: (email: string, password: string) => Promise<{ error?: Error }>
  onOAuth: (provider: 'google') => Promise<{ error?: Error }>
}

type Mode = 'signin' | 'signup'

export default function AuthModal({ onClose, onSignIn, onSignUp, onOAuth }: Props) {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const handler = mode === 'signin' ? onSignIn : onSignUp
    const { error } = await handler(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      if (mode === 'signup') {
        setError('注册成功，请查收验证邮件后登录')
        setMode('signin')
      }
      setLoading(false)
      if (mode === 'signin') onClose()
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    const { error } = await onOAuth('google')
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // OAuth 会跳转，不需要关闭弹窗
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-auth" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'signin' ? '登录' : '注册'}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <button
          type="button"
          className="btn-oauth"
          onClick={handleGoogle}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          使用 Google 账号登录
        </button>

        <div className="divider">
          <span>或</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="setting-row">
            <label>邮箱</label>
            <div className="input-with-icon">
              <Mail size={14} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="setting-row">
            <label>密码</label>
            <div className="input-with-icon">
              <Lock size={14} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="至少6位字符"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <p className={`error ${error.includes('成功') ? 'success' : ''}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="spin" />
            ) : mode === 'signin' ? (
              <>
                <LogIn size={16} /> 登录
              </>
            ) : (
              <>
                <User size={16} /> 注册
              </>
            )}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === 'signin' ? (
            <>
              还没有账号？
              <button className="link-btn" onClick={() => { setMode('signup'); setError('') }}>
                立即注册
              </button>
            </>
          ) : (
            <>
              已有账号？
              <button className="link-btn" onClick={() => { setMode('signin'); setError('') }}>
                直接登录
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
