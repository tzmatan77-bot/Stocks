/**
 * Resilient JSON parsing utilities for Gemini LLM outputs.
 * Solves:
 * - Markdown code fence wrapping (```json ... ```)
 * - Trailing commas before brackets/braces
 * - Output truncation mid-stream when token limits are reached
 * - Extraction of individual valid objects from an array or stream
 * - Unescaped control characters
 */

export function cleanJsonPayload(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let str = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  // Strip any leading text before first [ or {
  const firstBracket = str.search(/[\[{]/);
  if (firstBracket > 0) {
    str = str.substring(firstBracket);
  }
  return str.trim();
}

/**
 * Parses individual JSON objects from text with a balanced brace parser.
 * Highly effective when a JSON array was truncated mid-way by token exhaustion.
 */
export function extractJsonObjects<T = any>(text: string): T[] {
  const results: T[] = [];
  let depth = 0;
  let inString = false;
  let escape = false;
  let startIdx = -1;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === '{') {
        if (depth === 0) startIdx = i;
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0 && startIdx !== -1) {
          const objStr = text.substring(startIdx, i + 1);
          try {
            const cleanedObj = objStr.replace(/,\s*([}\]])/g, '$1');
            results.push(JSON.parse(cleanedObj));
          } catch {
            // try relaxed parse if needed
          }
          startIdx = -1;
        }
      }
    }
  }
  return results;
}

/**
 * Safely parse a JSON array from LLM text output.
 * If generation was cut off or has syntax issues, recovers all valid items.
 */
export function safeParseJsonArray<T = any>(raw: string): T[] {
  const cleaned = cleanJsonPayload(raw);
  if (!cleaned) return [];

  // 1. Direct parse attempt
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // 2. Remove trailing commas attempt
  try {
    const withoutTrailingCommas = cleaned.replace(/,\s*([}\]])/g, '$1');
    const parsed = JSON.parse(withoutTrailingCommas);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // 3. Truncated array attempt (find last closing brace and close array)
  const lastClosingBrace = cleaned.lastIndexOf('}');
  if (lastClosingBrace > 0 && cleaned.startsWith('[')) {
    const truncated = cleaned.substring(0, lastClosingBrace + 1).replace(/,\s*$/, '') + ']';
    try {
      const fixed = truncated.replace(/,\s*([}\]])/g, '$1');
      const parsed = JSON.parse(fixed);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  // 4. Object extraction with balanced braces
  const extracted = extractJsonObjects<T>(cleaned);
  if (extracted.length > 0) {
    return extracted;
  }

  return [];
}

/**
 * Safely parse a single JSON object from LLM text output.
 */
export function safeParseJsonObject<T = any>(raw: string): T | null {
  const cleaned = cleanJsonPayload(raw);
  if (!cleaned) return null;

  // 1. Direct parse
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as T;
    }
  } catch {}

  // 2. Remove trailing commas
  try {
    const withoutTrailingCommas = cleaned.replace(/,\s*([}\]])/g, '$1');
    const parsed = JSON.parse(withoutTrailingCommas);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as T;
    }
  } catch {}

  // 3. Extract first valid object
  const extracted = extractJsonObjects<T>(cleaned);
  if (extracted.length > 0) {
    return extracted[0];
  }

  return null;
}
