import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, List, ArrowLeft } from 'lucide-react';
import type { Book } from '../types';

interface Props {
  book: Book;
  onBack: () => void;
  onUpdate: (patch: Partial<Book>) => void;
}

export default function Reader({ book, onBack, onUpdate }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(18);
  const [showToc, setShowToc] = useState(false);

  const chapter = book.chapters[book.currentChapter] || book.chapters[0];

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = book.currentScroll;
    }
  }, [book.currentChapter]);

  function handleScroll() {
    if (contentRef.current) {
      onUpdate({ currentScroll: contentRef.current.scrollTop });
    }
  }

  function goChapter(idx: number) {
    if (idx >= 0 && idx < book.chapters.length) {
      onUpdate({ currentChapter: idx, currentScroll: 0 });
      setShowToc(false);
    }
  }

  return (
    <div className="reader">
      <div className="reader-toolbar">
        <button className="icon-btn" onClick={onBack} title="返回书架">
          <ArrowLeft size={20} />
        </button>
        <span className="reader-title">{book.title}</span>
        <div className="reader-actions">
          <button className="icon-btn" onClick={() => setFontSize(s => Math.max(12, s - 2))}>-</button>
          <span className="font-label">{fontSize}px</span>
          <button className="icon-btn" onClick={() => setFontSize(s => Math.min(32, s + 2))}>+</button>
          <button className="icon-btn" onClick={() => setShowToc(!showToc)} title="目录">
            <List size={20} />
          </button>
        </div>
      </div>

      <div className="reader-body">
        {showToc && (
          <div className="toc-panel">
            <h3>目录</h3>
            <ul>
              {book.chapters.map((ch, i) => (
                <li
                  key={i}
                  className={i === book.currentChapter ? 'active' : ''}
                  onClick={() => goChapter(i)}
                >
                  {ch.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div
          ref={contentRef}
          className="reader-content"
          onScroll={handleScroll}
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
        >
          <h2 className="chapter-title">{chapter.title}</h2>
          <pre className="chapter-body">{chapter.content}</pre>
        </div>
      </div>

      <div className="reader-nav">
        <button
          className="nav-btn"
          disabled={book.currentChapter <= 0}
          onClick={() => goChapter(book.currentChapter - 1)}
        >
          <ChevronLeft size={18} /> 上一章
        </button>
        <span className="chapter-progress">
          {book.currentChapter + 1} / {book.chapters.length}
        </span>
        <button
          className="nav-btn"
          disabled={book.currentChapter >= book.chapters.length - 1}
          onClick={() => goChapter(book.currentChapter + 1)}
        >
          下一章 <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
