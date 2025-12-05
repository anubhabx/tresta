import { prisma, UserPlan } from '@workspace/database/prisma.js';

const plans = [
    {
        name: 'Free',
        slug: 'free',
        tier: UserPlan.FREE,
        description: 'Perfect for getting started',
        amount: 0,
        currency: 'INR',
        interval: 'monthly',
        intervalCount: 1,
        maxProjects: 1,
        maxTestimonials: 50,
        maxApiRequests: 300,
        isActive: true,
    },
    {
        name: 'Pro Monthly',
        slug: 'pro-monthly',
        tier: UserPlan.PRO,
        description: 'For growing businesses',
        amount: 50000, // 500 INR
        currency: 'INR',
        interval: 'monthly',
        intervalCount: 1,
        maxProjects: -1,
        maxTestimonials: -1,
        maxApiRequests: -1,
        isActive: true,
        // razorpayPlanId: 'plan_Hw8...', // To be filled after creating in Razorpay
    },
    {
        name: 'Pro Yearly',
        slug: 'pro-yearly',
        tier: UserPlan.PRO,
        description: 'Best value for long term',
        amount: 500000, // 5000 INR (2 months free)
        currency: 'INR',
        interval: 'yearly',
        intervalCount: 1,
        maxProjects: -1,
        maxTestimonials: -1,
        maxApiRequests: -1,
        isActive: true,
        // razorpayPlanId: 'plan_Hw9...', // To be filled after creating in Razorpay
    },
];

async function main() {
    console.log('Seeding plans...');

    for (const plan of plans) {
        const existing = await prisma.plan.findUnique({
            where: { slug: plan.slug },
        });

        if (!existing) {
            await prisma.plan.create({
                data: plan,
            });
            console.log(`Created plan: ${plan.name}`);
        } else {
            console.log(`Plan already exists: ${plan.name}`);
            // Optional: Update existing plan if needed
            // await prisma.plan.update({ where: { slug: plan.slug }, data: plan });
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
