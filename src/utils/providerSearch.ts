import type { Provider } from "@/types";
import { extractCodexBaseUrl } from "@/utils/providerConfigUtils";

export type ProviderSearchMatchField =
  | "name"
  | "id"
  | "notes"
  | "website"
  | "endpoint"
  | "model"
  | "category"
  | "type"
  | "other";

export interface ProviderSearchDoc {
  id: string;
  name: string;
  nameNormalized: string;
  idNormalized: string;
  notes: string;
  website: string;
  category: string;
  providerType: string;
  endpoints: string[];
  models: string[];
  haystack: string;
  hostHints: string[];
}

export interface ProviderSearchHit {
  provider: Provider;
  score: number;
  matchField: ProviderSearchMatchField;
  /** Human-readable snippet for non-name matches (notes / model / endpoint…). */
  matchSnippet?: string;
}

const URL_PROTO_RE = /^https?:\/\//i;
const WWW_RE = /^www\./i;

/** Normalize for comparison: NFKC, lower-case, collapse whitespace. */
export function normalizeSearchText(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pushUnique(list: string[], value: unknown) {
  const normalized = normalizeSearchText(value);
  if (!normalized) return;
  if (!list.includes(normalized)) list.push(normalized);
}

function hostFromUrl(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  try {
    const withProto = URL_PROTO_RE.test(raw) ? raw : `https://${raw}`;
    const host = new URL(withProto).hostname.replace(WWW_RE, "");
    return host || null;
  } catch {
    const stripped = raw
      .replace(URL_PROTO_RE, "")
      .replace(WWW_RE, "")
      .split("/")[0]
      ?.split("?")[0];
    return stripped || null;
  }
}

function collectFromRecord(
  target: string[],
  value: unknown,
  keys: string[],
  depth = 0,
) {
  if (depth > 4 || value == null) return;
  if (typeof value === "string" || typeof value === "number") {
    pushUnique(target, value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string" || typeof item === "number") {
        pushUnique(target, item);
      } else if (item && typeof item === "object") {
        collectFromRecord(target, item, keys, depth + 1);
      }
    }
    return;
  }
  if (typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    if (key in record) {
      collectFromRecord(target, record[key], keys, depth + 1);
    }
  }
  // nested maps like models: { "gpt-4": {...} }
  for (const [k, v] of Object.entries(record)) {
    if (keys.some((hint) => k.toLowerCase().includes(hint.toLowerCase()))) {
      pushUnique(target, k);
      collectFromRecord(target, v, keys, depth + 1);
    }
  }
}

/** Extract searchable fields from a provider (endpoints, models, urls, …). */
export function buildProviderSearchDoc(provider: Provider): ProviderSearchDoc {
  const endpoints: string[] = [];
  const models: string[] = [];
  const hostHints: string[] = [];

  const config = provider.settingsConfig as Record<string, unknown> | undefined;
  if (config && typeof config === "object") {
    const env = config.env as Record<string, unknown> | undefined;
    if (env) {
      pushUnique(endpoints, env.ANTHROPIC_BASE_URL);
      pushUnique(endpoints, env.GOOGLE_GEMINI_BASE_URL);
      pushUnique(endpoints, env.OPENAI_BASE_URL);
    }

    if (typeof config.config === "string") {
      pushUnique(endpoints, extractCodexBaseUrl(config.config));
    }

    const options = config.options as Record<string, unknown> | undefined;
    if (options) {
      pushUnique(endpoints, options.baseURL);
      pushUnique(endpoints, options.baseUrl);
    }

    pushUnique(endpoints, config.baseUrl);
    pushUnique(endpoints, config.baseURL);

    collectFromRecord(models, config, [
      "model",
      "models",
      "defaultModel",
      "modelId",
      "id",
      "name",
    ]);

    // OpenCode-style model map: { "gpt-4o": { name: "..." }, ... }
    if (
      config.models &&
      typeof config.models === "object" &&
      !Array.isArray(config.models)
    ) {
      for (const [modelId, meta] of Object.entries(
        config.models as Record<string, unknown>,
      )) {
        pushUnique(models, modelId);
        if (meta && typeof meta === "object") {
          const rec = meta as Record<string, unknown>;
          pushUnique(models, rec.id);
          pushUnique(models, rec.name);
          pushUnique(models, rec.model);
        }
      }
    }

    // OpenClaw / Hermes style
    if (Array.isArray(config.models)) {
      for (const m of config.models) {
        if (typeof m === "string") pushUnique(models, m);
        else if (m && typeof m === "object") {
          const rec = m as Record<string, unknown>;
          pushUnique(models, rec.id);
          pushUnique(models, rec.name);
          pushUnique(models, rec.model);
        }
      }
    }
  }

  const meta = provider.meta;
  if (meta?.custom_endpoints) {
    for (const [url] of Object.entries(meta.custom_endpoints)) {
      pushUnique(endpoints, url);
    }
  }

  for (const url of [provider.websiteUrl, ...endpoints]) {
    if (!url) continue;
    const host = hostFromUrl(String(url));
    if (host) pushUnique(hostHints, host);
  }

  const name = provider.name ?? "";
  const notes = provider.notes ?? "";
  const website = provider.websiteUrl ?? "";
  const category = provider.category ?? "";
  const providerType =
    (typeof meta?.providerType === "string" && meta.providerType) ||
    (typeof meta?.apiFormat === "string" && meta.apiFormat) ||
    "";

  const haystack = normalizeSearchText(
    [
      name,
      provider.id,
      notes,
      website,
      category,
      providerType,
      provider.icon,
      ...endpoints,
      ...models,
      ...hostHints,
    ]
      .filter(Boolean)
      .join(" "),
  );

  return {
    id: provider.id,
    name,
    nameNormalized: normalizeSearchText(name),
    idNormalized: normalizeSearchText(provider.id),
    notes: normalizeSearchText(notes),
    website: normalizeSearchText(website),
    category: normalizeSearchText(category),
    providerType: normalizeSearchText(providerType),
    endpoints,
    models,
    haystack,
    hostHints,
  };
}

