interface ResourceRingProps {
  nodes: string[];
}

export default function ResourceRing({ nodes }: ResourceRingProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 max-w-[640px] mx-auto">
      {nodes.map((node, i) => (
        <div
          key={i}
          className="px-[18px] py-2.5 bg-sky-light border border-[#B8D4E2] rounded-full font-sans text-[0.8rem] font-normal text-sky leading-[1.4] max-w-[280px] text-center transition-all duration-300 hover:bg-[#C4DEF0] hover:-translate-y-px"
        >
          {node}
        </div>
      ))}
    </div>
  );
}
