"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { OpenAPI, PaymentsService } from "@/api-client";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

const FormCheckbox = ({
  checked,
  onCheckedChange,
  children,
  id,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: React.ReactNode;
  id: string;
}) => (
  <div className="flex items-start space-x-2">
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="mt-[5px]"
    />
    <label
      htmlFor={id}
      className="text-[14px] leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-1"
    >
      {children}
    </label>
  </div>
);

export default function ContractForm({
  purchasePayload,
  token,
  courseFound,
  isPurchased,
  user,
}: {
  purchasePayload: {
    email: string;
    courseId: string;
  };
  token: string;
  courseFound: boolean;
  isPurchased?: boolean;
  user: any;
}) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  // const [understandsPayment, setUnderstandsPayment] = useState(false);
  // const [acceptsRefundPolicy, setAcceptsRefundPolicy] = useState(false);
  // const [agreesToConfidentiality, setAgreesToConfidentiality] = useState(false);
  // const [agreesToNonCompete, setAgreesToNonCompete] = useState(false);
  const searchParam = useSearchParams();

  useEffect(() => {
    if (!courseFound) {
      toast.error("Course not found");
    }
    const status = searchParam.get("status");
    if (!status) return;
    if (status === "success") {
      toast.success("Purchase successful");
    } else {
      toast.error("Purchase failed");
    }
  }, []);

  const isFormValid = agreedToTerms;
  // understandsPayment &&
  // acceptsRefundPolicy &&
  // agreesToConfidentiality &&
  // agreesToNonCompete;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(purchasePayload);
    if (!purchasePayload.courseId || !purchasePayload.email) {
      toast.error("Invalid input for course/email");
      return;
    }

    OpenAPI.TOKEN = token;
    const resp =
      await PaymentsService.paymentsControllerCreateCheckout(purchasePayload);
    if (!resp.sessionId) {
      toast.error("Failed to create checkout session");
      return;
    }

    window.location.href = resp.url;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-between w-full h-full text-white max-w-full bg-[#122461] rounded-tl-2xl rounded-bl-2xl shadow-2xl shadow-blue-100/40 p-8 md:p-10 space-y-10 ring-1 ring-gray-200/50 text-left"
    >
      <div>
        <div className="flex flex-col items-start gap-3 mb-4">
          <button
            type="button"
            onClick={() =>
              (window.location.href = "/course/outside-plant-engineering")
            }
            className="text-white/80 hover:text-white transition-colors hover:scale-110 duration-1000"
            aria-label="Back to course page"
          >
            <svg
              className="my-auto"
              width="25"
              height="25"
              viewBox="0 0 21 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: "rotate(180deg)" }}
            >
              <path
                d="M18.834 10.4998C18.834 5.89984 15.1007 2.1665 10.5007 2.1665C5.90065 2.1665 2.16732 5.89984 2.16732 10.4998C2.16732 15.0998 5.90065 18.8332 10.5007 18.8332C15.1007 18.8332 18.834 15.0998 18.834 10.4998ZM10.4757 13.4415C10.3507 13.3165 10.2923 13.1582 10.2923 12.9998C10.2923 12.8415 10.3507 12.6832 10.4757 12.5582L11.909 11.1248L7.58399 11.1248C7.24232 11.1248 6.95899 10.8415 6.95899 10.4998C6.95899 10.1582 7.24232 9.87484 7.58399 9.87484L11.909 9.87484L10.4757 8.4415C10.234 8.19984 10.234 7.79984 10.4757 7.55817C10.7173 7.3165 11.1173 7.3165 11.359 7.55817L13.859 10.0582C14.1007 10.2998 14.1007 10.6998 13.859 10.9415L11.359 13.4415C11.1173 13.6832 10.7173 13.6832 10.4757 13.4415Z"
                fill="white"
              />
            </svg>
          </button>
          <h2 className="text-[24px] md:text-3xl font-[600] text-white tracking-tight">
            Complete Your Enrollment
          </h2>
          <p className="text-[14px] text-white/80">
            Please confirm a few details before checkout
          </p>
        </div>

        <div
          className="mt-8 max-h-[360px] overflow-y-auto border border-white/20 rounded-lg py-4 px-6 bg-white/5 terms-scrollbar overscroll-contain"
        >
          <p className="text-[24px] font-[600] mb-6">Terms & Agreements</p>
          <p className="text-[16px] font-[500] leading-relaxed mb-4">
            1. Introduction
          </p>
          <p className="text-[14px] leading-relaxed mb-6">
            These Terms and Agreements govern the services provided by Skarion
            LLC, a company specializing in Outside Plant (OSP) Engineering
            training and job placement services. By accessing or using our
            services, you agree to be bound by the terms of this agreement.
          </p>
          <p className="text-[16px] font-[500] leading-relaxed mb-4">
            2. Services Provided
          </p>
          <p className="text-[14px] leading-relaxed mb-2">
            Skarion provides the following services to the Candidate:
          </p>
          <ul className="list-disc text-[14px] leading-relaxed mb-6 pl-3">
            <li className="mb-2">
              Training: Skarion offers training in Outside Plant (OSP)
              Engineering, AutoCAD, GIS, and other technical skills, which
              include practice projects.
            </li>
            <li className="mb-2">
              Resume Review: Tailored resume building and optimization to meet
              job market demands in the OSP field.
            </li>
            <li className="mb-2">
              Job Placement Support: Personalized support for job placement,
              including interview preparation and application management.
            </li>
            <li className="mb-2">
              Job Application Management: Skarion manages the Candidate's job
              applications on platforms such as LinkedIn, Indeed, Glassdoor,
              etc., for job placement assistance.
            </li>
          </ul>
          <p className="text-[16px] font-[500] leading-relaxed mb-4">
            3. Payment Terms
          </p>
          <ul className="list-disc text-[14px] leading-relaxed mb-6 pl-3">
            <li className="mb-2">
              Total Fee: The Candidate agrees to pay $6,000 USD as a
              commission for job placement services.
            </li>
            <li className="mb-2">
              Deposit: The Candidate is required to pay a refundable deposit of
              $500 USD upon enrollment in the program. This deposit will be
              credited towards the total program cost.
            </li>
            <li className="mb-2">
              Balance Due: The remaining balance is due only when the Candidate
              secures employment with the assistance of Skarion job placement
              services.
            </li>
            <li className="mb-2">
              Failure to Pay: If the Candidate fails to remit the balance within
              90 days of accepting a qualifying job offer, Skarion reserves the
              right to pursue legal action to recover the balance, along with
              collection costs and reasonable attorney’s fees.
            </li>
          </ul>
          <p className="text-[16px] font-[500] leading-relaxed mb-4">
            4. Candidate Commitments
          </p>
          <p className="text-[14px] leading-relaxed mb-2">
            The Candidate agrees to:
          </p>
          <ul className="list-disc text-[14px] leading-relaxed mb-6 pl-3">
            <li className="mb-2">
              Completion of Training: Complete all required training modules,
              practice projects, and assessments on time, with a minimum of 100%
              accuracy on all assessments.
            </li>
            <li className="mb-2">
              Active Participation: Respond promptly to Skarion's job search
              communications, including job applications, interviews, and
              follow-up requests.
            </li>
            <li className="mb-2">
              Notice of Job Placement: The Candidate agrees not to pursue any
              job opportunities in the OSP field independently, outside of the
              job placement services provided by SKARION, without first
              notifying SKARION and receiving written consent. This includes
              refraining from accepting job offers in the OSP sector during or
              immediately after completing the program.
            </li>
            <li className="mb-2">
              Non-Compliance: Failure to comply with these obligations will
              result in material breach, and Skarion may terminate the
              agreement. Any payments made, including the deposit, will be
              forfeited.
            </li>
          </ul>
          <p className="text-[16px] font-[500] leading-relaxed mb-4">
            5. Job Placement and Refund Policy
          </p>
          <ul className="list-disc text-[14px] leading-relaxed mb-6 pl-3">
            <li className="mb-2">
              120-Day Guarantee: If the Candidate does not secure a job within
              120 days of program completion and is willing to relocate, Skarion
              will refund the $500 deposit.
            </li>
            <li className="mb-2">
              Refund Requirements: Refund eligibility is subject to the
              following conditions:
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Completion of all program requirements.</li>
                <li>Active engagement in job placement activities.</li>
                <li>
                  Providing Skarion with complete access to their LinkedIn,
                  Indeed, Glassdoor, and similar platforms for job hunting.
                </li>
                <li>Timely and professional responses to job opportunities.</li>
                <li>Willingness to relocate for job placement.</li>
              </ul>
            </li>
            <li className="mb-2">
              Exclusions: Refunds will not be issued if the Candidate rejects
              suitable job offers, fails to attend interviews, or obstructs the
              placement process.
            </li>
          </ul>
          <p className="text-[16px] font-[500] leading-relaxed mb-4">
            6. Protection of Services and Intellectual Property
          </p>
          <ul className="list-disc text-[14px] leading-relaxed mb-6 pl-3">
            <li className="mb-2">
              Intellectual Property: All training materials, methodologies,
              proprietary tools, and resources provided by Skarion remain the
              exclusive property of Skarion. The Candidate may not copy,
              distribute, or use these materials outside the scope of this
              program.
            </li>
            <li className="mb-2">
              Non-Disclosure: The Candidate agrees not to disclose, share, or
              sell any of Skarion training materials, resources, methodologies,
              or proprietary tools to any third party without prior written
              consent from Skarion. This includes the obligation not to leak,
              distribute, or sell any program-related materials after the
              Candidate has completed the program.
            </li>
          </ul>
          <p className="text-[16px] font-[500] leading-relaxed mb-4">
            7. Confidentiality
          </p>
          <p className="text-[14px] leading-relaxed mb-6">
            The Candidate acknowledges that all information, including but not
            limited to Skarion training materials, methodologies, business
            practices, trade secrets, and other proprietary documents, is
            confidential and must not be disclosed, shared, or communicated to
            any third party without Skarion prior written consent. This
            confidentiality obligation is perpetual and shall survive
            indefinitely beyond the termination or expiration of this agreement.
          </p>
          <p className="text-[16px] font-[500] leading-relaxed mb-4">
            8. Termination
          </p>
          <p className="text-[14px] leading-relaxed mb-2">
            This Agreement may be terminated under the following conditions:
          </p>
          <ul className="list-disc text-[14px] leading-relaxed mb-6 pl-3">
            <li className="mb-2">
              Candidate’s Default: Non-completion of program requirements, lack
              of engagement in job placement, unprofessional behavior, or
              failure to comply with the notice of job placement requirements.
              In such cases, the deposit will be forfeited.
            </li>
            <li className="mb-2">
              Provider’s Default: If Skarion fails to meet its obligations, the
              Candidate may terminate the agreement and request a refund of the
              $500 deposit.
            </li>
          </ul>
          <p className="text-[16px] font-[500] leading-relaxed mb-4">
            9. Dispute Resolution
          </p>
          <ul className="list-disc text-[14px] leading-relaxed mb-6 pl-3">
            <li className="mb-2">
              Mediation First: Both parties agree to attempt a good-faith
              resolution through mediation.
            </li>
            <li className="mb-2">
              Binding Arbitration: If mediation fails, disputes will be resolved
              by binding arbitration in Fairfax County, Virginia, in accordance
              with the rules of the American Arbitration Association (AAA).
            </li>
            <li className="mb-2">
              Legal Costs: The prevailing party in the dispute will be entitled
              to recover attorney's fees and costs.
            </li>
          </ul>
          <p className="text-[16px] font-[500] leading-relaxed mb-4">
            10. Enforceability
          </p>
          <p className="text-[14px] leading-relaxed mb-6">
            This agreement is legally binding under the laws of the Commonwealth
            of Virginia. If any part of this Agreement is found unenforceable,
            the remaining provisions will continue in full force and effect.
          </p>
          <p className="text-[16px] font-[500] leading-relaxed mb-4">
            11. Entire Agreement
          </p>
          <p className="text-[14px] leading-relaxed mb-6">
            This agreement represents the complete understanding between the
            parties. Any modifications must be made in writing and signed by
            both parties.
          </p>
          <p className="text-[16px] font-[500] leading-relaxed mb-4">
            12. Non-Compete and Post-Program Restrictions
          </p>
          <ul className="list-disc text-[14px] leading-relaxed mb-6 pl-3">
            <li className="mb-2">
              Non-Compete Clause: For a period of 12 months following the
              completion of the program, the Candidate agrees not to engage in
              any professional activities related to OSP engineering, job
              placement, or similar services without Skarion written consent.
              This includes working independently or with another firm in the
              OSP sector, or attempting to directly solicit employers that
              Skarion has connected the Candidate with during the job placement
              process.
            </li>
            <li className="mb-2">
              Misuse of Program Services: Any candidate who attempts to
              independently pursue job offers in the OSP field during or after
              the program without notifying Skarion, or who attempts to use
              Skarion services to apply for jobs outside the agreed-upon
              platform, will be considered in breach of contract, and will
              forfeit their deposit and be liable for damages. This includes
              sharing or distributing training materials without prior written
              consent from Skarion.
            </li>
          </ul>
          <div className="space-y-6 py-4">
            <FormCheckbox
              id="agreed-to-terms"
              checked={agreedToTerms}
              onCheckedChange={setAgreedToTerms}
            >
              I, {user?.name}, have read and agree to the Terms and Agreeements.
            </FormCheckbox>
          </div>
        </div>
      </div>
      <div>
        <Button
          type="submit"
          disabled={!isFormValid || isPurchased || !courseFound}
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPurchased ? "Already Purchased" : "Checkout with Stripe"}
        </Button>
      </div>
    </form>
  );
}
