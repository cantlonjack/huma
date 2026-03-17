"use client";

import { useRef, useEffect } from "react";

interface WelcomeViewProps {
  operatorName: string;
  operatorLocation: string;
  onNameChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onSubmit: (name: string, location: string) => void;
  onBack: () => void;
}

export default function WelcomeView({
  operatorName,
  operatorLocation,
  onNameChange,
  onLocationChange,
  onSubmit,
  onBack,
}: WelcomeViewProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = operatorName.trim();
    if (!name) return;
    onSubmit(name, operatorLocation.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-sage-50/30 via-transparent to-transparent pointer-events-none" />

      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-10 text-sm text-earth-400 hover:text-earth-600 transition-colors"
        aria-label="Back to home"
      >
        &larr; Back
      </button>

      <form onSubmit={handleSubmit} className="relative z-10 max-w-md w-full text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-sage-600 mb-14 font-medium">
          HUMA
        </p>

        <label htmlFor="operator-name" className="block font-serif text-3xl md:text-4xl text-earth-900 mb-10">
          What should I call you?
        </label>
        <input
          id="operator-name"
          ref={nameInputRef}
          type="text"
          value={operatorName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full bg-transparent border-b-2 border-sand-300 focus:border-sage-500 text-center font-serif text-xl text-earth-800 py-3 outline-none transition-colors placeholder:text-earth-400"
          placeholder="Your name"
        />

        <label htmlFor="operator-location" className="block font-serif text-xl text-earth-700 mt-16 mb-6">
          Where is your land?
        </label>
        <input
          id="operator-location"
          type="text"
          value={operatorLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full bg-transparent border-b-2 border-sand-300 focus:border-sage-500 text-center font-serif text-lg text-earth-700 py-3 outline-none transition-colors placeholder:text-earth-400"
          placeholder="e.g., Southern Oregon, Vermont hilltop, or just a dream"
        />
        <p className="text-xs text-earth-400 mt-2">Optional</p>

        <button
          type="submit"
          disabled={!operatorName.trim()}
          className="mt-16 px-10 py-4 bg-amber-600 text-white text-lg font-medium rounded-full hover:bg-amber-700 transition-all hover:shadow-lg hover:shadow-amber-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Let&apos;s begin
        </button>
      </form>
    </div>
  );
}
