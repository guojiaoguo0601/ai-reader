import { BookOpen, Trash2, Clock, Plus, User, LogIn, LogOut } from 'lucide-react';
import type { Book } from '../types';

interface Props {
  books: Book[];
  user: { email?: string; user_metadata?: { avatar_url?: string; nickname?: string } } | null;
  authLoading: boolean;
  onSelect: (book: Book) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenProfile: () => void;
}

export default function BookShelf({ books, user, authLoading, onSelect, onRemove, onAdd, onSignIn, onSignOut, onOpenProfile }: Props) {
  const avatarUrl = user?.user_metadata?.avatar_url;
  const nickname = user?.user_metadata?.nickname;
  const displayName = nickname || user?.email?.split('@')[0] || '用户';

  return (
    <div className="bookshelf">
      <div className="bookshelf-header">
        <h1>我的书架</h1>
        <div className="bookshelf-actions">
          {authLoading ? (
            <span className="auth-loading">加载中...</span>
          ) : user ? (
            <div className="user-chip" onClick={onOpenProfile} title="个人资料">
              <div className="user-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" />
                ) : (
                  <User size={14} />
                )}
              </div>
              <span className="user-email">{displayName}</span>
              <button
                className="icon-btn"
                onClick={e => { e.stopPropagation(); onSignOut(); }}
                title="退出"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className="btn-primary btn-ghost" onClick={onSignIn}>
              <LogIn size={16} />
              登录
            </button>
          )}
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            导入书籍
          </button>
        </div>
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
