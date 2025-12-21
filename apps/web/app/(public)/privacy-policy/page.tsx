import Link from "next/link"

export default function PrivacyPolicyPage() {
    return (
        <div className="container max-w-3xl py-12 md:py-24">
            <div className="prose prose-zinc dark:prose-invert max-w-none">
                <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="mt-8 space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold">1. Introduction</h2>
                        <p>
                            Tresta respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">2. Data We Collect</h2>
                        <p>
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
                            <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
                            <li><strong>Testimonial Data:</strong> When you submit a testimonial, we collect the content of your review along with your name, role, company, and avatar. This information is intended for public display on our customers' websites. We also privately collect your email address for verification and your IP address for spam prevention.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">Your Rights & Data Control</h2>
                        <p>
                            You have full control over your personal data. We provide tools for you to access, download, or delete your data at any time.
                        </p>
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                            <h3 className="font-medium mb-2">Self-Serve Data Tools</h3>
                            <p className="mb-3 text-sm text-muted-foreground">
                                Use our automated portal to manage your data without waiting for support.
                            </p>
                            <a
                                href="/privacy/request"
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Manage My Data
                            </a>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">3. How We Use Your Data</h2>
                        <p>
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal or regulatory obligation.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">4. Data Security</h2>
                        <p>
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">5. Third-Party Links</h2>
                        <p>
                            This website may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">6. Contact Us</h2>
                        <p>
                            If you have any questions about this privacy policy or our privacy practices, please contact us at <Link href="mailto:support@tresta.app" className="text-primary hover:underline">support@tresta.app</Link>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