function fieldIncludes(hay: string, needle: string): boolean {
  return Boolean(hay && needle && hay.includes(needle));
}

function scoreTokenAgainstDoc(
  doc: ProviderSearchDoc,
  token: string,
): { score: number; field: ProviderSearchMatchField } | null {
  if (!token) return null;

  // Name: exact > prefix > contains (highest weight — user usually searches by name)
  if (doc.nameNormalized === token) {
    return { score: 1000, field: "name" };
  }
  if (doc.nameNormalized.startsWith(token)) {
    return { score: 860, field: "name" };
  }
  if (fieldIncludes(doc.nameNormalized, token)) {
    // Prefer earlier matches in the name
    const idx = doc.nameNormalized.indexOf(token);
    return { score: 720 - Math.min(idx, 40), field: "name" };
  }

  // Compact name without spaces/punctuation (e.g. "deepseek" vs "Deep Seek")
  const compactName = doc.nameNormalized.replace(/[\s\-_.]+/g, "");
  const compactToken = token.replace(/[\s\-_.]+/g, "");
  if (compactToken && compactName === compactToken) {
    return { score: 940, field: "name" };
  }
  if (compactToken.length >= 2 && compactName.includes(compactToken)) {
    return { score: 700, field: "name" };
  }

  if (doc.idNormalized === token) {
    return { score: 820, field: "id" };
  }
  if (doc.idNormalized.startsWith(token) || fieldIncludes(doc.idNormalized, token)) {
    return { score: 640, field: "id" };
  }

  for (const host of doc.hostHints) {
    if (host === token) return { score: 780, field: "website" };
    if (host.startsWith(token) || host.includes(token)) {
      return { score: 620, field: "website" };
    }
  }

  for (const endpoint of doc.endpoints) {
    const ep = normalizeSearchText(endpoint);
    if (ep === token) return { score: 760, field: "endpoint" };
    if (fieldIncludes(ep, token)) return { score: 580, field: "endpoint" };
  }

  for (const model of doc.models) {
    const m = normalizeSearchText(model);
    if (m === token) return { score: 740, field: "model" };
    if (m.startsWith(token)) return { score: 610, field: "model" };
    if (fieldIncludes(m, token)) return { score: 520, field: "model" };
  }

  if (doc.category === token || fieldIncludes(doc.category, token)) {
    return { score: 480, field: "category" };
  }

  if (
    doc.providerType === token ||
    fieldIncludes(doc.providerType, token)
  ) {
    return { score: 460, field: "type" };
  }

  if (fieldIncludes(doc.notes, token)) {
    return { score: 400 - Math.min(doc.notes.indexOf(token), 30), field: "notes" };
  }

  if (fieldIncludes(doc.website, token)) {
    return { score: 380, field: "website" };
  }

  // Soft fallback: any haystack hit (keeps recall without drowning precision)
  if (fieldIncludes(doc.haystack, token)) {
    return { score: 180, field: "other" };
  }

  return null;
}

function tokenizeQuery(query: string): string[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];

  const parts = normalized.split(/[\s,;/|]+/).filter(Boolean);
  // Also keep the full phrase as a token when multi-word (boosts exact phrase on name)
  if (parts.length > 1) {
    return [normalized, ...parts];
  }
  return parts;
}

function snippetAround(text: string, token: string, radius = 32): string {
  const raw = text.trim();
  if (!raw) return "";
  const lower = normalizeSearchText(raw);
  const idx = lower.indexOf(token);
  if (idx < 0) {
    return raw.length > 72 ? `${raw.slice(0, 72)}…` : raw;
  }
  // Approximate original indices via lowercased scan (good enough for UX)
  const start = Math.max(0, idx - radius);
  const end = Math.min(raw.length, idx + token.length + radius);
  const core = raw.slice(start, end);
  return `${start > 0 ? "…" : ""}${core}${end < raw.length ? "…" : ""}`;
}

