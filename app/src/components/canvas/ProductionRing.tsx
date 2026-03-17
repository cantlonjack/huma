interface ProductionRingProps {
  nodes: string[];
}

export default function ProductionRing({ nodes }: ProductionRingProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 max-w-[640px] mx-auto">
      {nodes.map((node, i) => (
        <div
          key={i}
          className="px-[18px] py-2.5 bg-amber-100 border border-amber-200 rounded-full font-sans text-[0.8rem] font-normal text-amber-700 leading-[1.4] max-w-[280px] text-center transition-all duration-300 hover:bg-amber-200 hover:border-amber-300 hover:-translate-y-px"
        >
          {node}
        </div>
      ))}
    </div>
  );
}
