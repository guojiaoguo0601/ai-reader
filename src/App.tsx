import { useState, useCallback } from 'react'
import BookShelf from './components/BookShelf'
import FileUploader from './components/FileUploader'
import Reader from './components/Reader'
import Sidebar from './components/Sidebar'
import SettingsModal from './components/SettingsModal'
import AuthModal from './components/AuthModal'
import ProfileModal from './components/ProfileModal'
import { useBooks } from './hooks/useBooks'
import { useAI } from './hooks/useAI'
import { useAuth } from './hooks/useAuth'
import type { Book } from './types'

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut, signInWithOAuth } = useAuth()
  const { books, addBook, updateBook, removeBook } = useBooks(user?.id)
  const { config, updateConfig, response, send } = useAI()
  const [view, setView] = useState<'shelf' | 'reader'>('shelf')
  const [currentBook, setCurrentBook] = useState<Book | null>(null)
  const [showUploader, setShowUploader] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [selectedText, setSelectedText] = useState('')

  const handleSelectBook = useCallback((book: Book) => {
    setCurrentBook(book)
    setView('reader')
    updateBook(book.id, { lastReadAt: Date.now() })
  }, [updateBook])

  const handleUpdateBook = useCallback((patch: Partial<Book>) => {
    if (currentBook) {
      updateBook(currentBook.id, patch)
      setCurrentBook({ ...currentBook, ...patch })
    }
  }, [currentBook, updateBook])

  const handleTextSelect = useCallback(() => {
    const text = window.getSelection()?.toString() || ''
    if (text.length > 10) {
      setSelectedText(text.slice(0, 3000))
    }
  }, [])

  return (
    <div className="app" onMouseUp={view === 'reader' ? handleTextSelect : undefined}>
      {view === 'shelf' ? (
        <BookShelf
          books={books}
          user={user}
          authLoading={authLoading}
          onSelect={handleSelectBook}
          onRemove={removeBook}
          onAdd={() => setShowUploader(true)}
          onSignIn={() => setShowAuth(true)}
          onSignOut={signOut}
          onOpenProfile={() => setShowProfile(true)}
        />
      ) : (
        <div className="reader-layout">
          {currentBook && (
            <>
              <Reader
                book={currentBook}
                onBack={() => setView('shelf')}
                onUpdate={handleUpdateBook}
              />
              <Sidebar
                selectedText={selectedText}
                response={response}
                send={send}
                onOpenSettings={() => setShowSettings(true)}
              />
            </>
          )}
        </div>
      )}

      {showUploader && (
        <FileUploader
          onAdd={addBook}
          onClose={() => setShowUploader(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          config={config}
          updateConfig={updateConfig}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSignIn={signIn}
          onSignUp={signUp}
          onOAuth={signInWithOAuth}
        />
      )}

      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  )
}

export default App
