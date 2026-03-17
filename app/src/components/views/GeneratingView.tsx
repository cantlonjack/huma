"use client";

import ShapeChart from "@/components/ShapeChart";

interface GeneratingViewProps {
  generatingLong: boolean;
  generatingError: boolean;
  onRetry: () => void;
  onBack: () => void;
}

export default function GeneratingView({
  generatingLong,
  generatingError,
  onRetry,
  onBack,
}: GeneratingViewProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center" role="status">
        {generatingError ? (
          <>
            <p className="font-serif text-2xl text-earth-800 mb-3">
              Something went wrong
            </p>
            <p className="text-earth-600 mb-8">
              Your conversation is still safe. Let&apos;s try generating your map again.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onRetry}
                className="px-6 py-3 bg-amber-600 text-white font-medium rounded-full hover:bg-amber-700 transition-all"
              >
                Try again
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 text-earth-600 border border-sand-300 rounded-full hover:bg-sand-100 transition-colors"
              >
                Back to conversation
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <ShapeChart
                scores={[2, 1, 3, 2, 2, 1, 2, 1]}
                className="w-40 h-40 opacity-50"
                animated
                breathing
              />
            </div>
            <p className="font-serif text-2xl md:text-3xl text-earth-800">
              Building your shape
            </p>
            <p className="text-earth-600 mt-2">
              Weaving together everything we discussed...
            </p>
            <p className="text-sm text-earth-500 mt-4">
              {generatingLong
                ? "Still working \u2014 your map has a lot of ground to cover."
                : "This usually takes about 30 seconds."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
