import { describe, expect, it } from "vitest";
import type { Provider } from "@/types";
import {
  highlightSearchMatches,
  normalizeSearchText,
  searchProviders,
} from "@/utils/providerSearch";

function makeProvider(
  partial: Partial<Provider> & Pick<Provider, "id" | "name">,
): Provider {
  return {
    settingsConfig: {},
    ...partial,
  };
}

describe("normalizeSearchText", () => {
  it("lowercases and collapses whitespace", () => {
    expect(normalizeSearchText("  Deep   Seek ")).toBe("deep seek");
  });
});

describe("searchProviders", () => {
  const providers: Provider[] = [
    makeProvider({
      id: "deepseek",
      name: "DeepSeek",
      websiteUrl: "https://www.deepseek.com",
      settingsConfig: {
        env: { ANTHROPIC_BASE_URL: "https://api.deepseek.com" },
      },
      notes: "便宜好用",
    }),
    makeProvider({
      id: "moonshot",
      name: "Kimi / Moonshot",
      category: "aggregator",
      settingsConfig: {
        env: { ANTHROPIC_BASE_URL: "https://api.moonshot.cn/anthropic" },
      },
      meta: { providerType: "anthropic" },
    }),
    makeProvider({
      id: "openai-compat",
      name: "My Gateway",
      settingsConfig: {
        options: { baseURL: "https://gateway.example.com/v1" },
        models: { "gpt-4o": { name: "GPT-4o" }, "claude-sonnet": {} },
      },
    }),
    makeProvider({
      id: "official",
      name: "Anthropic Official",
      category: "official",
      notes: "官方直连",
    }),
  ];

  it("returns all providers for empty query in original order", () => {
    const hits = searchProviders(providers, "  ");
    expect(hits.map((h) => h.provider.id)).toEqual([
      "deepseek",
      "moonshot",
      "openai-compat",
      "official",
    ]);
  });

  it("ranks exact name matches first", () => {
    const hits = searchProviders(providers, "DeepSeek");
    expect(hits[0]?.provider.id).toBe("deepseek");
    expect(hits[0]?.matchField).toBe("name");
  });

  it("matches compact names without spaces", () => {
    const hits = searchProviders(providers, "deepseek");
    expect(hits.some((h) => h.provider.id === "deepseek")).toBe(true);
  });

  it("matches endpoint host", () => {
    const hits = searchProviders(providers, "moonshot.cn");
    expect(hits.map((h) => h.provider.id)).toContain("moonshot");
  });

  it("matches model ids", () => {
    const hits = searchProviders(providers, "gpt-4o");
    expect(hits[0]?.provider.id).toBe("openai-compat");
    expect(hits[0]?.matchField).toBe("model");
  });

  it("matches notes and Chinese text", () => {
    const hits = searchProviders(providers, "便宜");
    expect(hits.map((h) => h.provider.id)).toEqual(["deepseek"]);
    expect(hits[0]?.matchSnippet).toContain("便宜");
  });

  it("provides model match snippets", () => {
    const hits = searchProviders(providers, "gpt-4o");
    expect(hits[0]?.matchField).toBe("model");
    expect(hits[0]?.matchSnippet).toContain("gpt-4o");
  });

  it("requires all tokens (AND)", () => {
    const hits = searchProviders(providers, "kimi moonshot");
    expect(hits.map((h) => h.provider.id)).toEqual(["moonshot"]);
    expect(searchProviders(providers, "kimi deepseek")).toHaveLength(0);
  });

  it("matches category", () => {
    const hits = searchProviders(providers, "official");
    expect(hits.some((h) => h.provider.id === "official")).toBe(true);
  });
});

describe("highlightSearchMatches", () => {
  it("splits matched segments", () => {
    const parts = highlightSearchMatches("DeepSeek API", "seek");
    expect(parts.some((p) => p.match && p.text.toLowerCase() === "seek")).toBe(
      true,
    );
  });

  it("returns original text when query empty", () => {
    expect(highlightSearchMatches("Hello", "")).toEqual([
      { text: "Hello", match: false },
    ]);
  });
});
