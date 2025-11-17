import { WidgetsClient } from './widgets-client';

interface WidgetsPageProps {
  params: Promise<{ id: string }>;
}

export default async function WidgetsPage({ params }: WidgetsPageProps) {
  const { id } = await params;
  return <WidgetsClient projectId={id} />;
}
