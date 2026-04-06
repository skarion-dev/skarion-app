"use client";
import { motion } from "framer-motion";

const Card = () => {
  return (
    <motion.div
      whileHover="hover"
      transition={{
        duration: 1,
        ease: "backInOut",
      }}
      variants={{
        hover: {
          scale: 1.05,
        },
      }}
      className="w-full h-full relative shrink-0 overflow-hidden rounded-xl bg-indigo-500 py-[5px] px-[18px]"
    >
      <div className="relative flex flex-col justify-between z-10 text-white">
        <motion.span
          initial={{ scale: 0.85 }}
          variants={{
            hover: {
              scale: 1,
            },
          }}
          transition={{
            duration: 1,
            ease: "backInOut",
          }}
          className="block origin-top-left text-[#ffffff] text-[72px] font-[600] leading-[1.1]"
        >
          50+
        </motion.span>
        <p className="text-[#ffffff] text-[14px] font-[500] leading-[1.3]">
          Candidates Have Trusted Skarion to Launch Their Careers
        </p>
      </div>
      <Background />
    </motion.div>
  );
};

const Background = () => {
  return (
    <motion.svg
      width="320"
      height="384"
      viewBox="0 0 170 384"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 z-0"
      variants={{
        hover: {
          scale: 3,
        },
      }}
      transition={{
        duration: 1,
        ease: "backInOut",
      }}
    >
      <motion.circle
        variants={{
          hover: {
            scaleY: 0.5,
            y: 25,
          },
        }}
        transition={{
          duration: 1,
          ease: "backInOut",
          delay: 0.2,
        }}
        cx="160.5"
        cy="114.5"
        r="101.5"
        fill="#122461"
      />
    </motion.svg>
  );
};

export default Card;
