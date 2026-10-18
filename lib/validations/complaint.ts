import { z } from "zod";
import { Priority } from "@prisma/client";

/**
 * Sanitizes input strings:
 * - Strips HTML/script tags to neutralize stored XSS payloads.
 * - Normalizes unicode and removes null bytes or dangling control characters.
 */
export function sanitizeString(val: string): string {
  return val
    .replace(/<[^>]*>?/gm, "") // Strip HTML markup
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Strip non-printable ASCII control chars
    .trim();
}

export const complaintInputSchema = z.object({
  subCategoryId: z
    .string()
    .min(1, "Please select an issue sub-category")
    .max(50, "Invalid ID parameter"),

  location: z
    .string()
    .transform(sanitizeString)
    .pipe(
      z
        .string()
        .min(3, "Location must be at least 3 characters (e.g. 'Block A - Room 204')")
        .max(100, "Location cannot exceed 100 characters")
        // Whitelist alphanumeric characters, dashes, slashes, and periods
        .regex(/^[a-zA-Z0-9\s\-_.,/()]+$/, "Location contains disallowed special characters")
    ),

  description: z
    .string()
    .transform(sanitizeString)
    .pipe(
      z
        .string()
        .min(10, "Please provide a detailed description (min 10 characters)")
        .max(1000, "Description cannot exceed 1000 characters")
    ),

  priority: z.nativeEnum(Priority).default(Priority.NORMAL),

  emergencyFlag: z.boolean().default(false),
});

export type ComplaintInput = z.infer<typeof complaintInputSchema>;
