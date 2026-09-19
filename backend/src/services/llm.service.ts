import { AppError } from "../utils/errors.js";

const OLLAMA_BASE_URL =
    process.env.OLLAMA_BASE_URL ||
    "http://localhost:11434";

const LLM_MODEL =
    process.env.OLLAMA_LLM_MODEL ||
    "gemma3:1b";

interface OllamaChatResponse {
    message?: {
        role?: string;
        content?: string;
    };
}

export async function generateAnswer(
    question: string,
    context: string
): Promise<string> {
    const prompt = `
You are answering a user's question using ONLY the saved knowledge provided below.

IMPORTANT:
- Read the context carefully before answering.
- Directly answer the question using facts from the context.
- Do not give a generic response.
- Do not use outside knowledge.
- Do not invent facts.
- When the question asks "what", explain the definition or main facts.
- When the question asks "how", describe the specific methods or steps found in the context.
- When the question asks "why", explain only reasons supported by the context.
- Use 1 to 3 clear sentences or concise bullet points.
- Do not mention the retrieval process.
- Do not add citation numbers like [1] or [2].
- If the context genuinely does not contain the answer, respond exactly:
"I couldn't find enough information in your saved content to answer that."

QUESTION:
${question}

SAVED KNOWLEDGE:
${context}
`.trim();

    try {
        const response = await fetch(
            `${OLLAMA_BASE_URL}/api/chat`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: LLM_MODEL,
                    stream: false,
                    messages: [
                        {
                            role: "system",
                            content:
                                "Answer strictly from the supplied saved knowledge.",
                        },
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    options: {
                        temperature: 0,
                        num_predict: 180,
                    },
                }),
            }
        );

        if (!response.ok) {
            const message = await response.text();

            throw new Error(
                `Ollama LLM request failed (${response.status}): ${message}`
            );
        }

        const data =
            (await response.json()) as OllamaChatResponse;

        const answer =
            data.message?.content?.trim();

        if (!answer) {
            throw new Error(
                "Ollama returned an empty response."
            );
        }

        return answer;
    } catch {
        throw new AppError(
            502,
            "Failed to generate an answer. Make sure Ollama and the LLM model are running.",
            "LLM_FAILED"
        );
    }
}