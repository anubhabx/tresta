import { ProjectSettingsClient } from './project-settings-client';

interface ProjectSettingsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const { id } = await params;
  return <ProjectSettingsClient projectId={id} />;
}
