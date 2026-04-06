import { type ZodSchema, ZodError } from "zod";
import { badRequest } from "@/lib/api-error";

/**
 * Parse JSON body and validate against a Zod schema.
 * Returns { data } on success or { error: Response } on failure.
 */
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ data: T; error?: never } | { data?: never; error: Response }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { error: badRequest("Invalid JSON.") };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const path = firstIssue.path.length > 0 ? `${firstIssue.path.join(".")}: ` : "";
    return { error: badRequest(`${path}${firstIssue.message}`) };
  }

  return { data: result.data };
}
