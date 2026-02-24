interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <header className={className}>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-lg text-muted-foreground">
          {description}
        </p>
      ) : null}
    </header>
  );
}
