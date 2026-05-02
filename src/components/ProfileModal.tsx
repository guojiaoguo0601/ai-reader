import { useState, useRef, useEffect } from 'react'
import { X, Camera, User as UserIcon, Loader2, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User | null
  onClose: () => void
}

export default function ProfileModal({ user, onClose }: Props) {
  const [nickname, setNickname] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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

  if (!user) return null

  const displayName = nickname || user.email?.split('@')[0] || '用户'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-auth" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>个人资料</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

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
              <span className="stat-label">用户 ID</span>
              <span className="stat-value">{user.id.slice(0, 8)}...</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">注册时间</span>
              <span className="stat-value">
                {new Date(user.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary btn-full" onClick={saveProfile} disabled={saving}>
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
