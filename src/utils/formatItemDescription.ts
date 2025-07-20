export function formatItemDescription(description: string): string {
  // Remove the asterisk formatting and clean up the description
  return description
    // Remove **text**: pattern and just keep the content
    .replace(/\*\*([^*]+)\*\*:\s*/g, '')
    // Remove standalone asterisks
    .replace(/\*\*/g, '')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim();
}

export function extractItemSummary(description: string): string {
  // Extract just the basic item info (type and color) for a cleaner display
  const typeMatch = description.match(/Type of Clothing\*\*:\s*([^-]+)/);
  const colorMatch = description.match(/Color\*\*:\s*([^-]+)/);
  
  let summary = '';
  
  if (typeMatch && typeMatch[1]) {
    summary += typeMatch[1].trim();
  }
  
  if (colorMatch && colorMatch[1]) {
    const color = colorMatch[1].trim();
    if (summary) {
      summary = `${color} ${summary.toLowerCase()}`;
    } else {
      summary = color;
    }
  }
  
  return summary || formatItemDescription(description).split('.')[0];
}