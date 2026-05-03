import { BookOpen, Trash2, Clock, Plus, User, LogIn, LogOut, Loader2, AlertCircle } from 'lucide-react';
import type { Book } from '../types';

interface Props {
  books: Book[];
  user: { email?: string; user_metadata?: { avatar_url?: string; nickname?: string } } | null;
  authLoading: boolean;
  authError: string;
  onSelect: (book: Book) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenProfile: () => void;
}

export default function BookShelf({ books, user, authLoading, authError, onSelect, onRemove, onAdd, onSignIn, onSignOut, onOpenProfile }: Props) {
  const avatarUrl = user?.user_metadata?.avatar_url;
  const nickname = user?.user_metadata?.nickname;
  const displayName = nickname || user?.email?.split('@')[0] || '用户';

  return (
    <div className="bookshelf">
      <div className="bookshelf-header">
        <h1>我的书架</h1>
        <div className="bookshelf-actions">
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            导入书籍
          </button>
        </div>
      </div>

      {/* 登录状态卡片 */}
      <div className="auth-card">
        {authLoading ? (
          <div className="auth-status loading">
            <Loader2 size={20} className="spin" />
            <span>正在检查登录状态...</span>
          </div>
        ) : authError ? (
          <div className="auth-status error">
            <AlertCircle size={20} />
            <span>连接失败: {authError}</span>
            <button className="btn-primary btn-sm" onClick={() => window.location.reload()}>
              刷新重试
            </button>
          </div>
        ) : user ? (
          <div className="auth-status logged-in">
            <div className="user-info" onClick={onOpenProfile}>
              <div className="user-avatar large">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className="user-details">
                <span className="user-name">{displayName}</span>
                <span className="user-email-small">{user.email}</span>
              </div>
            </div>
            <div className="user-actions">
              <button className="btn-secondary" onClick={onOpenProfile}>
                个人资料
              </button>
              <button className="icon-btn" onClick={onSignOut} title="退出登录">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="auth-status not-logged-in">
            <div className="auth-icon">
              <User size={32} />
            </div>
            <div className="auth-text">
              <p className="auth-title">未登录</p>
              <p className="auth-desc">登录后可同步书籍到云端，换设备不丢失</p>
            </div>
            <button className="btn-primary" onClick={onSignIn}>
              <LogIn size={16} />
              立即登录
            </button>
          </div>
        )}
      </div>

      {books.length === 0 ? (
        <div className="empty">
          <BookOpen size={64} />
          <p>书架空空如也</p>
          <button className="btn-primary" onClick={onAdd}>导入第一本书</button>
        </div>
      ) : (
        <div className="book-grid">
          {books.map(book => (
            <div key={book.id} className="book-card" onClick={() => onSelect(book)}>
              <div className="book-cover">
                <span className="book-title">{book.title}</span>
                <span className="book-author">{book.author}</span>
              </div>
              <div className="book-meta">
                <span><Clock size={12} /> {book.chapters.length} 章</span>
                <button
                  className="icon-btn danger"
                  onClick={e => { e.stopPropagation(); onRemove(book.id); }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
