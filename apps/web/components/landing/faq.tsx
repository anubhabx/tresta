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
    <section className="container max-w-3xl mx-auto py-24 px-4 md:px-24 md:py-32">
      <SectionHeader
        title="Frequently asked questions"
        description="Have a question? We're here to help."
      />

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
