// ollama-gemma3:1b text-embedding-3-small integration
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { AppError } from "../utils/errors.js";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 5;

function isPrivateIpv4(hostname: string): boolean {
    const parts = hostname.split(".").map(Number);

    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
        return false;
    }

    const [a, b] = parts;

    return (
        a === 10 ||
        a === 127 ||
        a === 169 && b === 254 ||
        a === 192 && b === 168 ||
        a === 172 && b >= 16 && b <= 31
    );
}

function isPrivateIpv6(hostname: string): boolean {
    const normalized = hostname.toLowerCase();

    return (
        normalized === "::1" ||
        normalized === "0:0:0:0:0:0:0:1" ||
        normalized.startsWith("fc") ||
        normalized.startsWith("fd") ||
        normalized.startsWith("fe80:")
    );
}

function isBlockedHostname(hostname: string): boolean {
    const normalized = hostname
        .toLowerCase()
        .replace(/^\[/, "")
        .replace(/\]$/, "");

    return (
        normalized === "localhost" ||
        isPrivateIpv4(normalized) ||
        isPrivateIpv6(normalized)
    );
}

function validateUrl(rawUrl: string): URL {
    let url: URL;

    try {
        url = new URL(rawUrl);
    } catch {
        throw new AppError(
            400,
            "Invalid URL.",
            "INVALID_URL"
        );
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new AppError(
            400,
            "Only HTTP and HTTPS URLs are allowed.",
            "INVALID_URL_PROTOCOL"
        );
    }

    if (isBlockedHostname(url.hostname)) {
        throw new AppError(
            400,
            "The provided URL points to a restricted host.",
            "BLOCKED_URL_HOST"
        );
    }

    return url;
}

async function readResponseBody(
    response: Response
): Promise<string> {
    const reader = response.body?.getReader();

    if (!reader) {
        return response.text();
    }

    const decoder = new TextDecoder();

    let totalBytes = 0;
    let result = "";

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        totalBytes += value.byteLength;

        if (totalBytes > MAX_RESPONSE_BYTES) {
            await reader.cancel();

            throw new AppError(
                413,
                "The fetched page is too large.",
                "RESPONSE_TOO_LARGE"
            );
        }

        result += decoder.decode(value, { stream: true });
    }

    result += decoder.decode();

    return result;
}

async function fetchWithRedirectLimit(
    url: URL
): Promise<Response> {
    let currentUrl = url;

    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
        const controller = new AbortController();

        const timeout = setTimeout(
            () => controller.abort(),
            FETCH_TIMEOUT_MS
        );

        try {
            const response = await fetch(currentUrl, {
                method: "GET",
                redirect: "manual",
                signal: controller.signal,
                headers: {
                    "User-Agent": "AI-Knowledge-Inbox/1.0",
                    Accept: "text/html,application/xhtml+xml",
                },
            });

            if (
                response.status >= 300 &&
                response.status < 400
            ) {
                const location = response.headers.get("location");

                if (!location) {
                    throw new AppError(
                        502,
                        "The source returned an invalid redirect.",
                        "INVALID_REDIRECT"
                    );
                }

                currentUrl = new URL(location, currentUrl);

                if (
                    currentUrl.protocol !== "http:" &&
                    currentUrl.protocol !== "https:"
                ) {
                    throw new AppError(
                        400,
                        "Redirected URL uses an unsupported protocol.",
                        "INVALID_REDIRECT_PROTOCOL"
                    );
                }

                if (isBlockedHostname(currentUrl.hostname)) {
                    throw new AppError(
                        400,
                        "Redirected URL points to a restricted host.",
                        "BLOCKED_REDIRECT_HOST"
                    );
                }

                continue;
            }

            return response;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            if ((error as Error).name === "AbortError") {
                throw new AppError(
                    504,
                    "The source URL timed out.",
                    "URL_FETCH_TIMEOUT"
                );
            }

            throw new AppError(
                502,
                "Unable to fetch the source URL.",
                "URL_FETCH_FAILED"
            );
        } finally {
            clearTimeout(timeout);
        }
    }

    throw new AppError(
        502,
        "Too many redirects while fetching the source URL.",
        "TOO_MANY_REDIRECTS"
    );
}

export interface FetchedContent {
    title: string;
    content: string;
    sourceUrl: string;
}

export async function fetchUrlContent(
    rawUrl: string
): Promise<FetchedContent> {
    const url = validateUrl(rawUrl);

    const response = await fetchWithRedirectLimit(url);

    if (!response.ok) {
        throw new AppError(
            502,
            `Source returned HTTP ${response.status}.`,
            "URL_FETCH_HTTP_ERROR"
        );
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (
        !contentType.includes("text/html") &&
        !contentType.includes("application/xhtml+xml")
    ) {
        throw new AppError(
            415,
            "The provided URL does not contain an HTML page.",
            "UNSUPPORTED_CONTENT_TYPE"
        );
    }

    const html = await readResponseBody(response);

    if (!html.trim()) {
        throw new AppError(
            422,
            "The source page contains no readable content.",
            "EMPTY_SOURCE_CONTENT"
        );
    }

    const dom = new JSDOM(html, {
        url: url.toString(),
    });

    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent?.trim()) {
        throw new AppError(
            422,
            "Could not extract readable content from the source page.",
            "CONTENT_EXTRACTION_FAILED"
        );
    }

    return {
        title: article.title?.trim() || url.hostname,
        content: article.textContent.trim(),
        sourceUrl: url.toString(),
    };
}