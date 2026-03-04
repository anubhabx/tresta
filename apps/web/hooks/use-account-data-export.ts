import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useApi } from "./use-api";
import { getHttpErrorMessage } from "@/lib/errors/http-error";

interface ExportProject {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  website?: string | null;
  logo?: string | null;
  visibility?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ExportWidget {
  id: string;
  name?: string;
  projectId?: string;
  layout?: string;
  config?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

interface ExportTestimonial {
  id: string;
  projectId?: string;
  name?: string;
  email?: string;
  content?: string;
  rating?: number | null;
  verified?: boolean;
  featured?: boolean;
  status?: string;
  createdAt?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toProject = (value: unknown): ExportProject | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.slug !== "string" ||
    typeof value.name !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    slug: value.slug,
    name: value.name,
    description: typeof value.description === "string" ? value.description : null,
    website: typeof value.website === "string" ? value.website : null,
    logo: typeof value.logo === "string" ? value.logo : null,
    visibility: typeof value.visibility === "string" ? value.visibility : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : undefined,
  };
};

const toWidget = (value: unknown): ExportWidget | null => {
  if (!isRecord(value) || typeof value.id !== "string") {
    return null;
  }

  return {
    id: value.id,
    name: typeof value.name === "string" ? value.name : undefined,
    projectId: typeof value.projectId === "string" ? value.projectId : undefined,
    layout: typeof value.layout === "string" ? value.layout : undefined,
    config: isRecord(value.config) ? value.config : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : undefined,
  };
};

const toTestimonial = (value: unknown): ExportTestimonial | null => {
  if (!isRecord(value) || typeof value.id !== "string") {
    return null;
  }

  return {
    id: value.id,
    projectId: typeof value.projectId === "string" ? value.projectId : undefined,
    name: typeof value.name === "string" ? value.name : undefined,
    email: typeof value.email === "string" ? value.email : undefined,
    content: typeof value.content === "string" ? value.content : undefined,
    rating: typeof value.rating === "number" ? value.rating : null,
    verified: typeof value.verified === "boolean" ? value.verified : undefined,
    featured: typeof value.featured === "boolean" ? value.featured : undefined,
    status: typeof value.status === "string" ? value.status : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
  };
};

export function useAccountDataExport() {
  const { user } = useUser();
  const api = useApi();
  const [isExporting, setIsExporting] = useState(false);

  const exportAccountData = async () => {
    if (!user) {
      return;
    }

    try {
      setIsExporting(true);

      const projectsResponse = await api.get("/api/projects");
      const rawProjects: unknown[] = Array.isArray(projectsResponse.data?.data)
        ? projectsResponse.data.data
        : [];
      const projects = rawProjects
        .map((project) => toProject(project))
        .filter((project): project is ExportProject => project !== null);

      const widgetsPromises = projects.map((project) =>
        api
          .get(`/api/widgets/project/${project.slug}`)
          .catch(() => ({ data: { data: [] } })),
      );
      const widgetsResponses = await Promise.all(widgetsPromises);
      const widgets = widgetsResponses
        .flatMap((response) =>
          Array.isArray(response.data?.data) ? response.data.data : [],
        )
        .map((widget) => toWidget(widget))
        .filter((widget): widget is ExportWidget => widget !== null);

      const testimonialsPromises = projects.map((project) =>
        api
          .get(`/api/projects/${project.slug}/testimonials`)
          .catch(() => ({ data: { data: [] } })),
      );
      const testimonialsResponses = await Promise.all(testimonialsPromises);
      const testimonials = testimonialsResponses
        .flatMap((response) =>
          Array.isArray(response.data?.data) ? response.data.data : [],
        )
        .map((testimonial) => toTestimonial(testimonial))
        .filter(
          (testimonial): testimonial is ExportTestimonial => testimonial !== null,
        );

      const userData = {
        profile: {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        externalAccounts: user.externalAccounts?.map((account) => ({
          provider: account.provider,
          emailAddress: account.emailAddress,
          username: account.username,
        })),
        projects: projects.map((project) => ({
          id: project.id,
          name: project.name,
          slug: project.slug,
          description: project.description,
          website: project.website,
          logo: project.logo,
          visibility: project.visibility,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        })),
        widgets: widgets.map((widget) => ({
          id: widget.id,
          name: widget.name,
          projectId: widget.projectId,
          layout: widget.layout,
          config: widget.config,
          createdAt: widget.createdAt,
          updatedAt: widget.updatedAt,
        })),
        testimonials: testimonials.map((testimonial) => ({
          id: testimonial.id,
          projectId: testimonial.projectId,
          name: testimonial.name,
          email: testimonial.email,
          content: testimonial.content,
          rating: testimonial.rating,
          verified: testimonial.verified,
          featured: testimonial.featured,
          status: testimonial.status,
          createdAt: testimonial.createdAt,
        })),
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tresta-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Your data has been downloaded successfully.");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(
        getHttpErrorMessage(error, "Failed to export your data. Please try again."),
      );
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportAccountData,
  };
}
