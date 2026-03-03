import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { moderation, testimonials } from "@/lib/queries";
import {
  addToActionHistory,
  getValidTestimonialsForAction,
  type BulkActionHistory,
} from "@/lib/testimonial-list-utils";
import { getHttpErrorMessage } from "@/lib/errors/http-error";
import type { ModerationStatus, Testimonial } from "@/types/api";
import { toast } from "sonner";

interface UseTestimonialListActionsParams {
  projectSlug: string;
  allTestimonials: Testimonial[];
  selectedIds: string[];
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
}

export function useTestimonialListActions({
  projectSlug,
  allTestimonials,
  selectedIds,
  setSelectedIds,
}: UseTestimonialListActionsParams) {
  const [loadingState, setLoadingState] = useState<{
    id: string;
    action: string;
  } | null>(null);
  const [actionHistory, setActionHistory] = useState<BulkActionHistory[]>([]);

  const updateMutation = testimonials.mutations.useUpdate(projectSlug);
  const deleteMutation = testimonials.mutations.useDelete(projectSlug);
  const bulkModerationMutation = moderation.mutations.useBulkAction(projectSlug);

  const validForApprove = useMemo(
    () =>
      getValidTestimonialsForAction(allTestimonials, selectedIds, "approve")
        .length,
    [selectedIds, allTestimonials],
  );

  const validForReject = useMemo(
    () =>
      getValidTestimonialsForAction(allTestimonials, selectedIds, "reject")
        .length,
    [selectedIds, allTestimonials],
  );

  const validForFlag = useMemo(
    () => getValidTestimonialsForAction(allTestimonials, selectedIds, "flag").length,
    [selectedIds, allTestimonials],
  );

  const handleApprove = async (id: string) => {
    setLoadingState({ id, action: "approve" });
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          isApproved: true,
          moderationStatus: "APPROVED" as ModerationStatus,
        },
      });
      toast.success("Testimonial approved! View in Testimonials tab to publish it.");
    } catch (error: unknown) {
      toast.error(getHttpErrorMessage(error, "Failed to approve testimonial"));
    } finally {
      setLoadingState(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingState({ id, action: "reject" });
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          isApproved: false,
          moderationStatus: "REJECTED" as ModerationStatus,
        },
      });
      toast.success("Testimonial rejected");
    } catch (error: unknown) {
      toast.error(getHttpErrorMessage(error, "Failed to reject testimonial"));
    } finally {
      setLoadingState(null);
    }
  };

  const handlePublish = async (id: string) => {
    setLoadingState({ id, action: "publish" });
    try {
      await updateMutation.mutateAsync({ id, data: { isPublished: true } });
      toast.success("Testimonial published!");
    } catch (error: unknown) {
      const errorMessage = getHttpErrorMessage(
        error,
        "Failed to publish testimonial",
      );

      if (errorMessage.includes("approved")) {
        toast.error(
          "Cannot publish unapproved testimonial. Approve it in the Moderation tab first.",
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoadingState(null);
    }
  };

  const handleUnpublish = async (id: string) => {
    setLoadingState({ id, action: "unpublish" });
    try {
      await updateMutation.mutateAsync({ id, data: { isPublished: false } });
      toast.success("Testimonial unpublished");
    } catch (error: unknown) {
      toast.error(getHttpErrorMessage(error, "Failed to unpublish testimonial"));
    } finally {
      setLoadingState(null);
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingState({ id, action: "delete" });
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Testimonial deleted");
    } catch (error: unknown) {
      toast.error(getHttpErrorMessage(error, "Failed to delete testimonial"));
    } finally {
      setLoadingState(null);
    }
  };

  const handleUndoBulkAction = async (actionId: string) => {
    const action = actionHistory.find((historyAction) => historyAction.id === actionId);
    if (!action) {
      return;
    }

    const { testimonialIds, previousStatuses } = action;

    try {
      for (const id of testimonialIds) {
        const previousStatus = previousStatuses.get(id);
        if (previousStatus) {
          await bulkModerationMutation.mutateAsync({
            testimonialIds: [id],
            action:
              previousStatus === "APPROVED"
                ? "approve"
                : previousStatus === "REJECTED"
                  ? "reject"
                  : "flag",
          });
        }
      }

      toast.success(`Undid action on ${testimonialIds.length} testimonial(s)`);
      setActionHistory((prev) => prev.filter((historyAction) => historyAction.id !== actionId));
    } catch (error: unknown) {
      toast.error(getHttpErrorMessage(error, "Failed to undo action"));
    }
  };

  const executeBulkAction = async (
    action: "approve" | "reject" | "flag",
    alreadyMessage: string,
    successLabel: string,
  ) => {
    if (selectedIds.length === 0) {
      toast.error("No testimonials selected");
      return;
    }

    const validTestimonials = getValidTestimonialsForAction(
      allTestimonials,
      selectedIds,
      action,
    );
    const validIds = validTestimonials.map((testimonial) => testimonial.id);

    if (validIds.length === 0) {
      toast.info(alreadyMessage);
      return;
    }

    const previousStatuses = new Map<string, ModerationStatus>();
    validTestimonials.forEach((testimonial) => {
      previousStatuses.set(testimonial.id, testimonial.moderationStatus);
    });

    const skipped = selectedIds.length - validIds.length;

    try {
      await bulkModerationMutation.mutateAsync({
        testimonialIds: validIds,
        action,
      });

      const { history: newHistory, actionId } = addToActionHistory(actionHistory, {
        testimonialIds: validIds,
        action,
        previousStatuses,
        count: validIds.length,
      });
      setActionHistory(newHistory);

      const message =
        skipped > 0
          ? `${validIds.length} testimonial(s) ${successLabel} (${skipped} skipped)`
          : `${validIds.length} testimonial(s) ${successLabel}`;

      toast.success(message, {
        action: {
          label: "Undo",
          onClick: () => handleUndoBulkAction(actionId),
        },
        duration: 10000,
      });

      setSelectedIds([]);
    } catch (error: unknown) {
      toast.error(getHttpErrorMessage(error, `Failed to ${action} testimonials`));
    }
  };

  const handleBulkApprove = () =>
    executeBulkAction(
      "approve",
      "All selected testimonials are already approved",
      "approved",
    );

  const handleBulkReject = () =>
    executeBulkAction(
      "reject",
      "All selected testimonials are already rejected",
      "rejected",
    );

  const handleBulkFlag = () =>
    executeBulkAction(
      "flag",
      "All selected testimonials are already flagged",
      "flagged for review",
    );

  return {
    loadingState,
    actionHistory,
    bulkMutationPending: bulkModerationMutation.isPending,
    validForApprove,
    validForReject,
    validForFlag,
    handleApprove,
    handleReject,
    handlePublish,
    handleUnpublish,
    handleDelete,
    handleUndoBulkAction,
    handleBulkApprove,
    handleBulkReject,
    handleBulkFlag,
  };
}
