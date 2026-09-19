import { useState } from 'react'
import { askQuestion, type QueryResponse } from '../api'
import QuestionInput from './QuestionInput'
import Answer from './Answer'
import Sources from './Sources'

export default function QueryPanel() {
    const [question, setQuestion] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<QueryResponse | null>(null)

    async function handleAsk() {
        if (!question.trim()) return
        setError(null)
        setResult(null)
        setLoading(true)
        try {
            const data = await askQuestion(question.trim())
            setResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get answer')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-4">
            <h2 className="text-base font-semibold text-gray-900">Ask Your Knowledge</h2>

            <QuestionInput
                question={question}
                onChange={setQuestion}
                onSubmit={handleAsk}
                loading={loading}
            />

            {error && (
                <p className="text-sm text-red-600 rounded bg-red-50 px-3 py-2">{error}</p>
            )}

            {loading && (
                <p className="text-sm text-gray-400">Thinking…</p>
            )}

            {result && (
                <div className="flex flex-col gap-4">
                    <Answer text={result.answer} />
                    <Sources citations={result.citations} />
                </div>
            )}
        </section>
    )
}
