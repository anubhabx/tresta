/**
 * AI Moderation Service
 *
 * Integrates with the OpenAI Moderation API for content classification.
 * Used as an enhancement layer on top of the existing heuristic-based
 * moderation in moderation.service.ts.
 *
 * Falls back gracefully to heuristic-only moderation if:
 *   - OPENAI_API_KEY is not configured
 *   - The API call fails or times out
 *   - The feature flag is disabled
 *
 * @see https://platform.openai.com/docs/guides/moderation
 */

const OPENAI_MODERATION_URL = "https://api.openai.com/v1/moderations";
const TIMEOUT_MS = 5_000;

export interface AIModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  categoryScores: Record<string, number>;
  flaggedCategories: string[];
}

/**
 * Check content against the OpenAI Moderation API.
 *
 * Returns null when the service is unavailable so callers can
 * fall through to heuristic-only moderation without breaking.
 */
export async function checkWithAI(
  content: string,
): Promise<AIModerationResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null; // Graceful no-op when key is absent
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(OPENAI_MODERATION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: content,
        model: "omni-moderation-latest",
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      console.error(
        `[AI Moderation] OpenAI API returned ${response.status}: ${response.statusText}`,
      );
      return null;
    }

    const data = (await response.json()) as {
      results: Array<{
        flagged: boolean;
        categories: Record<string, boolean>;
        category_scores: Record<string, number>;
      }>;
    };

    const result = data.results[0];
    if (!result) return null;

    const flaggedCategories = Object.entries(result.categories)
      .filter(([, flagged]) => flagged)
      .map(([category]) => category);

    return {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores,
      flaggedCategories,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.warn("[AI Moderation] OpenAI API request timed out");
    } else {
      console.error("[AI Moderation] OpenAI API call failed:", error);
    }
    return null;
  }
}

/**
 * Map OpenAI category names to human-readable flag descriptions.
 */
export function formatAIFlags(result: AIModerationResult): string[] {
  const labels: Record<string, string> = {
    sexual: "Sexual content",
    hate: "Hate speech",
    harassment: "Harassment",
    "self-harm": "Self-harm content",
    "sexual/minors": "Sexual content involving minors",
    "hate/threatening": "Threatening hate speech",
    "violence/graphic": "Graphic violence",
    violence: "Violent content",
    "harassment/threatening": "Threatening harassment",
    "self-harm/intent": "Self-harm intent",
    "self-harm/instructions": "Self-harm instructions",
    illicit: "Illicit content",
    "illicit/violent": "Illicit violent content",
  };

  return result.flaggedCategories.map(
    (cat) => `AI: ${labels[cat] ?? cat} detected`,
  );
}
