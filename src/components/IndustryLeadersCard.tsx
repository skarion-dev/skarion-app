"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function IndustryLeadersCard() {
  return (
    <motion.div
      whileHover="hover"
      variants={hoverVariant}
      className="relative bg-[#EBEBEB] border border-[#EBEBEB] rounded-[14px] h-[180px] group mt-8"
    >
      <TeamBackground />
      <div className="absolute bottom-0 bg-[#ffffff] border-2 border-[#EBEBEB] rounded-[14px] h-[150px] z-5 w-full group-hover:border-[#5383EC]">
        <div className="h-12 w-12 border-2 border-[#EBEBEB] rounded-full flex items-center justify-center -mt-6 ml-4 bg-[#ffffff] group-hover:border-[#5383EC]">
          <svg
            width="30"
            height="30"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="1"
              d="M11.2489 2.45031C11.9389 1.86031 13.0689 1.86031 13.7689 2.45031L15.3489 3.81031C15.6489 4.07031 16.2089 4.28031 16.6089 4.28031H18.3089C19.3689 4.28031 20.2389 5.15031 20.2389 6.21031V7.91031C20.2389 8.30031 20.4489 8.87031 20.7089 9.17031L22.0689 10.7503C22.6589 11.4403 22.6589 12.5703 22.0689 13.2703L20.7089 14.8503C20.4489 15.1503 20.2389 15.7103 20.2389 16.1103V17.8103C20.2389 18.8703 19.3689 19.7403 18.3089 19.7403H16.6089C16.2189 19.7403 15.6489 19.9503 15.3489 20.2103L13.7689 21.5703C13.0789 22.1603 11.9489 22.1603 11.2489 21.5703L9.66891 20.2103C9.36891 19.9503 8.80891 19.7403 8.40891 19.7403H6.67891C5.61891 19.7403 4.74891 18.8703 4.74891 17.8103V16.1003C4.74891 15.7103 4.53891 15.1503 4.28891 14.8503L2.93891 13.2603C2.35891 12.5703 2.35891 11.4503 2.93891 10.7603L4.28891 9.17031C4.53891 8.87031 4.74891 8.31031 4.74891 7.92031V6.20031C4.74891 5.14031 5.61891 4.27031 6.67891 4.27031H8.40891C8.79891 4.27031 9.36891 4.06031 9.66891 3.80031L11.2489 2.45031Z"
              fill="#122461"
            />
            <path
              d="M11.2886 15.1703C11.0886 15.1703 10.8986 15.0903 10.7586 14.9503L8.33859 12.5303C8.04859 12.2403 8.04859 11.7603 8.33859 11.4703C8.62859 11.1803 9.10859 11.1803 9.39859 11.4703L11.2886 13.3603L15.5886 9.06027C15.8786 8.77027 16.3586 8.77027 16.6486 9.06027C16.9386 9.35027 16.9386 9.83027 16.6486 10.1203L11.8186 14.9503C11.6786 15.0903 11.4886 15.1703 11.2886 15.1703Z"
              fill="#ffffff"
            />
          </svg>
        </div>
        <div className="px-5 py-2">
          <p className="text-[24px] font-[500]">Lead by Industry Leaders</p>
          <p className="text-[16px] font-[400] mt-[8px]">
            Skarion is a leading provider of AI-driven solutions for business
            transformation.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

const TeamBackground = () => {
  return (
    <motion.div
      className="absolute inset-0 z-0 overflow-visible flex items-center justify-end"
      variants={{
        hover: {
          scale: 1,
        },
      }}
      transition={{
        duration: 1,
        ease: "backInOut",
      }}
    >
      <motion.div
        variants={{
          hover: {
            y: -115,
          },
        }}
        transition={{
          duration: 1,
          ease: "backInOut",
          delay: 0.2,
        }}
      >
        <Image
          src="/leaders.svg"
          alt="leaders"
          width={250}
          height={250}
          className="object-contain"
        />
      </motion.div>
    </motion.div>
  );
};

const hoverVariant = {
  hover: {
    backgroundColor: "#D7E2FB",
  },
};
