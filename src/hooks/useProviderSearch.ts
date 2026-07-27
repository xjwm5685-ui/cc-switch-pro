import { useMemo } from "react";
import type { Provider } from "@/types";
import {
  searchProviders,
  type ProviderSearchHit,
  type ProviderSearchMatchField,
} from "@/utils/providerSearch";

export interface UseProviderSearchResult {
  query: string;
  isSearching: boolean;
  hits: ProviderSearchHit[];
  providers: Provider[];
  totalCount: number;
  resultCount: number;
}

/**
 * Ranked provider search over the current sorted list.
 * Empty query returns the original order unchanged.
 */
export function useProviderSearch(
  sortedProviders: Provider[],
  query: string,
): UseProviderSearchResult {
  const trimmed = query.trim();
  const isSearching = trimmed.length > 0;

  const hits = useMemo(() => {
    if (!isSearching) {
      return sortedProviders.map((provider) => ({
        provider,
        score: 0,
        matchField: "other" as ProviderSearchMatchField,
      }));
    }
    return searchProviders(sortedProviders, trimmed);
  }, [sortedProviders, trimmed, isSearching]);

  const providers = useMemo(
    () => hits.map((hit) => hit.provider),
    [hits],
  );

  return {
    query: trimmed,
    isSearching,
    hits,
    providers,
    totalCount: sortedProviders.length,
    resultCount: providers.length,
  };
}
