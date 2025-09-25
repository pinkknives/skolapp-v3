import { SkolverketApiClient, skolverketApi } from "@/lib/api/skolverket-client";
import { GradeBand } from "./schemas";

export type SkolverketObjective = { id: string; label: string };

/**
 * Fetch a small, normalized list of curriculum objectives for a subject and grade band.
 * - Uses NEXT_PUBLIC_SKOLVERKET_API_URL implicitly via SkolverketApiClient
 * - 3s timeout (AbortController)
 * - Returns up to ~12 items as { id, label }
 * - Robust fallback to [] on any error
 */
export async function fetchSkolverketObjectives(
  subjectCode: string,
  gradeBand: GradeBand,
  options?: { client?: SkolverketApiClient; limit?: number }
): Promise<SkolverketObjective[]> {
  const limit = Math.max(1, Math.min(options?.limit ?? 12, 50));
  const client = options?.client || skolverketApi;

  if (!subjectCode || !gradeBand) {
    return [];
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const { data } = await client.getCentralContent(subjectCode, gradeBand, 1, limit);
    return (data || [])
      .filter((item) => !!item && typeof item.id === "string" && typeof item.title === "string")
      .map((item) => ({ id: item.id, label: item.title }))
      .slice(0, limit);
  } catch (error) {
    console.warn("[skolverket] objectives fetch failed", {
      subjectCode,
      gradeBand,
      error: (error as Error)?.message || String(error),
    });
    return [];
  } finally {
    clearTimeout(timeout);
  }
}


