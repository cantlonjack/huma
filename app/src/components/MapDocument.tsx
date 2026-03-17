"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import ShapeChart from "@/components/ShapeChart";

interface MapDocumentProps {
  markdown: string;
  shapeScores?: number[];
  operatorName?: string;
}

/**
 * Parse a capital profile table row like "| Financial | 3/5 | steady cash flow |"
 * Returns { capital, score, note } or null.
 */
function parseCapitalRow(text: string): { capital: string; score: number; note: string } | null {
  // Match patterns like "Financial | 3/5 | note" or "Financial | ●●●○○ | note"
  const parts = text.split("|").map(s => s.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const capital = parts[0];
  const scoreText = parts[1];
  const note = parts[2] || "";

  // Try numeric score like "3/5" or "4 /5"
  const numMatch = scoreText.match(/(\d)\s*\/\s*5/);
  if (numMatch) {
    return { capital, score: parseInt(numMatch[1]), note };
  }

  // Try dot/circle pattern
  const filled = (scoreText.match(/●/g) || []).length;
  if (filled > 0) {
    return { capital, score: filled, note };
  }

  return null;
}

function CapitalCircle({ capital, score, note }: { capital: string; score: number; note: string }) {
  // Map 1-5 to radius 10-26 (matching canvas view's sized circles)
  const r = 10 + (score - 1) * 4;
  const opacity = 0.4 + (score - 1) * 0.15;
  return (
    <div className="flex flex-col items-center gap-1" title={note}>
      <svg width={56} height={56} viewBox="0 0 56 56">
        <circle cx={28} cy={28} r={r} fill="var(--color-sage-600)" opacity={opacity} />
      </svg>
      <span className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.04em] text-earth-400">
        {capital}
      </span>
      <span className="font-sans text-[0.55rem] text-earth-400">{score}/5</span>
    </div>
  );
}

/**
 * Detect if a table is the 8 Forms of Capital table by checking headers.
 */
function isCapitalTable(children: React.ReactNode): boolean {
  const text = extractText(children).toLowerCase();
  return text.includes("capital") && (text.includes("strength") || text.includes("rating") || text.includes("score"));
}

/**
 * Detect if a table is a financials/enterprise data table.
 */
function isFinancialsTable(children: React.ReactNode): boolean {
  const text = extractText(children).toLowerCase();
  return (text.includes("startup") || text.includes("revenue") || text.includes("labor")) && !text.includes("capital");
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  if (node && typeof node === "object" && "props" in node) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    return extractText(el.props.children);
  }
  return "";
}

/**
 * Detect which map section an h2 belongs to for print styling.
 */
function sectionClass(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("essence") || lower.includes("ikigai")) return "map-section-essence";
  if (lower.includes("holistic") || lower.includes("context")) return "map-section-context";
  if (lower.includes("landscape")) return "map-section-landscape";
  if (lower.includes("enterprise")) return "map-section-enterprises";
  if (lower.includes("capital")) return "map-section-capital";
  if (lower.includes("nodal") || lower.includes("intervention")) return "map-section-nodal";
  if (lower.includes("closing")) return "map-section-closing";
  return "";
}

/**
 * Check if an h3 is an enterprise name (appears within enterprise stack section).
 * We detect this by checking if it's followed by financial data patterns.
 */
function isEnterpriseHeader(text: string): boolean {
  // Enterprise headers tend to be proper names, not structural headings
  const structural = ["quality of life", "forms of production", "future resource", "the cascade", "what this sets up", "enterprise synergy"];
  return !structural.some(s => text.toLowerCase().includes(s));
}

