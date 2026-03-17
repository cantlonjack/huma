"use client";

import { useAuth } from "@/components/AuthProvider";

interface MapSummary {
  id: string;
  name: string;
  location: string;
  enterprise_count: number;
  canvas_data: unknown;
  created_at: string;
  updated_at: string;
}

interface OperateDashboardProps {
  maps: MapSummary[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function OperateDashboard({ maps }: OperateDashboardProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-sand-200 px-6 py-4 flex items-center justify-between max-w-3xl mx-auto">
        <a
          href="/"
          className="text-sm uppercase tracking-[0.3em] text-sage-600 font-medium hover:text-sage-800 transition-colors"
        >
          HUMA
        </a>
        <div className="flex items-center gap-4">
          <span className="text-xs text-earth-400">{user?.email}</span>
          <button
            onClick={() => signOut()}
            className="text-xs text-earth-500 hover:text-earth-700 transition-colors underline underline-offset-2"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        <h1 className="font-serif text-3xl text-earth-900 mb-2">
          Your week
        </h1>
        <p className="text-earth-600 text-sm mb-12">
          Sunday check-in. Honest look at the week. Quick and direct.
        </p>

        {maps.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-xl text-earth-700 mb-3">
              No maps yet
            </p>
            <p className="text-earth-500 mb-8 max-w-sm mx-auto">
              Complete your Design Mode conversation first to create a
              map. Then come back here for your weekly review.
            </p>
            <a
              href="/"
              className="px-8 py-3 bg-amber-600 text-white font-medium rounded-full hover:bg-amber-700 transition-all"
            >
              Start Your Map
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {maps.map((map) => (
              <div
                key={map.id}
                className="border border-sand-200 rounded-lg p-6 hover:border-sage-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl text-earth-900">
                      {map.name || "Unnamed map"}
                    </h2>
                    {map.location && (
                      <p className="text-sm text-earth-500 mt-0.5">{map.location}</p>
                    )}
                    <p className="text-xs text-earth-400 mt-2">
                      {map.enterprise_count} enterprise{map.enterprise_count !== 1 ? "s" : ""}
                      {" "}&middot;{" "}
                      Created {formatDate(map.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={`/map/${map.id}`}
                      className="px-4 py-2 text-sm border border-sand-300 rounded-full text-earth-600 hover:bg-sand-100 transition-colors"
                    >
                      View Map
                    </a>
                    <a
                      href={`/operate/review/${map.id}`}
                      className="px-4 py-2 text-sm bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-all font-medium"
                    >
                      Weekly Review
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
