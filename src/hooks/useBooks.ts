import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Book } from '../types'

const STORAGE_KEY = 'ai-reader-books'

function loadLocal(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocal(books: Book[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
}

function toDb(book: Book, userId: string) {
  return {
    id: book.id,
    user_id: userId,
    title: book.title,
    author: book.author,
    chapters: book.chapters,
    current_chapter: book.currentChapter,
    current_scroll: book.currentScroll,
  }
}

function fromDb(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    chapters: row.chapters,
    addedAt: new Date(row.created_at).getTime(),
    lastReadAt: new Date(row.updated_at).getTime(),
    currentChapter: row.current_chapter,
    currentScroll: row.current_scroll,
  }
}

export function useBooks(userId: string | undefined) {
  const [books, setBooks] = useState<Book[]>(loadLocal)
  const [syncing, setSyncing] = useState(false)
  const hasFetched = useRef(false)

  // 未登录：本地存储
  useEffect(() => {
    if (!userId) saveLocal(books)
  }, [books, userId])

  // 已登录：从云端拉取
  useEffect(() => {
    if (!userId || hasFetched.current) return
    hasFetched.current = true
    setSyncing(true)
    supabase
      .from('books')
      .select('*')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('拉取书籍失败:', error)
        } else if (data && data.length > 0) {
          setBooks(data.map(fromDb))
        }
        setSyncing(false)
      })
  }, [userId])

  const syncOne = useCallback(
    async (book: Book) => {
      if (!userId) return
      const { error } = await supabase.from('books').upsert(toDb(book, userId), { onConflict: 'id' })
      if (error) console.error('同步书籍失败:', error)
    },
    [userId]
  )

  const addBook = useCallback(
    (book: Book) => {
      setBooks(prev => [book, ...prev])
      if (userId) syncOne(book)
    },
    [userId, syncOne]
  )

  const updateBook = useCallback(
    (id: string, patch: Partial<Book>) => {
      setBooks(prev => {
        const next = prev.map(b => (b.id === id ? { ...b, ...patch } : b))
        const updated = next.find(b => b.id === id)
        if (updated && userId) syncOne(updated)
        return next
      })
    },
    [userId, syncOne]
  )

  const removeBook = useCallback(
    async (id: string) => {
      setBooks(prev => prev.filter(b => b.id !== id))
      if (userId) {
        await supabase.from('books').delete().eq('id', id)
      }
    },
    [userId]
  )

  return { books, addBook, updateBook, removeBook, syncing }
}
