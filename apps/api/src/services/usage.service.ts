import { prisma } from "@workspace/database/prisma";

export const getUsageCount = async (resource: "projects" | "widgets" | "testimonials" | "teamMembers", userId: string): Promise<number> => {
    switch (resource) {
        case "projects":
            return await prisma.project.count({ where: { userId, isActive: true } });
        case "widgets":
            // Count widgets across all user's projects
            return await prisma.widget.count({
                where: {
                    Project: {
                        userId: userId
                    }
                }
            });
        case "testimonials":
            // Count testimonials across all user's projects (assuming ownership via project)
            // or direct ownership if Testimonial has userId
            return await prisma.testimonial.count({
                where: {
                    userId: userId
                }
            });
        case "teamMembers":
            // Placeholder: Team members not fully implemented yet
            return 0;
        default:
            return 0;
    }
};

export const getUsageStats = async (userId: string) => {
    const [projects, widgets, testimonials, teamMembers] = await Promise.all([
        getUsageCount("projects", userId),
        getUsageCount("widgets", userId),
        getUsageCount("testimonials", userId),
        getUsageCount("teamMembers", userId),
    ]);

    return {
        projects,
        widgets,
        testimonials,
        teamMembers
    };
};
