import { NextRequest, NextResponse } from 'next/server';
import { generateCharacter } from '../../../lib/services/characterGenerationService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { archetype, traits } = body;

    if (!archetype || !Array.isArray(traits)) {
      return NextResponse.json({ message: 'Missing or invalid archetype or traits' }, { status: 400 });
    }

    const character = await generateCharacter(archetype, traits);
    
    return NextResponse.json(character);

  } catch (error) {
    console.error('Character generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Character generation failed', error: errorMessage }, { status: 500 });
  }
} 