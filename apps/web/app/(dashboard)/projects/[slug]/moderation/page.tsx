/**
 * Moderation Queue Page
 * Server component for the moderation queue route
 */

import { ModerationQueue } from "@/components/moderation/moderation-queue";

interface ModerationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ModerationPage({ params }: ModerationPageProps) {
  const { slug } = await params;

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Moderation Queue</h1>
        <p className="text-muted-foreground">
          Review and moderate testimonials with auto-moderation insights
        </p>
      </div>

      <ModerationQueue slug={slug} />
    </div>
  );
}
