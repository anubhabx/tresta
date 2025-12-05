import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy - Tresta",
    description: "Privacy Policy for Tresta.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto max-w-3xl py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <div className="prose dark:prose-invert">
                <p className="mb-4">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <p className="mb-4">
                    At Tresta, accessible from https://tresta.app, one of our main priorities is the privacy of our visitors.
                    This Privacy Policy document contains types of information that is collected and recorded by Tresta and how we use it.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
                <p className="mb-4">
                    The personal information that you are asked to provide, and the reasons why you are asked to provide it,
                    will be made clear to you at the point we ask you to provide your personal information.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Your Information</h2>
                <p className="mb-4">
                    We use the information we collect in various ways, including to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Provide, operate, and maintain our website</li>
                    <li>Improve, personalize, and expand our website</li>
                    <li>Understand and analyze how you use our website</li>
                    <li>Develop new products, services, features, and functionality</li>
                    <li>Communicate with you, either directly or through one of our partners</li>
                    <li>Send you emails</li>
                    <li>Find and prevent fraud</li>
                </ul>

                <h2 className="text-xl font-semibold mt-6 mb-2">Log Files</h2>
                <p className="mb-4">
                    Tresta follows a standard procedure of using log files. These files log visitors when they visit websites.
                    All hosting companies do this and a part of hosting services' analytics.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
                <p className="mb-4">
                    If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
                </p>
            </div>
        </div>
    );
}
