"use client";

import { motion } from "framer-motion";

const companies = [
    "Acme Corp",
    "Globex",
    "Soylent Corp",
    "Initech",
    "Umbrella Corp",
    "Stark Ind",
];

export function SocialProof() {
    return (
        <section className="border-y border-white/5 bg-black/20 py-12">
            <div className="container flex flex-col items-center gap-8 text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    Trusted by innovative teams
                </p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                    {companies.map((company, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="text-xl font-bold text-white/20 transition-colors hover:text-white/40 cursor-default"
                        >
                            {company}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
