interface RingLabelProps {
  label: string;
}

export default function RingLabel({ label }: RingLabelProps) {
  return (
    <div className="relative text-center my-9">
      <span className="relative z-[1] inline-block bg-sand-50 px-5 font-sans text-[0.6rem] font-semibold tracking-[0.2em] uppercase text-earth-400">
        {label}
      </span>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[240px] h-px bg-sand-300" />
    </div>
  );
}
