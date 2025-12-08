import { PrismaClient, UserPlan } from "../dist/prisma.js";

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // 1. Free Plan
    const freePlan = {
        name: 'Free',
        description: 'Perfect for individuals and hobby projects',
        price: 0,
        currency: 'INR',
        interval: 'month',
        type: UserPlan.FREE,
        isActive: true,
        limits: {
            projects: 1,
            testimonials: 10,
            apiCalls: 200,
            widgets: 1,
            teamMembers: 1
        },
        razorpayPlanId: null // Free plans don't need Razorpay ID
    };

    // 2. Pro Plan (Monthly) - 500 INR/month
    const proMonthly = {
        name: 'Pro Monthly',
        description: 'For growing businesses requiring unlimited power',
        price: 50000, // 500 INR in paise
        currency: 'INR',
        interval: 'month',
        type: UserPlan.PRO,
        isActive: true,
        limits: {
            projects: -1, // Unlimited
            testimonials: -1, // Unlimited
            apiCalls: -1, // Unlimited
            widgets: -1,
            teamMembers: -1
        },
        razorpayPlanId: 'plan_pro_monthly_id_placeholder' // Should be replaced with actual ID from Razorpay Dashboard
    };

    // 3. Pro Plan (Yearly) - 5000 INR/year (2 months off)
    const proYearly = {
        name: 'Pro Yearly',
        description: 'Best value for long-term growth',
        price: 500000, // 5000 INR in paise (10 * 500)
        currency: 'INR',
        interval: 'year',
        type: UserPlan.PRO,
        isActive: true,
        limits: {
            projects: -1, // Unlimited
            testimonials: -1, // Unlimited
            apiCalls: -1, // Unlimited
            widgets: -1,
            teamMembers: -1
        },
        razorpayPlanId: 'plan_pro_yearly_id_placeholder' // Should be replaced with actual ID from Razorpay Dashboard
    };

    const upsertPlans = [freePlan, proMonthly, proYearly];

    for (const p of upsertPlans) {
        // Upsert by name + interval to handle variants unique enough for this mock
        // Actually name should be enough if unique.
        // Let's check if exists by name first to avoid unique constraint issues if name isn't unique in schema (it isn't)
        const existing = await prisma.plan.findFirst({
            where: { name: p.name, interval: p.interval }
        });

        if (existing) {
            const updated = await prisma.plan.update({
                where: { id: existing.id },
                data: p
            });
            console.log(`Updated plan: ${updated.name} (${updated.interval}) - ${updated.id}`);
        } else {
            const created = await prisma.plan.create({
                data: p as any
            });
            console.log(`Created plan: ${created.name} (${created.interval}) - ${created.id}`);
        }
    }

    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
