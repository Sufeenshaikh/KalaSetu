import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { GenerateContentResponse, Chat } from "@google/genai";
// FIX: Import Artisan and Product types for use in the new suggestion generation function.
import type { Artisan, Product } from "../types";

// Initialize the Google GenAI client
// The API key is expected to be set in the environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// This will hold the single chat instance for the user's session
let chat: Chat | null = null;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Initializes and returns a singleton chat instance with a system prompt.
 */
const getChat = (): Chat => {
    if (!chat) {
        const systemInstruction = `You are a friendly and helpful customer support assistant for KalaSetu, an e-commerce platform that sells authentic Indian handcrafted goods.
        Your goal is to answer user questions about the brand, its products, and its policies.
        
        Here is some information about KalaSetu:
        - **Mission**: KalaSetu means 'Art Bridge'. Its mission is to connect India’s gifted artisans with a global audience, ensuring they receive fair prices and recognition for their traditional craftsmanship.
        - **Trending Products**: Some popular products include the 'Hand-Block Printed Scarf' from Rajasthan, the 'Terracotta Clay Pot' from Uttar Pradesh, and the 'Madhubani Painted Wall Art'.
        - **Return Policy**: KalaSetu offers a 30-day return policy for items in their original condition. To initiate a return, the customer should contact support through the website.
        - **For Artisans**: Artisans interested in selling on the platform can visit the 'For Artisans' page to learn more and apply.

        Keep your answers concise, warm, and professional. If you don't know an answer, politely say that you can't help with that and suggest they contact customer support directly.`;
        
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
            },
        });
    }
    return chat;
}

/**
 * Sends a message to the chatbot and streams the response.
 * @param message - The user's message.
 * @param onChunk - A callback function to handle each incoming chunk of the response.
 */
export const sendMessageToChatStream = async (message: string, onChunk: (chunk: string) => void): Promise<void> => {
    try {
        const chatSession = getChat();
        const response = await chatSession.sendMessageStream({ message });
        
        for await (const chunk of response) {
            // Check if chunk and chunk.text exist before calling onChunk
            if (chunk && chunk.text) {
                onChunk(chunk.text);
            }
        }
    } catch (error) {
        console.error("Error sending message to chat:", error);
        onChunk("I'm sorry, I'm having trouble connecting right now. Please try again later.");
    }
};


/**
 * Generates a short, attractive product description for an e-commerce website.
 * @param productTitle - The title of the product.
 * @returns A promise that resolves to the AI-generated description string.
 */
export const generateDescription = async (productTitle: string): Promise<string> => {
    console.log(`Generating description for: ${productTitle}`);
    const prompt = `Write a short and attractive product description for an e-commerce website product: "${productTitle}".`;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating product description:", error);
        return `An error occurred while generating a description for ${productTitle}. Please try again.`;
    }
};


export const generateProductDescription = async (rawNotes: string): Promise<string> => {
  console.log("Generating description from notes:", rawNotes);

  try {
    const prompt = `Generate a professional, empathetic, and easy-to-read e-commerce product description between 150 and 200 words. Base the description on the following artisan notes: "${rawNotes}". Focus on the craftsmanship, material, cultural significance, and the story behind the product.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating product description:", error);
    // Return a user-friendly error message
    return "We're sorry, but we couldn't generate a description at this time. Please try again later.";
  }
};

export const generateArtisanStory = async (context: string): Promise<string> => {
  console.log("Generating artisan story from context:", context);

  try {
    const prompt = `Based on the following context about an artisan, rewrite and expand it into a polished, empathetic, and engaging story of about 200 words. The story should be told from the artisan's first-person perspective, as if the artisan is speaking. If the context is short or just keywords, create a compelling story from it. \n\nContext: "${context}"`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating artisan story:", error);
    return "We're sorry, but we couldn't generate a story at this time. Please try again later.";
  }
};

/**
 * Analyzes a transcript from an artisan's voice note to extract structured profile data.
 * @param transcript - The text transcript of the artisan's voice note.
 * @returns A promise that resolves to an object with the artisan's details.
 */
