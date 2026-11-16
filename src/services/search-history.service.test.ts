import { afterEach, describe, expect, it } from "vitest";
import {
  clearSearchHistory,
  recentSearches,
  rememberSearch,
} from "@/services/search-history.service";

afterEach(clearSearchHistory);

describe("search history", () => {
  it("remembers terms newest first, without repeats, and ignores blanks", () => {
    rememberSearch("bank");
    rememberSearch("  ");
    rememberSearch("github");
    rememberSearch("BANK");
    expect(recentSearches()).toEqual(["BANK", "github"]);
  });

  it("keeps only the latest few", () => {
    for (const term of ["a", "b", "c", "d", "e", "f", "g"]) rememberSearch(term);
    expect(recentSearches()).toEqual(["g", "f", "e", "d", "c", "b"]);
  });

  it("is dropped on request", () => {
    rememberSearch("bank");
    clearSearchHistory();
    expect(recentSearches()).toEqual([]);
  });
});
