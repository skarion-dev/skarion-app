"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
      "question": "What is OSP (Outside Plant) Engineering?",
      "answer": "OSP engineering involves designing and building the fiber-optic and telecom infrastructure outside buildings, such as on streets, poles, and underground routes."
    },
    {
      "question": "How does a career in the OSP industry look?",
      "answer": "OSP engineers work in a stable, high-demand field with growth potential, involving tasks like fiber network design, installation, testing, and maintenance."
    },
    {
      "question": "What is Skarion?",
      "answer": "Skarion is a career placement program that trains and prepares you for full-time OSP and telecom engineering roles."
    },
    {
      "question": "Why choose Skarion over free courses?",
      "answer": "Free courses teach concepts. Skarion prepares you for employment with hands-on training, resume grooming, interview preparation, and active job placement support."
    },
    {
      "question": "Why should I consider switching to the telecom industry if my degree is in a different field?",
      "answer": "The telecom industry is experiencing growing demand, with numerous job opportunities available. It offers an entry point into engineering roles and provides a stable, long-term career path."
    },
    {
      "question": "What is the minimum level of study needed to become an OSP Design Engineer?",
      "answer": "A bachelor’s degree in civil engineering, Electrical Engineering (EEE), Mechanical Engineering, Architecture, or related fields is preferred. But, you can start as a beginner with Skarion if you are willing to learn and put in the effort."
    },
    {
      "question": "Does Skarion guarantee jobs?",
      "answer": "Yes, we do."
    },
    {
      "question": "What if I don’t get a job?",
      "answer": "If you don’t get placed within 90 days, your initial deposit is refunded (terms apply)."
    },
    {
      "question": "Is there a money-back guarantee if I don’t get a job?",
      "answer": "Yes, if you don’t get placed within 90 days, your deposit is refunded (terms apply)."
    },
    {
      "question": "How does this process work?",
      "answer": "You train → practice real skills → get resume & interview prep → apply with guidance → get placed."
    },
    {
      "question": "Will someone assist me personally?",
      "answer": "Yes, a dedicated team supports your training, applications, and interviews."
    },
    {
      "question": "When do I have to pay?",
      "answer": "You pay a small deposit to start, and the remaining $6,000 is paid only after job placement."
    },
  
    {
      "question": "How does the payment method work?",
      "answer": "You start by paying a small deposit, and the remaining $6,000 is only paid after you land a job."
    },
    {
      "question": "Are discounts available?",
      "answer": "Yes, limited discounts and flexible options may be available."
    },
    {
      "question": "Who is this for?",
      "answer": "Beginners, career switchers, and international students serious about full-time telecom roles."
    },
    {
      "question": "How long does the program take?",
      "answer": "Training typically takes 4-6 weeks, followed by placement support."
    },
    {
      "question": "What is the time commitment for this program?",
      "answer": "It requires consistent effort over a few weeks (4-6), with flexible schedules to suit your pace."
    },
    {
      "question": "Do I need prior experience?",
      "answer": "No prior experience is required; commitment matters more."
    },
    {
      "question": "What help will I get from Skarion in landing a job?",
      "answer": "Skarion provides resume building, interview preparation, job application support, and connects you with placement opportunities."
    },
    {
      "question": "Do I need to pay upfront for the full program?",
      "answer": "No, only the deposit is required upfront; you pay the rest only after job placement."
    },
    {
      "question": "Will I get a certificate at the end?",
      "answer": "Yes, you will get a Skarion certification upon completing the program, but the focus is on job readiness."
    },
    {
      "question": "Is this program just for U.S. residents, or can international students apply?",
      "answer": "This program is open to anyone residing in the U.S., including U.S. citizens, green card holders, and international students, especially those on OPT/CPT."
    },
    {
      "question": "What happens after I complete the training?",
      "answer": "You receive placement support, help with resume building, and job application assistance to land a full-time role."
    },
    {
      "question": "How does the program differ from other courses or bootcamps?",
      "answer": "Unlike other courses, Skarion provides hands-on training tailored to real-world OSP projects and direct support to help you get hired."
    },
    {
      "question": "What if I need more support during the program?",
      "answer": "You get personalized mentorship and support throughout the training to help you succeed."
    },
    {
      "question": "What does the course comply with?",
      "answer": "The course complies with U.S. telecom standards like NESC, NEC, and other industry codes."
    },
    {
      "question": "What are the job prospects after completing the program?",
      "answer": "The program prepares you for full-time positions like OSP Engineer, OSP Designer, and Fiber Network Engineer, with placement support in the U.S."
    },
    {
      "question": "Is the program suitable for beginners?",
      "answer": "Yes, you don’t need prior OSP or telecom experience; just a commitment to learning."
    },
    {
      "question": "How will Skarion help me get hired?",
      "answer": "Skarion provides personalized guidance, mock interviews, and job application coaching to help you land a full-time role in OSP engineering."
    }
];

const FAQPage: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const normalizedQuery = query.trim();
  const filteredFaq = React.useMemo(() => {
    if (!normalizedQuery) return faqData;
    const q = normalizedQuery.toLowerCase();
    return faqData.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q),
    );
  }, [normalizedQuery]);
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const re = new RegExp(`(${escapeRegExp(q)})`, "ig");
    const parts = text.split(re);
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 px-0.5 rounded-sm">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  };
  return (
    <div className="w-full bg-[#ffffff] sm:py-10 py-5 sm:px-12 px-6 max-w-[1440px] mx-auto">
      <h1 className="text-[#000000] text-[40px] sm:text-[64px] leading-[1.2] text-left mb-6 sm:mb-12 mt-10">
        Frequently Asked Questions
      </h1>
      <div className="w-full mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center gap-2">
          <Input
            id="faq-search"
            placeholder="Search questions or answers"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
            className="h-10"
          />
          {query && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuery("")}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="mt-6 text-sm text-gray-600 ml-auto w-fit">
          {filteredFaq.length} of {faqData.length} results
        </div>
      </div>
      <Accordion type="multiple" className="w-full">
        {(normalizedQuery ? filteredFaq : faqData).map((item, index) => (
          <AccordionItem
            key={index}
            value={`faq-${index}`}
            className="border-b border-[#EBEBEB] last:border-b-0"
          >
            <AccordionTrigger className="hover:no-underline text-left py-3 sm:py-4 md:py-5">
              <span className="font-[400] text-[14px] sm:text-[16px] md:text-[18px] text-gray-800">
                {highlight(item.question, normalizedQuery)}
              </span>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <div className="pb-3 sm:pb-4 md:pb-5 text-gray-600 text-[13px] sm:text-[14px] md:text-[16px]">
                {highlight(item.answer, normalizedQuery)}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {normalizedQuery && filteredFaq.length === 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          No matching questions found.
        </div>
      )}
    </div>
  );
};

export default FAQPage;