export const analyzeArtisanApplicationVoice = async (transcript: string): Promise<{ fullName: string; region: string; craftType: string; bio: string; story: string; }> => {
    console.log("Analyzing artisan transcript:", transcript);

    const prompt = `
    You are an expert onboarding assistant for KalaSetu, an e-commerce platform for Indian artisans.
    Analyze the following transcript from an artisan's voice note. Your goal is to extract key information and generate a compelling profile for them.

    Transcript: "${transcript}"

    Based on the transcript, provide the following details in a JSON format:
    1.  **fullName**: The artisan's full name.
    2.  **region**: The Indian state or region they are from (e.g., 'Rajasthan', 'West Bengal').
    3.  **craftType**: The specific type of craft they practice (e.g., 'Block Printing', 'Pottery', 'Madhubani Painting').
    4.  **bio**: A concise, one-sentence professional bio summarizing their craft and passion.
    5.  **story**: An engaging, empathetic story of about 150-200 words, written in the first person as if the artisan is speaking. Weave in details from the transcript to make it authentic.

    If any piece of information is missing from the transcript, leave the corresponding string field empty.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        fullName: { type: Type.STRING },
                        region: { type: Type.STRING },
                        craftType: { type: Type.STRING },
                        bio: { type: Type.STRING },
                        story: { type: Type.STRING },
                    },
                    required: ["fullName", "region", "craftType", "bio", "story"],
                },
            },
        });

        const jsonStr = response.text.trim();
        const data = JSON.parse(jsonStr);
        
        if (data && typeof data.fullName === 'string') {
            return data;
        } else {
            throw new Error("Invalid JSON structure from AI response");
        }
    } catch (error) {
        console.error("Error analyzing artisan voice note:", error);
        return {
            fullName: '',
            region: '',
            craftType: '',
            bio: 'Could not generate bio. Please write one manually.',
            story: 'Could not generate story. Please write one manually.',
        };
    }
};


/**
 * Generates high-quality, realistic product images based on product details.
 * Creates detailed prompts incorporating category and region for cultural authenticity.
 * @param title - The title of the product.
 * @param category - The category of the product (e.g., Textiles, Pottery).
 * @param region - The region the product is from (e.g., Rajasthan).
 * @returns A promise that resolves to an array of base64 encoded image strings (mocked as URLs for now).
 */
export const generateProductImages = async (title: string, category: string, region: string): Promise<string[]> => {
    // 1. Define base style guidelines
    const stylePrompt = `Professional, realistic, warm, high-quality product photography. The craft is the main focus, well-lit with soft shadows. The background is a neutral, earthy tone (beige, off-white, with subtle terracotta accents), clean and without clutter.`;

    // 2. Add context based on category and region
    let contextPrompt = `The image must be a culturally authentic representation of Indian artisan crafts from ${region}.`;

    // Add category-specific details to the prompt
    switch (category.toLowerCase()) {
        case 'textiles':
            contextPrompt += ' Emphasize the texture of the fabric, the richness of the natural dyes, and the intricacy of the woven or printed patterns.';
            break;
        case 'pottery':
            contextPrompt += ' Highlight the earthy texture of the clay, the handcrafted shape, and any traditional painted motifs.';
            break;
        case 'painting':
            contextPrompt += ' Capture the fine brushwork, the vibrant natural color palette, and the traditional narrative style of the art form.';
            break;
        case 'metalwork':
            contextPrompt += ' Show the gleam of the polished metal and the fine details of the engraving or casting work.';
            break;
        case 'woodwork':
            contextPrompt += ' Focus on the grain of the wood, the smoothness of the finish, and the handcrafted details.';
            break;
    }

    // Add region-specific details to the prompt
    switch (region.toLowerCase()) {
        case 'rajasthan':
            contextPrompt += ' Incorporate iconic Rajasthani elements like vibrant colors (saffron, indigo, emerald), mirror work, or traditional block-print motifs where appropriate.';
            break;
        case 'uttar pradesh':
            contextPrompt += ' Reflect the region\'s legacy, perhaps with hints of Mughal-inspired artistry or the rustic charm of its pottery traditions.';
            break;
        case 'kerala':
            contextPrompt += ' The setting should feel lush and natural, reflecting the region\'s vibrant environment.';
            break;
        case 'karnataka':
             contextPrompt += ' The style should be elegant and perhaps showcase the craft alongside natural materials like sandalwood or rosewood.';
            break;
    }

    // 3. Combine into a final, detailed prompt
    const finalPrompt = `${stylePrompt} The product is a ${title}. ${contextPrompt}`;

    console.log("Generating image with prompt:", finalPrompt);
    
    // In a real application, you would make the API call here.
    // This is a mock implementation that returns placeholder images after a delay.
    /*
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: finalPrompt,
            config: {
              numberOfImages: 3,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            // Returns an array of base64 encoded strings
            return response.generatedImages.map(img => img.image.imageBytes);
        }
        throw new Error("Image generation failed to return images.");

    } catch (error) {
        console.error("Error generating product images:", error);
        return []; // Return an empty array on error
    }
    */
    
    // Mocked response for demonstration
    await delay(3000);
    console.log("Mock image generation complete.");
    // A real implementation returns base64 strings. We use placeholder URLs for simplicity.
    return [
        `https://picsum.photos/seed/${title.split(' ').join('-')}-1/600`,
        `https://picsum.photos/seed/${title.split(' ').join('-')}-2/600`,
        `https://picsum.photos/seed/${title.split(' ').join('-')}-3/600`,
    ];
};

