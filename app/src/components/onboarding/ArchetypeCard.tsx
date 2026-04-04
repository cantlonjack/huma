"use client";

interface ArchetypeCardProps {
  name: string;
  description: string;
  typicalConcerns?: string[];
  selected: boolean;
  onToggle: () => void;
}

export default function ArchetypeCard({
  name,
  description,
  typicalConcerns,
  selected,
  onToggle,
}: ArchetypeCardProps) {
  return (
    <button
      onClick={onToggle}
      className="cursor-pointer text-left w-full"
      style={{
        padding: "16px",
        borderRadius: "16px",
        background: selected ? "#EBF3EC" : "#FAF8F3",
        border: selected ? "1.5px solid #8BAF8E" : "1px solid #EDE6D8",
        transform: selected ? "scale(1.02)" : "scale(1)",
        transition: "all 240ms cubic-bezier(0.22, 1, 0.36, 1)",
        minHeight: "52px",
      }}
    >
      <h4
        className="font-serif font-semibold"
        style={{
          fontSize: "18px",
          lineHeight: "1.3",
          color: selected ? "#3A5A40" : "#554D42",
          margin: 0,
        }}
      >
        {name}
      </h4>

      <p
        className="font-sans"
        style={{
          fontSize: "13px",
          lineHeight: "1.4",
          color: "#6B6358",
          margin: "4px 0 0",
        }}
      >
        {description}
      </p>

      {typicalConcerns && typicalConcerns.length > 0 && (
        <p
          className="font-sans italic"
          style={{
            fontSize: "11px",
            lineHeight: "1.4",
            color: "#A89E90",
            margin: "6px 0 0",
          }}
        >
          {typicalConcerns.join(" / ")}
        </p>
      )}
    </button>
  );
}
