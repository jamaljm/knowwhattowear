interface WardrobeItem {
  id: string;
  description: string;
  image_url: string;
}

interface RecommendedItem {
  id: string;
  usage: string;
  item?: WardrobeItem;
}

interface ParsedSearchResponse {
  suggestions: string;
  recommendedItems: RecommendedItem[];
  missingItems: string;
}

export function parseSearchResponse(response: string, wardrobeItems: WardrobeItem[]): ParsedSearchResponse {
  // Create a map for quick item lookup
  const itemMap = new Map(wardrobeItems.map(item => [item.id, item]));

  // Parse suggestions
  const suggestionsMatch = response.match(/<suggestions>(.*?)<\/suggestions>/s);
  const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : '';

  // Parse recommended items
  const recommendedItemMatches = response.matchAll(/<recommended-item id="([^"]+)">(.*?)<\/recommended-item>/gs);
  const recommendedItems: RecommendedItem[] = [];
  
  for (const match of recommendedItemMatches) {
    const id = match[1];
    const usage = match[2].trim();
    const item = itemMap.get(id);
    
    recommendedItems.push({
      id,
      usage,
      item
    });
  }

  // Parse missing items
  const missingItemsMatch = response.match(/<missing-items>(.*?)<\/missing-items>/s);
  const missingItems = missingItemsMatch ? missingItemsMatch[1].trim() : '';

  return {
    suggestions,
    recommendedItems,
    missingItems
  };
}