import { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import JSZip from 'jszip';
import type { Book, Chapter } from '../types';

interface Props {
  onAdd: (book: Book) => void;
  onClose: () => void;
}

function parseTxt(text: string): Chapter[] {
  const lines = text.split(/\r?\n/);
  const chapters: Chapter[] = [];
  let currentTitle = '正文';
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(第[一二三四五六七八九十百千零\d]+章|Chapter\s+\d+)/i.test(trimmed)) {
      if (currentContent.length) {
        chapters.push({ title: currentTitle, content: currentContent.join('\n') });
      }
      currentTitle = trimmed;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentContent.length) {
    chapters.push({ title: currentTitle, content: currentContent.join('\n') });
  }

  return chapters.length ? chapters : [{ title: '全文', content: text }];
}

async function parseEpub(file: File): Promise<Chapter[]> {
  const zip = await JSZip.loadAsync(file);
  const container = await zip.file('META-INF/container.xml')?.async('text');
  if (!container) throw new Error('无效的 EPUB 文件');

  const rootfileMatch = container.match(/full-path="([^"]+)"/);
  const opfPath = rootfileMatch?.[1];
  if (!opfPath) throw new Error('无法解析 OPF');

  const opf = await zip.file(opfPath)?.async('text');
  if (!opf) throw new Error('无法读取 OPF');

  const itemMatches = [...opf.matchAll(/<item[^>]+href="([^"]+)"[^>]+media-type="application\/xhtml\+xml"/g)];
  const basePath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);

  const chapters: Chapter[] = [];
  for (const m of itemMatches) {
    const href = m[1];
    const fullPath = basePath + href;
    const html = await zip.file(fullPath)?.async('text');
    if (!html) continue;
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    if (text.length > 50) {
      const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
      chapters.push({
        title: titleMatch?.[1]?.trim() || `章节 ${chapters.length + 1}`,
        content: text,
      });
    }
  }
  return chapters;
}

export default function FileUploader({ onAdd, onClose }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError('');
    try {
      let chapters: Chapter[];
      if (file.name.endsWith('.txt')) {
        const text = await file.text();
        chapters = parseTxt(text);
      } else if (file.name.endsWith('.epub')) {
        chapters = await parseEpub(file);
      } else {
        throw new Error('仅支持 .txt 和 .epub 格式');
      }

      const book: Book = {
        id: crypto.randomUUID(),
        title: file.name.replace(/\.(txt|epub)$/i, ''),
        author: '未知作者',
        chapters,
        addedAt: Date.now(),
        lastReadAt: Date.now(),
        currentChapter: 0,
        currentScroll: 0,
      };
      onAdd(book);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>导入书籍</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div
          className={`drop-zone ${dragOver ? 'active' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.epub"
            hidden
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {loading ? (
            <p>正在解析...</p>
          ) : (
            <>
              <Upload size={40} />
              <p>点击或拖拽上传 .txt / .epub</p>
            </>
          )}
        </div>
        {error && <p className="error">{error}</p>}
        <div className="hint">
          <FileText size={14} />
          <span>支持自动识别章节（通过"第X章"等标题）</span>
        </div>
      </div>
    </div>
  );
}
