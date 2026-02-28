"use client";

import { SectionHeader } from "./section-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";

const faqs = [
  {
    question: "Do I need coding skills to use Tresta?",
    answer:
      "Not at all! You can create forms and widgets using our visual editor. Embedding them is as simple as copying and pasting a single line of code.",
  },
  {
    question: "Can I import existing testimonials?",
    answer:
      "Yes, you can manually add existing testimonials or import them via CSV (coming soon). We also plan to add support for importing from Twitter and other platforms.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "We offer a generous free tier that is free forever. You only need to upgrade if you need more advanced features or higher limits.",
  },
  {
    question: "Can I customize the design?",
    answer:
      "Absolutely. Our widgets are fully customizable to match your brand's colors, fonts, and style.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-[#08090d] py-24 px-4 md:px-24 md:py-32">
      <div className="container max-w-3xl mx-auto">
        <SectionHeader
          title="Frequently asked questions"
          description="Have a question? We're here to help."
        />

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-[#2a2e38]"
            >
              <AccordionTrigger className="text-left text-[#e8eaed] hover:text-[#e8eaed]/80">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[#8b8f99]">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
