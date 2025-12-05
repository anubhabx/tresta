'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import Script from 'next/script';

interface Plan {
    id: string;
    name: string;
    slug: string;
    description: string;
    amount: number;
    currency: string;
    interval: string;
    maxProjects: number;
    maxTestimonials: number;
}

export default function PricingPage() {
    const { isSignedIn, isLoaded } = useAuth();
    const { user } = useUser();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch plans from API
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/plans`) // We need to expose this endpoint
            .then((res) => res.json())
            .then((data) => {
                setPlans(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch plans', err);
                setLoading(false);
            });
    }, []);

    const handleSubscribe = async (planSlug: string) => {
        if (!isSignedIn) {
            // Redirect to login
            window.location.href = '/sign-in';
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add auth header if needed, usually handled by cookie or token
                    Authorization: `Bearer ${await window.Clerk?.session?.getToken()}`,
                },
                body: JSON.stringify({ planSlug }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create subscription');
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                subscription_id: data.subscriptionId,
                name: 'Tresta',
                description: `Subscription for ${planSlug}`,
                handler: async function (response: any) {
                    // Verify payment
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/verify`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${await window.Clerk?.session?.getToken()}`,
                        },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });
                    alert('Subscription successful!');
                    window.location.href = '/dashboard';
                },
                theme: {
                    color: '#3399cc',
                },
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Failed to start subscription');
        }
    };

    if (loading) return <div>Loading plans...</div>;

    return (
        <div className="container mx-auto py-12">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <h1 className="text-3xl font-bold text-center mb-8">Simple, Transparent Pricing</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
                        <p className="text-gray-600 mb-4">{plan.description}</p>
                        <div className="text-3xl font-bold mb-4">
                            {plan.amount === 0 ? 'Free' : `₹${plan.amount / 100}`}
                            <span className="text-sm font-normal text-gray-500">/{plan.interval}</span>
                        </div>
                        <ul className="mb-6 space-y-2">
                            <li>{plan.maxProjects === -1 ? 'Unlimited' : plan.maxProjects} Projects</li>
                            <li>{plan.maxTestimonials === -1 ? 'Unlimited' : plan.maxTestimonials} Testimonials</li>
                            <li>{plan.maxApiRequests === -1 ? 'Unlimited' : plan.maxApiRequests} API Requests</li>
                        </ul>
                        <button
                            onClick={() => handleSubscribe(plan.slug)}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            {plan.amount === 0 ? 'Get Started' : 'Subscribe'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
