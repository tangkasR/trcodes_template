type Tone = "slate" | "ink" | "white";

const tones: Record<Tone, string> = {
  slate: "bg-slate-200/80",
  ink: "bg-ink/10",
  white: "bg-white/10",
};

export default function Skeleton({
  className = "",
  tone = "slate",
}: {
  className?: string;
  tone?: Tone;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md ${tones[tone]} ${className}`}
    />
  );
}
