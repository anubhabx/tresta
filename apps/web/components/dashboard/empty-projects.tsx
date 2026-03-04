import { FolderIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Button } from "@workspace/ui/components/button";

import { useSubscription } from "@/hooks/use-subscription";

export function EmptyProjects() {
  const { usage, plan, isPro, isLoading } = useSubscription();

  const isLimitReached =
    !isPro &&
    usage?.projects !== undefined &&
    plan?.limits?.projects !== undefined &&
    usage.projects >= plan.limits.projects;

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderIcon />
        </EmptyMedia>
        <EmptyTitle>No Projects Yet</EmptyTitle>
        <EmptyDescription>
          {isLimitReached
            ? "You have reached the project limit for your current plan."
            : "You haven't added any projects yet. Get started by creating your first project."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {isLimitReached ? (
          <Button asChild variant="default">
            <Link href="/dashboard/settings">Upgrade Plan</Link>
          </Button>
        ) : (
          <Button asChild disabled={isLoading}>
            <Link href="/projects/new">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Project
            </Link>
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
