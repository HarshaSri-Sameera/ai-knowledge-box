import { useState, useCallback } from 'react'
import IngestPanel from './components/IngestPanel'
import ItemsList from './components/ItemsList'
import QueryPanel from './components/QueryPanel'

export default function App() {
  // Incrementing this counter triggers ItemsList to reload
  const [refreshCount, setRefreshCount] = useState(0)
  const triggerRefresh = useCallback(() => setRefreshCount(c => c + 1), [])

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            AI Knowledge Inbox
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Save knowledge. Ask questions.</p>
        </div>
      </header>

      {/* Main layout */}
      <main className="mx-auto max-w-5xl px-6 py-6 flex flex-col gap-6">
        {/* Top row: two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IngestPanel onSuccess={triggerRefresh} />
          <QueryPanel />
        </div>

        {/* Bottom: full-width items list */}
        <ItemsList refresh={refreshCount} />
      </main>
    </div>
  )
}
