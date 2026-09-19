import { z } from "zod";

export const queryRequestSchema = z
    .object({
        question: z
            .string()
            .trim()
            .min(1, "Question is required")
            .max(
                2_000,
                "Question must be 2,000 characters or fewer"
            ),
    })
    .strict();

export type ValidatedQueryRequest = z.infer<
    typeof queryRequestSchema
>;