function buildMatchSnippet(
  provider: Provider,
  doc: ProviderSearchDoc,
  field: ProviderSearchMatchField,
  token: string,
): string | undefined {
  if (!token || field === "name" || field === "other") return undefined;

  if (field === "notes" && provider.notes) {
    return snippetAround(provider.notes, token);
  }
  if (field === "id") return provider.id;
  if (field === "category") return provider.category;
  if (field === "type") return doc.providerType || undefined;
  if (field === "website") {
    return (
      doc.hostHints.find((h) => h.includes(token)) ||
      provider.websiteUrl ||
      undefined
    );
  }
  if (field === "endpoint") {
    return doc.endpoints.find((ep) => normalizeSearchText(ep).includes(token));
  }
  if (field === "model") {
    return doc.models.find((m) => normalizeSearchText(m).includes(token));
  }
  return undefined;
}

/**
 * High-precision provider search.
 * - Multi-token AND on meaningful tokens (phrase token is optional bonus)
 * - Weighted field ranking (name ≫ id ≫ host ≫ endpoint ≫ model ≫ notes)
 * - Preserves caller order as a stable tie-breaker via `orderIndex`
 */
export function searchProviders(
  providers: Provider[],
  query: string,
): ProviderSearchHit[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return providers.map((provider) => ({
      provider,
      score: 0,
      matchField: "other" as const,
    }));
  }

  const tokens = tokenizeQuery(normalizedQuery);
  const phrase = tokens[0]?.includes(" ") ? tokens[0] : null;
  const requiredTokens =
    phrase && tokens.length > 1 ? tokens.slice(1) : tokens;

  const docs = new Map(
    providers.map((provider) => [provider.id, buildProviderSearchDoc(provider)]),
  );

  const hits: ProviderSearchHit[] = [];

  providers.forEach((provider, orderIndex) => {
    const doc = docs.get(provider.id);
    if (!doc) return;

    let total = 0;
    let bestField: ProviderSearchMatchField = "other";
    let bestScore = -1;
    let matchedRequired = 0;
    let snippetToken = requiredTokens[0] ?? normalizedQuery;

    for (const token of requiredTokens) {
      const match = scoreTokenAgainstDoc(doc, token);
      if (!match) {
        // Fail AND for this provider
        matchedRequired = -1;
        break;
      }
      matchedRequired += 1;
      total += match.score;
      if (match.score > bestScore) {
        bestScore = match.score;
        bestField = match.field;
        snippetToken = token;
      }
    }

    if (matchedRequired < 0) return;

    // Optional phrase bonus when name contains the full query
    if (phrase) {
      const phraseMatch = scoreTokenAgainstDoc(doc, phrase);
      if (phraseMatch) {
        total += Math.round(phraseMatch.score * 0.35);
        if (phraseMatch.score > bestScore) {
          bestField = phraseMatch.field;
          snippetToken = phrase;
        }
      }
    }

    // Tiny stable tie-break favoring earlier drag-sort position
    total += Math.max(0, 50 - Math.min(orderIndex, 50)) * 0.01;

    hits.push({
      provider,
      score: total,
      matchField: bestField,
      matchSnippet: buildMatchSnippet(provider, doc, bestField, snippetToken),
    });
  });

  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.provider.name.localeCompare(b.provider.name, undefined, {
      sensitivity: "base",
    });
  });

  return hits;
}

/** Highlight case-insensitive / NFKC-insensitive matches in display text. */
export function highlightSearchMatches(
  text: string,
  query: string,
): Array<{ text: string; match: boolean }> {
  const raw = text ?? "";
  const needle = normalizeSearchText(query);
  if (!raw || !needle) return [{ text: raw, match: false }];

  // Build mapping from normalized indices back to original slices via walk
  const parts: Array<{ text: string; match: boolean }> = [];
  let cursor = 0;
  const lower = raw.normalize("NFKC");
  const lowerNeedle = needle;
  // Simple path: search in lowercased original when lengths align enough
  const searchIn = lower.toLowerCase();
  let from = 0;
  while (from < searchIn.length) {
    const idx = searchIn.indexOf(lowerNeedle, from);
    if (idx === -1) break;
    if (idx > cursor) {
      parts.push({ text: raw.slice(cursor, idx), match: false });
    }
    const end = idx + lowerNeedle.length;
    parts.push({ text: raw.slice(idx, end), match: true });
    cursor = end;
    from = end;
  }
  if (cursor < raw.length) {
    parts.push({ text: raw.slice(cursor), match: false });
  }
  return parts.length > 0 ? parts : [{ text: raw, match: false }];
}
