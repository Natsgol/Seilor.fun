import { OpenAI } from 'openai';

if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a character's personality, backstory, and image using OpenAI.
 * @param archetype - The selected character archetype (e.g., "Diamond Hands").
 * @param traits - An array of user-selected traits.
 * @returns An object containing the character's name, backstory, and image URL.
 */
export const generateCharacter = async (archetype: string, traits: string[]) => {
  console.log(`Generating character with archetype: ${archetype} and traits: ${traits.join(', ')}`);

  // --- 1. Generate Personality and Backstory with GPT-4 ---
  const personalityPrompt = `
    Create a detailed character profile for a crypto trader character in an anime-style universe called "Seilor.fun".
    Archetype: ${archetype}
    Key Traits: ${traits.join(', ')}

    Based on the archetype and traits, generate the following:
    1.  **Name**: A unique, catchy, anime-style name.
    2.  **Backstory**: A short, compelling backstory (2-3 sentences) explaining their origin and motivation as a crypto trader.
    3.  **Personality**: A brief description of their personality (1-2 sentences).

    Format the output as a JSON object with keys "name", "backstory", and "personality".
  `;

  const gptResponse = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: personalityPrompt }],
    response_format: { type: "json_object" },
  });

  const characterDetails = JSON.parse(gptResponse.choices[0].message.content || '{}');
  const { name, backstory, personality } = characterDetails;

  if (!name || !backstory || !personality) {
      throw new Error('Failed to generate complete character details from GPT-4.');
  }

  // --- 2. Generate Image with DALL-E 3 ---
  const imagePrompt = `
    Create a vibrant, anime-style digital art portrait of a crypto trader character.
    Character Name: ${name}
    Archetype: ${archetype}
    Personality: ${personality}
    Key Traits: ${traits.join(', ')}
    Visual Style: Modern anime aesthetic, dynamic, colorful, clean lines, suitable for a profile picture.
    The character should look cool and confident. Do not include any text or logos in the image.
  `;

  const imageResponse = await openai.images.generate({
    model: 'dall-e-3',
    prompt: imagePrompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  });

  const imageUrl = imageResponse?.data?.[0]?.url;

  if (!imageUrl) {
      throw new Error('Failed to generate character image from DALL-E 3.');
  }

  console.log("Character generation successful.");

  return {
    name,
    backstory,
    imageUrl,
  };
}; 