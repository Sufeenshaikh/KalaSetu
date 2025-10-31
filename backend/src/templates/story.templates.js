/**
 * Story templates for different artisan categories
 * These templates help maintain consistency in AI-generated content
 */

const storyTemplates = {
  pottery: {
    craft: "Pottery",
    keywords: [
      "traditional techniques",
      "clay craftsmanship",
      "wheel throwing",
      "kiln firing",
      "glazing",
      "earthen art"
    ],
    promptEnhancements: [
      "Focus on the artisan's connection to earth and natural materials",
      "Highlight the meditative aspect of working with clay",
      "Include details about traditional firing techniques",
      "Mention family traditions if applicable"
    ]
  },

  textiles: {
    craft: "Textile Weaving",
    keywords: [
      "handloom",
      "traditional patterns",
      "natural dyes",
      "fabric heritage",
      "weaving techniques",
      "sustainable fashion"
    ],
    promptEnhancements: [
      "Emphasize the preservation of traditional patterns",
      "Describe the sourcing of natural materials",
      "Include details about color creation process",
      "Mention regional significance"
    ]
  },

  woodworking: {
    craft: "Woodworking",
    keywords: [
      "traditional carpentry",
      "wood carving",
      "sustainable wood",
      "heirloom furniture",
      "intricate designs",
      "restoration"
    ],
    promptEnhancements: [
      "Focus on the selection of wood types",
      "Highlight generational techniques",
      "Include details about tools and craftsmanship",
      "Mention sustainability practices"
    ]
  },

  metalwork: {
    craft: "Metalwork",
    keywords: [
      "traditional smithing",
      "metal arts",
      "forge work",
      "precious metals",
      "jewelry making",
      "ornamental designs"
    ],
    promptEnhancements: [
      "Describe the workshop environment",
      "Include details about metal selection",
      "Highlight specialized techniques",
      "Mention the history of the craft"
    ]
  },

  // Function to enhance story generation prompt
  enhancePrompt(craftType, basePrompt) {
    const template = this[craftType.toLowerCase()];
    if (!template) {
      return basePrompt; // Return original prompt if no template exists
    }

    // Enhance the prompt with template-specific elements
    return {
      ...basePrompt,
      keywords: [...new Set([...basePrompt.keywords, ...template.keywords])],
      promptContext: template.promptEnhancements.join('\n')
    };
  }
};

export default storyTemplates;