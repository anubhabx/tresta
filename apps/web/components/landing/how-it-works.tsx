import { Link as LinkIcon, ShieldCheck, Code2 } from "lucide-react";

const steps = [
  {
    icon: LinkIcon,
    title: "1. Share",
    description: "Generate a branded collection link in one click.",
  },
  {
    icon: ShieldCheck,
    title: "2. Moderate",
    description:
      "AI-powered risk scoring and spam detection handles the noise.",
  },
  {
    icon: Code2,
    title: "3. Embed",
    description:
      "Drop a lightweight script anywhere and let the widgets do the work.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden bg-background border-y border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-medium text-white mb-4">
            How it works
          </h2>
          <p className="text-zinc-500 font-sans max-w-2xl mx-auto">
            Three simple steps to automate your social proof workflow entirely
            from scratch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="w-14 h-14 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 relative z-10 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-500">
                <step.icon className="w-6 h-6 text-zinc-400 group-hover:text-primary transition-colors duration-500" />
              </div>
              <h3 className="text-xl font-medium text-zinc-200 mb-3">
                {step.title}
              </h3>
              <p className="text-zinc-500 leading-relaxed text-sm max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