export default function MapDocument({ markdown, shapeScores, operatorName }: MapDocumentProps) {
  // Track whether we're inside the enterprise stack section
  let inEnterpriseSection = false;

  const components: Components = {
    h1: ({ children }) => (
      <h1 className="font-serif text-4xl md:text-5xl text-earth-900 text-center mb-2 mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => {
      const text = extractText(children);
      const cls = sectionClass(text);
      if (text.toLowerCase().includes("enterprise") && text.toLowerCase().includes("stack")) {
        inEnterpriseSection = true;
      } else if (cls && !cls.includes("enterprises")) {
        inEnterpriseSection = false;
      }
      return (
        <h2 className={`font-serif text-2xl text-sage-700 mt-12 mb-4 pb-2 border-b border-sand-200 ${cls}`}>
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const text = extractText(children);
      if (inEnterpriseSection && isEnterpriseHeader(text)) {
        return (
          <h3 className="font-serif text-xl font-bold text-sage-700 mt-2 mb-1">
            {children}
          </h3>
        );
      }
      return (
        <h3 className="font-serif text-xl text-earth-800 mt-8 mb-3">
          {children}
        </h3>
      );
    },
    h4: ({ children }) => (
      <h4 className="font-serif text-lg text-earth-800 mt-6 mb-2">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="font-serif text-earth-800 leading-relaxed mb-4">
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong className="text-earth-800 font-semibold">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="text-earth-600 italic">{children}</em>
    ),
    ul: ({ children }) => (
      <ul className="text-earth-700 space-y-1.5 mb-4 ml-4 list-disc font-serif">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="text-earth-700 space-y-1.5 mb-4 ml-4 list-decimal font-serif">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-sage-400 pl-4 italic text-earth-600 my-6 font-serif">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="border-sand-200 my-8" />,
    table: ({ children }) => {
      // Check if this is the capital profile table
      if (isCapitalTable(children)) {
        // Parse the table rows into capital bars
        const rows: { capital: string; score: number; note: string }[] = [];
        const text = extractText(children);
        const lines = text.split(/\n/).filter(l => l.includes("|"));
        for (const line of lines) {
          const parsed = parseCapitalRow(line);
          if (parsed && parsed.capital.toLowerCase() !== "capital") {
            rows.push(parsed);
          }
        }
        if (rows.length > 0) {
          return (
            <div className="my-6 p-4 bg-sage-50 rounded-lg flex justify-center flex-wrap gap-3">
              {rows.map((r) => (
                <CapitalCircle key={r.capital} {...r} />
              ))}
            </div>
          );
        }
      }

      // Check if this is a financials table within an enterprise card
      if (isFinancialsTable(children)) {
        return (
          <div className="overflow-x-auto mb-4">
            <table className="financials-table">
              {children}
            </table>
          </div>
        );
      }

      // Default table rendering
      return (
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm text-earth-700 border-collapse">
            {children}
          </table>
        </div>
      );
    },
    thead: ({ children }) => (
      <thead className="border-b border-sand-300 text-earth-800">
        {children}
      </thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-sand-200">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="text-left py-2 px-3 font-medium font-sans text-sm">{children}</th>
    ),
    td: ({ children }) => (
      <td className="py-2 px-3 font-sans text-sm">{children}</td>
    ),
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-12 print:px-0 print:py-4">
      {/* Shape — the visual signature */}
      {shapeScores && (
        <div className="text-center mb-16 pt-4">
          <div className="flex justify-center mb-4">
            <ShapeChart
              scores={shapeScores}
              className="w-64 h-64 md:w-72 md:h-72"
              animated
            />
          </div>
          {operatorName && (
            <p className="font-serif text-lg text-earth-600 italic">
              The shape of {operatorName}&apos;s regenerative enterprise
            </p>
          )}
        </div>
      )}

      <article className="prose prose-huma">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {markdown}
        </ReactMarkdown>
      </article>

      <footer className="map-footer text-center mt-16 pt-8 border-t border-sand-200 print:mt-8">
        <p className="font-serif text-earth-600 italic leading-relaxed max-w-lg mx-auto">
          This map is a beginning, not a blueprint. The land will teach you
          things no tool can anticipate. Trust the conversation between you
          and your place.
        </p>
        <p className="text-sm text-earth-500 mt-4 uppercase tracking-wider">
          Generated by HUMA
        </p>
        <button
          onClick={() => window.print()}
          className="no-print mt-6 px-6 py-2.5 text-sm border border-sand-300 rounded-full text-earth-700 hover:bg-sand-100 transition-colors"
        >
          Print This Map
        </button>
      </footer>
    </div>
  );
}