/**
 * Generates a single e-commerce style product image using a placeholder for the AI call.
 * In a real application, this would call the Google AI Image Generation API.
 * @param title - The title of the product.
 * @returns A promise that resolves to a mock image URL.
 */
export const generateECommerceImage = async (title: string): Promise<string> => {
    // 1. Define the prompt for the image generation model.
    const prompt = `High-quality product photo of a "${title}", on a clean white background, in a professional e-commerce style.`;
    console.log("Image Generation Prompt:", prompt);

    // 2. Placeholder for the actual API call to Google AI.
    // In a real implementation, you would uncomment and use the following code:
    /*
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        // Return the image as a base64 data URI
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating e-commerce image:", error);
        // Return a fallback image or re-throw the error
        return 'https://picsum.photos/seed/error/600';
    }
    */

    // 3. Mocked response for demonstration purposes.
    // This simulates the network delay of an API call.
    await delay(1500);

    // Generate a deterministic, unique mock image URL based on the product title.
    const mockImageUrl = `https://picsum.photos/seed/ecom-${title.toLowerCase().replace(/\s+/g, '-')}/600`;

    console.log(`Mock e-commerce image generated for "${title}": ${mockImageUrl}`);

    return mockImageUrl;
};

/**
 * Enhances a product image using AI.
 * @param base64ImageData - The base64 encoded string of the image (without data URI prefix).
 * @param mimeType - The MIME type of the image (e.g., 'image/jpeg').
 * @returns A promise that resolves to a base64 data URI of the enhanced image.
 */
export const enhanceProductImage = async (base64ImageData: string, mimeType: string): Promise<string> => {
    const prompt = `Please enhance this product photo for an e-commerce website. Make the lighting better, the colors more vibrant, and place it on a clean, neutral, slightly off-white studio background. Keep the original product dimensions and aspect ratio.`;
    console.log("Enhancing image with AI...");
    
    // In a real application, you would make the API call here.
    /*
    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64ImageData,
                  mimeType: mimeType,
                },
              },
              { text: prompt },
            ],
          },
          config: {
              responseModalities: [Modality.IMAGE],
          },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
        throw new Error("Image enhancement failed to return an image.");

    } catch (error) {
        console.error("Error enhancing product image:", error);
        // Return original image on error
        return `data:${mimeType};base64,${base64ImageData}`;
    }
    */

    // Mocked response for demonstration
    await delay(2500);
    console.log("Mock image enhancement complete.");
    // For the mock, we'll just return the original image to demonstrate the UI flow.
    return `data:${mimeType};base64,${base64ImageData}`;
};

/**
 * Suggests a product price based on its details.
 * @param productDetails - The details of the product.
 * @returns A promise that resolves to a suggested price number.
 */
export const suggestProductPrice = async (productDetails: { title: string; category: string; region: string; description: string }): Promise<number> => {
    const { title, category, region, description } = productDetails;
    // Prompt engineered to ask for a single numerical output.
    const prompt = `Based on the following details for a handcrafted product, suggest a fair market price in Indian Rupees (INR). Return only a single number, without any currency symbols, commas, or text.

    Title: "${title}"
    Category: "${category}"
    Region: "${region}"
    Description: "${description}"
    
    Suggested Price (INR):`;

    console.log("Suggesting price with prompt...");

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        // Clean the response to extract only numerical digits and a potential decimal point.
        const priceText = response.text.trim().replace(/[^0-9.]/g, ''); 
        const price = parseFloat(priceText);
        
        if (!isNaN(price)) {
            return Math.round(price); // Return a rounded integer for simplicity.
        } else {
            console.error("Failed to parse price from AI response:", response.text);
            return 0; // Return a default value on parsing failure.
        }
    } catch (error) {
        console.error("Error suggesting product price:", error);
        return 0; // Return a default value on API error.
    }
};

