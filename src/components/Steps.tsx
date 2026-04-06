"use client";

import { useState } from "react";
import Image from "next/image";

type CardId = "dribbble" | "behance" | "linkedin" | "twitter" | "hired";

const steps = [
  {
    title: "Step 1 — Consultation",
    detail:
      "Begin with a personalized assessment to understand your background, goals, and the best path into OSP engineering.",
    image: "/step1.jpg",
  },
  {
    title: "Step 2 — Enroll & Learn",
    detail:
      "Join an industry-aligned bootcamp with live classes, structured modules, and real telecom workflows.",
    image: "/step2.jpg",
  },
  {
    title: "Step 3 — Build Experience",
    detail:
      "Develop a project portfolio through real-world OSP design projects.",
    image: "/step3.jpg",
  },
  {
    title: "Step 4 — Career Support",
    detail:
      "Get resume grooming, LinkedIn optimization, mock interviews, and job search guidance tailored to OSP Engineering roles.",
    image: "/step4.jpg",
  },
  {
    title: "Step 5 — Get Hired & Pay Later",
    detail:
      "Secure a job through Skarion’s placement support and pay the bulk of your program fee only after you’re hired.",
    image: "/step5.jpg",
  },
];

export default function SocialCards() {
  const [activeCard, setActiveCard] = useState<CardId>("dribbble");
  const [activeStep, setActiveStep] = useState(1);
  const cardIds: CardId[] = [
    "dribbble",
    "behance",
    "linkedin",
    "twitter",
    "hired",
  ];

  return (
    <div className="cards w-full min-h-[330px] h-full h-auto">
      {cardIds.map((id, idx) => (
        <div
          key={id}
          className={`card ${activeCard === id ? "active" : ""}`}
          id={id}
        >
          <button
            type="button"
            className={`card-toggle ${activeStep === idx + 1 && activeCard === id ? "active" : "inactive"}`}
            onClick={() => {
              setActiveCard(id);
              setActiveStep(idx + 1);
            }}
          >
            <i>{idx + 1}</i>
          </button>

          <div className="card-content text-white relative w-full h-full overflow-hidden">
            <Image
              src={steps[idx].image}
              alt={steps[idx].title}
              fill
              className="object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-transparent" />
            <div className="row h-full relative z-10">
              <div className="left col px-8">
                <span className="px-3 py-1 rounded-full bg-white/20 text-[12px] sm:text-[14px] md:text-[14px] lg:text-[12px] inline-block">
                  SKARION PROGRAM STEPS
                </span>
                <h2 className="mt-5 text-[24px] sm:text-[28px] md:text-[30px] lg:text-[36px] font-[600]">
                  {steps[idx].title}
                </h2>
                <p className="mt-2 max-w-lg text-white/90 text-[14px] sm:text-[16px] md:text-[16px] lg:text-[16px]">
                  {steps[idx].detail}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
