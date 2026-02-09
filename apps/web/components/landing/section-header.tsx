import { cn } from "@workspace/ui/lib/utils";

interface SectionHeaderProps {
  title: string;
  description: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeader({
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 mb-16",
        align === "center"
          ? "items-center text-center"
          : "items-start text-left",
        className,
      )}
    >
      <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
        {description}
      </p>
    </div>
  );
}