/**
 * Analyzes a product image and generates a title, category, description, and price.
 * @param base64ImageData - The base64 encoded string of the image (without data URI prefix).
 * @param mimeType - The MIME type of the image (e.g., 'image/jpeg').
 * @returns A promise that resolves to an object with the product details.
 */
export const analyzeProductImage = async (base64ImageData: string, mimeType: string): Promise<{ title: string; category: string; description: string; price: number; region: string; }> => {
    console.log("Analyzing product image...");
    const prompt = `Analyze the following image of a handcrafted product from India. Based on the image, provide a suitable product title, category, its likely region of origin in India, a detailed and appealing description, and a suggested market price in Indian Rupees (INR).
    
    Guidelines:
    - Title: Should be concise and descriptive.
    - Category: Should be a general craft category (e.g., Pottery, Textiles, Woodwork, Metalwork, Painting).
    - Region: The Indian state or region known for this type of craft (e.g., Rajasthan, West Bengal, Kashmir).
    - Description: Should be engaging, highlighting potential materials, craftsmanship, and cultural style visible in the image. Aim for around 100-150 words.
    - Price: Suggest a fair market price as a single number.`;

    const imagePart = {
        inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
        },
    };

    const textPart = { text: prompt };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [textPart, imagePart],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        category: { type: Type.STRING },
                        region: { type: Type.STRING },
                        description: { type: Type.STRING },
                        price: { type: Type.NUMBER },
                    },
                    required: ["title", "category", "region", "description", "price"],
                },
            },
        });

        const jsonStr = response.text.trim();
        const data = JSON.parse(jsonStr);
        
        if (data && typeof data.title === 'string' && typeof data.price === 'number') {
            return {
                title: data.title,
                category: data.category || '',
                region: data.region || '',
                description: data.description || '',
                price: Math.round(data.price),
            };
        } else {
            throw new Error("Invalid JSON structure from AI response");
        }
    } catch (error) {
        console.error("Error analyzing product image:", error);
        return {
            title: '',
            category: '',
            region: '',
            description: 'Could not generate details from image. Please enter manually.',
            price: 0,
        };
    }
};

/**
 * Generates suggestions for an artisan based on their profile and products.
 * @param artisan - The artisan's profile data.
 * @param products - The list of products by the artisan.
 * @returns A promise that resolves to an object with suggestions.
 */
export const generateArtisanSuggestions = async (artisan: Artisan, products: Product[]): Promise<{ pricing: string; descriptions: string; trends: string; }> => {
    console.log("Generating suggestions for artisan:", artisan.name);

    const productInfo = products.map(p => `- ${p.title} (Price: ₹${p.price}, Category: ${p.category})`).join('\n');

    const prompt = `
    As an expert e-commerce consultant for KalaSetu, a platform for authentic Indian handicrafts, analyze the following artisan's profile and product list. Provide concise, actionable suggestions to help them improve sales.

    Artisan Profile:
    - Name: ${artisan.name}
    - Region: ${artisan.region}
    - Bio: ${artisan.bio}

    Product List:
    ${productInfo}

    Provide suggestions in three key areas:
    1.  **Pricing:** Offer specific advice on pricing strategy. Are the products priced appropriately for their category and region? Suggest a price range or specific adjustments.
    2.  **Descriptions:** Give tips on how to make product titles and descriptions more appealing to a global audience while retaining cultural authenticity.
    3.  **Trends:** Identify 2-3 current market trends or new product ideas that align with the artisan's skills (e.g., specific colors, patterns, or product types that are popular now).

    Return the response as a JSON object.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        pricing: { type: Type.STRING, description: "Actionable suggestions for product pricing strategy." },
                        descriptions: { type: Type.STRING, description: "Tips for improving product titles and descriptions." },
                        trends: { type: Type.STRING, description: "Market trends and new product ideas relevant to the artisan." },
                    },
                    required: ["pricing", "descriptions", "trends"],
                },
            },
        });

        const jsonStr = response.text.trim();
        const data = JSON.parse(jsonStr);
        
        if (data && typeof data.pricing === 'string') {
            return data;
        } else {
            throw new Error("Invalid JSON structure from AI response");
        }
    } catch (error) {
        console.error("Error generating artisan suggestions:", error);
        // Throw a user-friendly error to be caught in the component
        throw new Error("We're sorry, but we couldn't generate suggestions at this time. Please try again later.");
    }
};