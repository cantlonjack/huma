import type { FieldLayer } from "@/engine/canvas-types";

interface FieldLayersProps {
  layers: FieldLayer[];
}

const CATEGORY_COLORS = {
  permanent: "bg-sage-900 text-sage-100",
  development: "bg-sage-600 text-sage-50",
  management: "bg-amber-700 text-amber-100",
} as const;

const STATUS_BADGE: Record<string, string> = {
  strong: "bg-white/[0.18]",
  adequate: "bg-white/10",
  "leverage-point": "bg-[rgba(255,200,100,0.25)] text-[#FFE0B0]",
  "needs-attention": "bg-white/[0.06]",
  unexplored: "bg-white/[0.04]",
};

const STATUS_LABELS: Record<string, string> = {
  strong: "Strong",
  adequate: "Adequate",
  "leverage-point": "\u2605 Leverage",
  "needs-attention": "Needs Attn",
  unexplored: "Unexplored",
};

export default function FieldLayers({ layers }: FieldLayersProps) {
  return (
    <div className="w-full max-w-[760px] mx-auto">
      <div className="flex gap-[3px] rounded-md overflow-hidden max-sm:flex-wrap">
        {layers.map((layer) => (
          <div
            key={layer.name}
            className={`group flex-1 min-w-0 py-3.5 px-2 text-center relative cursor-default transition-all duration-300 hover:brightness-105 hover:-translate-y-0.5 max-sm:flex-none max-sm:w-[calc(33.33%-2px)] ${CATEGORY_COLORS[layer.category]}`}
          >
            <div className="font-sans text-[0.58rem] font-semibold tracking-[0.06em] uppercase opacity-85 mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
              {layer.name}
            </div>
            <span
              className={`inline-block font-sans text-[0.55rem] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[layer.status] || ""}`}
            >
              {STATUS_LABELS[layer.status] || layer.status}
            </span>
            {/* Note on hover */}
            <div className="hidden group-hover:block font-sans text-[0.65rem] font-light opacity-60 leading-[1.4] mt-1.5">
              {layer.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
