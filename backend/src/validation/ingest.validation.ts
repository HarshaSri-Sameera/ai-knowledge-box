import { z } from "zod";

const titleSchema = z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer");

const textIngestSchema = z
    .object({
        type: z.literal("text"),
        title: titleSchema,
        content: z
            .string()
            .trim()
            .min(1, "Content is required")
            .max(50_000, "Content must be 50,000 characters or fewer"),
    })
    .strict();

const urlIngestSchema = z
    .object({
        type: z.literal("url"),
        title: titleSchema,
        url: z
            .string()
            .trim()
            .url("A valid URL is required")
            .refine((value) => {
                try {
                    const parsed = new URL(value);
                    return parsed.protocol === "http:" || parsed.protocol === "https:";
                } catch {
                    return false;
                }
            }, "Only HTTP and HTTPS URLs are allowed"),
    })
    .strict();

export const ingestRequestSchema = z.discriminatedUnion("type", [
    textIngestSchema,
    urlIngestSchema,
]);

export type ValidatedIngestRequest = z.infer<typeof ingestRequestSchema>;