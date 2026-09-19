import { useState } from 'react'
import NoteForm from './NoteForm'
import UrlForm from './UrlForm'

type Tab = 'note' | 'url'

interface Props {
    onSuccess: () => void
}

export default function IngestPanel({ onSuccess }: Props) {
    const [tab, setTab] = useState<Tab>('note')

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Add Knowledge</h2>

            {/* Tab switcher */}
            <div className="flex gap-1 mb-4 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => setTab('note')}
                    className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors ${tab === 'note'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Note
                </button>
                <button
                    type="button"
                    onClick={() => setTab('url')}
                    className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors ${tab === 'url'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    URL
                </button>
            </div>

            {tab === 'note' ? (
                <NoteForm onSuccess={onSuccess} />
            ) : (
                <UrlForm onSuccess={onSuccess} />
            )}
        </section>
    )
}
