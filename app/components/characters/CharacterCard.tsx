'use client';

import React from 'react';

interface CharacterCardProps {
  name: string;
  archetype: string;
  imageUrl: string;
}

const CharacterCard = ({ name, archetype, imageUrl }: CharacterCardProps) => {
  return (
    <div className="border rounded-lg p-4">
      <img src={imageUrl} alt={name} className="w-full h-48 object-cover rounded-md mb-2" />
      <h3 className="text-xl font-bold">{name}</h3>
      <p className="text-gray-500">{archetype}</p>
    </div>
  );
};

export default CharacterCard; 