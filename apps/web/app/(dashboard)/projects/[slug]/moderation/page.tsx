/**
 * Moderation Queue Page
 * Server component for the moderation queue route
 */

import { TestimonialList } from "@/components/testimonial-list";

interface ModerationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ModerationPage({ params }: ModerationPageProps) {
  const { slug } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Moderation Queue</h2>
        <p className="text-muted-foreground mt-1">
          Review, approve, and manage testimonials with advanced moderation tools and insights.
        </p>
      </div>

      <TestimonialList projectSlug={slug} moderationMode={true} />
    </div>
  );
}
