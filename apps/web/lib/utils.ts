export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
    }).format(amount / 100);
};

export const formatPlanLabel = (key: string) => {
    const labels: Record<string, string> = {
        widgets: "Widgets",
        apiCalls: "API Calls",
        projects: "Projects",
        teamMembers: "Team Members",
        testimonials: "Testimonials",
    };
    return labels[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
};