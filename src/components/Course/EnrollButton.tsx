"use client";
import { useRouter } from "next/navigation";

export default function EnrollButton({
  isPurchased,
}: {
  isPurchased: boolean;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPurchased}
      className={`mt-8 w-full flex items-center justify-center gap-4 py-2.5 px-6 text-[14px] font-medium tracking-wide text-slate-900 border border-slate-300 rounded-md bg-slate-50 
        ${isPurchased ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-100 cursor-pointer"}
      `}
      onClick={() => {
        if (!isPurchased)
          router.push(
            "https://outlook.office.com/book/SkarionConsultationCall@inuberry.com/?ismsaljsauthenabled",
          );
      }}
    >
      {isPurchased ? "Meeting Scheduled" : "Schedule Enrollment Meeting"}
    </button>
  );
}
