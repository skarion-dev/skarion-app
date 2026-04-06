"use client";

import { useState } from "react";

type CardId = "dribbble" | "behance" | "linkedin" | "twitter" | "hired";

const steps = [
  {
    title: "Step 1 — Consultation",
    detail:
      "Begin with a personalized assessment to understand your background, goals, and the best path into OSP engineering.",
    color: "#f06292",
  },
  {
    title: "Step 2 — Enroll & Learn",
    detail:
      "Join an industry-aligned bootcamp with live classes, structured modules, and real telecom workflows.",
    color: "#122461",
  },
  {
    title: "Step 3 — Build Experience",
    detail:
      "Develop a project portfolio through simulated OSP design projects, AutoCAD tasks, and real-world scenarios.",
    color: "#1f2937",
  },
  {
    title: "Step 4 — Career Support",
    detail:
      "Get resume grooming, LinkedIn optimization, mock interviews, and job search guidance tailored to telecom roles.",
    color: "#0ea5e9",
  },
  {
    title: "Step 5 — Get Hired & Pay Later",
    detail:
      "Secure a job through Skarion’s placement support and pay the bulk of your program fee only after you’re hired.",
    color: "#10b981",
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
    <div className="cards w-full h-full">
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
            <p>{idx + 1}</p>
          </button>

          <div
            className="card-content text-white relative w-full h-full"
            style={{ backgroundColor: steps[idx].color }}
          >
            <div className="row h-full">
              <div className="left col px-8">
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs inline-block">
                  SKARION PROGRAM STEPS
                </span>
                <h2 className="mt-5 text-[32px] font-[600]">
                  {steps[idx].title}
                </h2>
                <p className="mt-4 max-w-lg text-white/90">
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
