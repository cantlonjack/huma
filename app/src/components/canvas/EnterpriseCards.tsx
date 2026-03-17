import type { EnterpriseCard } from "@/engine/canvas-types";

interface EnterpriseCardsProps {
  enterprises: EnterpriseCard[];
}

const ROLE_GRADIENTS: Record<string, string> = {
  anchor: "from-sage-700 to-sage-400",
  foundation: "from-amber-600 to-amber-400",
  partner: "from-sky to-[#5A9DB5]",
  "long-game": "from-gold to-[#B8922E]",
  multiplier: "from-lilac to-[#8A78A0]",
};

const ROLE_TAG_STYLES: Record<string, string> = {
  anchor: "bg-sage-50 text-sage-700",
  foundation: "bg-amber-100 text-amber-700",
  partner: "bg-sky-light text-sky",
  "long-game": "bg-gold-light text-gold",
  multiplier: "bg-lilac-light text-lilac",
};

const ROLE_LABELS: Record<string, string> = {
  anchor: "Anchor",
  foundation: "Foundation",
  partner: "Partner",
  "long-game": "Long Game",
  multiplier: "Multiplier",
};

const CAPITAL_DOT_COLORS: Record<string, string> = {
  financial: "bg-sage-800",
  material: "bg-amber-600",
  living: "bg-sage-500",
  social: "bg-sky",
  intellectual: "bg-lilac",
  experiential: "bg-gold",
  spiritual: "bg-rose",
  cultural: "bg-amber-500",
};

export default function EnterpriseCards({ enterprises }: EnterpriseCardsProps) {
  return (
    <div className="w-full max-w-[760px] mx-auto grid grid-cols-2 gap-4 max-sm:grid-cols-1">
      {enterprises.map((ent) => (
        <div
          key={ent.name}
          className={`relative bg-white border border-sand-300 rounded-lg p-5 transition-all duration-300 hover:border-sage-300 hover:shadow-[0_4px_24px_rgba(58,90,64,0.08)] hover:-translate-y-0.5 ${ent.wide ? "col-span-full" : ""}`}
        >
          {/* Accent bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-lg bg-gradient-to-r ${ROLE_GRADIENTS[ent.role] || ROLE_GRADIENTS.anchor}`}
          />

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-serif text-[1.2rem] font-medium text-earth-900 leading-[1.2]">
                {ent.name}
              </h3>
              <span className="font-sans text-[0.62rem] font-semibold tracking-[0.1em] uppercase text-sage-600 mt-0.5 block">
                {ent.category}
              </span>
            </div>
            <span
              className={`font-sans text-[0.6rem] font-semibold px-2.5 py-[3px] rounded-full whitespace-nowrap shrink-0 ${ROLE_TAG_STYLES[ent.role] || ROLE_TAG_STYLES.anchor}`}
            >
              {ROLE_LABELS[ent.role] || ent.role}
            </span>
          </div>

          {/* Description */}
          <p className="font-sans text-[0.82rem] font-light text-earth-600 leading-[1.65] mb-4">
            {ent.description}
          </p>

          {/* Financials micro-ledger */}
          <div className="grid grid-cols-3 gap-px bg-sand-300 rounded overflow-hidden mb-3.5 max-sm:grid-cols-2">
            <FinCell label="Startup" value={ent.financials.startup} money />
            <FinCell label="Year 1" value={ent.financials.year1} money />
            <FinCell label="Year 3" value={ent.financials.year3} money />
            {ent.financials.laborInSeason && (
              <FinCell label="Labor (season)" value={ent.financials.laborInSeason} />
            )}
            {ent.financials.timeToRevenue && (
              <FinCell label="To Revenue" value={ent.financials.timeToRevenue} />
            )}
            {ent.financials.margin && (
              <FinCell label="Margin" value={ent.financials.margin} />
            )}
          </div>

          {/* Capital dots */}
          <div className="flex gap-1.5 flex-wrap mb-3">
            {ent.capitals.map((cap) => (
              <span
                key={cap.form}
                className="flex items-center gap-1 font-sans text-[0.65rem] font-medium text-earth-500 px-2 py-[3px] bg-sand-100 rounded-full"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${CAPITAL_DOT_COLORS[cap.form] || "bg-earth-400"}`} />
                {cap.label}
              </span>
            ))}
          </div>

          {/* Fit narrative */}
          <p className="font-sans text-[0.78rem] font-light text-earth-500 leading-[1.6] italic pt-3 border-t border-sand-200">
            {ent.fitNarrative}
          </p>
        </div>
      ))}
    </div>
  );
}

function FinCell({ label, value, money }: { label: string; value: string; money?: boolean }) {
  return (
    <div className="bg-sand-50 px-2.5 py-2">
      <div className="font-sans text-[0.58rem] font-semibold tracking-[0.06em] uppercase text-earth-400 mb-0.5">
        {label}
      </div>
      <div className={`font-sans text-[0.82rem] ${money ? "font-semibold text-sage-800" : "font-medium text-earth-800"}`}>
        {value}
      </div>
    </div>
  );
}
