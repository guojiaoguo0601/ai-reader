import { useState, useRef, useEffect } from 'react'
import { X, Camera, User as UserIcon, Loader2, Save, KeyRound, Shield, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User | null
  onClose: () => void
  onSignOut: () => void
}

type Tab = 'profile' | 'security'

export default function ProfileModal({ user, onClose, onSignOut }: Props) {
  const [tab, setTab] = useState<Tab>('profile')
  const [nickname, setNickname] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Security tab state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    if (user) {
      setNickname(user.user_metadata?.nickname || '')
      setAvatarUrl(user.user_metadata?.avatar_url || '')
    }
  }, [user])

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
    } catch (e: any) {
      alert('上传失败: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  async function saveProfile() {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { nickname, avatar_url: avatarUrl },
      })
      if (error) throw error
      onClose()
    } catch (e: any) {
      alert('保存失败: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword.length < 6) {
      setPasswordError('新密码至少6位')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPasswordSuccess('密码修改成功')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: any) {
      setPasswordError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const displayName = nickname || user.email?.split('@')[0] || '用户'
  const provider = user.app_metadata?.provider || 'email'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-auth modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>账号设置</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${tab === 'profile' ? 'active' : ''}`}
            onClick={() => setTab('profile')}
          >
            <UserIcon size={14} /> 个人资料
          </button>
          <button
            className={`tab ${tab === 'security' ? 'active' : ''}`}
            onClick={() => setTab('security')}
          >
            <Shield size={14} /> 安全设置
          </button>
        </div>

        {tab === 'profile' && (
          <div className="profile-body">
            <div className="avatar-section">
              <div className="avatar-preview">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" />
                ) : (
                  <UserIcon size={40} />
                )}
                <button
                  className="avatar-upload-btn"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 size={14} className="spin" /> : <Camera size={14} />}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={uploadAvatar}
                />
              </div>
              <span className="avatar-hint">点击更换头像</span>
            </div>

            <div className="setting-row">
              <label>邮箱</label>
              <input type="text" value={user.email || ''} disabled />
            </div>

            <div className="setting-row">
              <label>昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder={displayName}
              />
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-label">登录方式</span>
                <span className="stat-value">{provider === 'google' ? 'Google' : '邮箱密码'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">注册时间</span>
                <span className="stat-value">
                  {new Date(user.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 'auto' }}>
              <button className="btn-primary btn-full" onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                保存
              </button>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="profile-body">
            {provider === 'email' && (
              <form onSubmit={changePassword} className="auth-form">
                <h3 className="section-title"><KeyRound size={16} /> 修改密码</h3>

                <div className="setting-row">
                  <label>新密码</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="至少6位字符"
                    required
                    minLength={6}
                  />
                </div>

                <div className="setting-row">
                  <label>确认新密码</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="再次输入新密码"
                    required
                  />
                </div>

                {passwordError && <p className="error">{passwordError}</p>}
                {passwordSuccess && <p className="error success">{passwordSuccess}</p>}

                <button type="submit" className="btn-primary btn-full" disabled={saving}>
                  {saving ? <Loader2 size={16} className="spin" /> : '修改密码'}
                </button>
              </form>
            )}

            {provider === 'google' && (
              <div className="oauth-hint">
                <p>你使用 Google 账号登录，密码由 Google 管理。</p>
              </div>
            )}

            <div className="danger-zone">
              <h3 className="section-title danger"><Trash2 size={16} /> 危险操作</h3>
              <button
                className="btn-danger btn-full"
                onClick={() => {
                  if (confirm('确定要退出登录吗？')) {
                    onSignOut()
                    onClose()
                  }
                }}
              >
                退出登录
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
