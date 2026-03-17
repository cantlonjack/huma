interface QoLRingProps {
  nodes: string[];
}

export default function QoLRing({ nodes }: QoLRingProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 max-w-[640px] mx-auto">
      {nodes.map((node, i) => (
        <div
          key={i}
          className="group relative px-[18px] py-2.5 bg-sage-50 border border-sage-200 rounded-full font-sans text-[0.8rem] font-normal text-sage-800 leading-[1.4] max-w-[280px] text-center transition-all duration-300 hover:bg-sage-100 hover:border-sage-300 hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(58,90,64,0.08)] cursor-default"
        >
          {node}
          {/* Subtle hover dot indicator */}
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sage-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ))}
    </div>
  );
}
