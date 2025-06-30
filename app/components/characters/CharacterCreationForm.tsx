'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import CharacterCard from './CharacterCard';
import { useWallet } from '../../contexts/WalletContext';
import toast, { Toaster } from 'react-hot-toast';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// Define types for character data
interface CharacterData {
    archetype: string;
    traits: string[];
}

interface GeneratedCharacter {
    name: string;
    backstory: string;
    imageUrl: string;
}

const archetypes = ["Diamond Hands", "FOMO Trader", "Risk-Averse", "Analyst", "Shillfluencer", "Degen"];

const Step1_SelectArchetype = ({ onNext }: { onNext: (archetype: string) => void }) => (
    <div>
        <h3 className="text-xl font-bold mb-4 text-center">Step 1: Choose Archetype</h3>
        <div className="grid grid-cols-2 gap-4">
            {archetypes.map(arch => (
                <button key={arch} onClick={() => onNext(arch)} className="p-4 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors">
                    {arch}
                </button>
            ))}
        </div>
    </div>
);

const Step2_CustomizeTraits = ({ onNext, onBack }: { onNext: (traits: string[]) => void, onBack: () => void }) => {
    // In a real app, this would have a UI for selecting traits
    const placeholderTraits = ['Bold', 'Optimistic', 'Calculated', 'Skeptical'];
    return (
        <div>
            <h3 className="text-xl font-bold mb-4 text-center">Step 2: Customize Traits</h3>
            <p className="text-center mb-4 text-zinc-400">Select a few traits that define your character.</p>
             <div className="grid grid-cols-2 gap-4 mb-4">
                {placeholderTraits.map(trait => (
                    <button key={trait} className="p-3 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors">
                        {trait}
                    </button>
                ))}
            </div>
            <div className="flex gap-4">
                <button onClick={onBack} className="w-full py-2 bg-zinc-600 rounded-lg hover:bg-zinc-700">Back</button>
                <button onClick={() => onNext(placeholderTraits.slice(0, 2))} className="w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-700">Next</button>
            </div>
        </div>
    )
};


const Step3_Preview = ({ archetype, traits, onNext, onBack, isLoading }: { archetype: string, traits: string[], onNext: () => void, onBack: () => void, isLoading: boolean }) => (
    <div>
        <h3 className="text-xl font-bold mb-4 text-center">Step 3: Preview & Generate</h3>
        <div className="border border-zinc-700 rounded-lg p-4 mb-4 bg-zinc-800">
            <p className="mb-2"><strong>Archetype:</strong> {archetype}</p>
            <p><strong>Traits:</strong> {traits.join(', ')}</p>
            <div className="mt-4 h-32 bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-500">
                <p>Ready to generate your character?</p>
            </div>
        </div>
        <div className="flex gap-4">
            <button onClick={onBack} disabled={isLoading} className="w-full py-2 bg-zinc-600 rounded-lg hover:bg-zinc-700 disabled:opacity-50">Back</button>
            <button onClick={onNext} disabled={isLoading} className="w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading && <Loader2 className="animate-spin" size={20} />}
                {isLoading ? 'Generating...' : 'Generate Character'}
            </button>
        </div>
    </div>
);


const Step4_Mint = ({ character, onStartOver, onMint, isMinting }: { character: GeneratedCharacter, onStartOver: () => void, onMint: () => void, isMinting: boolean }) => (
     <div>
        <h3 className="text-xl font-bold mb-4 text-center">Your Character is Ready!</h3>
         <div className="mb-4">
            <CharacterCard name={character.name} archetype="" imageUrl={character.imageUrl} />
            <div className="bg-zinc-800 p-3 rounded-b-lg">
                <p className="text-sm text-zinc-300">{character.backstory}</p>
            </div>
         </div>
        <button 
            onClick={onMint} 
            disabled={isMinting}
            className="w-full py-2 bg-green-600 rounded-lg hover:bg-green-700 mb-2 flex items-center justify-center gap-2 disabled:opacity-50"
        >
            {isMinting && <Loader2 className="animate-spin" size={20} />}
            {isMinting ? 'Minting...' : 'Mint Token'}
        </button>
        <button onClick={onStartOver} className="w-full py-2 text-sm text-zinc-400 hover:text-white">Create Another Character</button>
    </div>
);

const CharacterCreationForm = () => {
    const { isConnected, signingClient, address } = useWallet();
    const [step, setStep] = useState(1);
    const [characterData, setCharacterData] = useState<CharacterData>({
        archetype: '',
        traits: [],
    });
    const [generatedCharacter, setGeneratedCharacter] = useState<GeneratedCharacter | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNextStep1 = (archetype: string) => {
        setCharacterData(prev => ({ ...prev, archetype }));
        setStep(2);
    };

    const handleNextStep2 = (traits: string[]) => {
        setCharacterData(prev => ({ ...prev, traits }));
        setStep(3);
    };

    const handleGeneration = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/characters/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(characterData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate character');
            }

            const data: GeneratedCharacter = await response.json();
            setGeneratedCharacter(data);
            setStep(4);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            // Optionally, stay on step 3 to show the error
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleBack = () => {
        setStep(prev => prev - 1);
    }

    const handleStartOver = () => {
        setCharacterData({ archetype: '', traits: [] });
        setGeneratedCharacter(null);
        setError(null);
        setIsLoading(false);
        setStep(1);
    };

    const handleMint = async () => {
        if (!isConnected || !signingClient || !address || !generatedCharacter) {
            toast.error("Please connect wallet and generate a character first.");
            return;
        }

        setIsMinting(true);
        const toastId = toast.loading("Broadcasting mint transaction...");

        try {
            const msg = {
                mint: {
                    creator_royalty_percent: 5, // Example royalty
                    name: generatedCharacter.name,
                    backstory: generatedCharacter.backstory,
                    image_url: generatedCharacter.imageUrl,
                }
            };
            
            const fee = {
                amount: [{ denom: "usei", amount: "20000" }],
                gas: "200000",
            };

            const result = await signingClient.execute(address, CONTRACT_ADDRESS, msg, fee, "Mint a Seilor.fun Character");
            
            toast.success(`Mint successful! TxHash: ${result.transactionHash.substring(0, 10)}...`, { id: toastId });
            
            // Maybe move to a "success" screen or clear the form
            
        } catch(err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Minting failed.", { id: toastId });
        } finally {
            setIsMinting(false);
        }
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return <Step1_SelectArchetype onNext={handleNextStep1} />
            case 2:
                return <Step2_CustomizeTraits onNext={handleNextStep2} onBack={handleBack} />
            case 3:
                return <Step3_Preview archetype={characterData.archetype} traits={characterData.traits} onNext={handleGeneration} onBack={handleBack} isLoading={isLoading} />
            case 4:
                return generatedCharacter ? <Step4_Mint character={generatedCharacter} onStartOver={handleStartOver} onMint={handleMint} isMinting={isMinting} /> : <p>Error: Character not generated.</p>;
            default:
                return <Step1_SelectArchetype onNext={handleNextStep1} />
        }
    }

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 text-white w-full max-w-md mx-auto">
             <Toaster position="top-center" reverseOrder={false} />
             <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderStep()}
                </motion.div>
             </AnimatePresence>
             {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </div>
    );
};

export default CharacterCreationForm; 