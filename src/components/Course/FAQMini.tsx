"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Skarion?",
    answer:
      "Skarion is a career placement program that trains and prepares you for full-time OSP and telecom engineering roles.",
  },
  {
    question: "Why choose Skarion over free courses?",
    answer:
      "Free courses teach concepts. Skarion prepares you for employment with hands-on training, resume grooming, interview preparation, and active job placement support.",
  },
  {
    question:
      "Why should I consider switching to the telecom industry if my degree is in a different field?",
    answer:
      "The telecom industry is experiencing growing demand, with numerous job opportunities available. It offers an entry point into engineering roles and provides a stable, long-term career path.",
  },
  {
    question: "Does Skarion guarantee jobs?",
    answer: "Yes we do.",
  },
  {
    question: "What if I don’t get a job?",
    answer:
      "If you don’t get placed within 90 days, your initial deposit is refunded (terms apply).",
  },
  {
    question: "Will someone assist me personally?",
    answer:
      "Yes, a dedicated team supports your training, applications, and interviews.",
  },
  {
    question: "What kind of hands-on projects will I build during the program?",
    answer:
      "You pay a small deposit to start, and the full $6,000 fee is paid only after job placement.",
  },
  {
    question: "Are discounts available?",
    answer: "Yes, limited discounts and flexible options may be available.",
  },
  {
    question: "Who is this for?",
    answer:
      "Beginners, career switchers, and international students serious about full-time telecom roles.",
  },
  {
    question: "How long does the program take?",
    answer:
      "Training typically takes a few months, followed by placement support.",
  },
  {
    question: "Do I need any prior experience?",
    answer: "No prior experience is required.",
  },
];

const FAQPage: React.FC = () => {
  return (
    <div className="w-full bg-[#ffffff] max-w-[1440px] mx-auto">
      <div className="max-w-4xl">
        <h3 className="text-[24px] sm:text-[28px] md:text-[32px] leading-[1.4] font-[500] text-[#0a0a0a] mb-8 text-left">
          Got a question?
        </h3>
        <Accordion type="multiple" className="w-full space-y-3">
          {faqData.slice(0, 6).map((item, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="border border-[#EBEBEB] rounded-lg bg-transparent px-2 last:border-b"
            >
              <AccordionTrigger className="hover:no-underline py-4 justify-start gap-3 group [&>svg:last-child]:hidden flex items-center px-2">
                <ChevronRightIcon className="size-5 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-90 shrink-0" />
                <span className="font-[400] text-[14px] sm:text-[16px] text-black text-left">
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-8 sm:pl-8">
                <div className="text-gray-700 text-[14px] font-[300] leading-relaxed">
                  {item.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQPage;
