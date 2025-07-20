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

export interface ParsedSearchResponse {
  suggestions: string;
  recommendedItems: RecommendedItem[];
  missingItems: string;
}

export function parseSearchResponse(response: string, wardrobeItems: WardrobeItem[]): ParsedSearchResponse {
  // Create a map for quick item lookup
  const itemMap = new Map(wardrobeItems.map(item => [item.id, item]));

  // Parse suggestions
  const suggestionsMatch = response.match(/<suggestions>([\s\S]*?)<\/suggestions>/);
  const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : '';

  // Parse recommended items
  const recommendedItemRegex = /<recommended-item id="([^"]+)">([\s\S]*?)<\/recommended-item>/g;
  const recommendedItems: RecommendedItem[] = [];
  
  let match;
  while ((match = recommendedItemRegex.exec(response)) !== null) {
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
  const missingItemsMatch = response.match(/<missing-items>([\s\S]*?)<\/missing-items>/);
  const missingItems = missingItemsMatch ? missingItemsMatch[1].trim() : '';

  return {
    suggestions,
    recommendedItems,
    missingItems
  };
}