import LinkedinIcon from "@/svg/LinkedinIcon";
import FacebookIcon from "@/svg/FacebookIcon";
import InstagramIcon from "@/svg/InstagramIcon";
import Image from "next/image";
import Link from "next/link";
import YouTubeIcon from "@/svg/YouTubeIcon";

export default function Footer() {
  const FooterContent = (
    <>
      <div className="absolute pt-12 px-6 md:px-12 h-full w-full flex flex-col overflow-auto justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 items-start max-w-[1440px] mx-auto w-full">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/skarion.png" alt="Skarion" height={32} width={32} />
              <span className="text-white font-semibold tracking-wide">
                Skarion
              </span>
            </div>
            <p className="text-white/80 leading-relaxed">
              Skarion is a career-focused bootcamp that equips you with
              job-ready skills and helps you get hired through expert training
              and personalized support
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-white/40 text-white/80 hover:bg-white/10 transition-colors">
                <LinkedinIcon />
              </span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-white/40 text-white/80 hover:bg-white/10 transition-colors">
                <YouTubeIcon />
              </span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-white/40 text-white/80 hover:bg-white/10 transition-colors">
                <FacebookIcon />
              </span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-white/40 text-white/80 hover:bg-white/10 transition-colors">
                <InstagramIcon />
              </span>
            </div>
            <p className="text-white/80 text-[14px] mt-8">
              Copyright 2025 © Skarion. All Rights Reserved
            </p>
          </div>
          <div className="text-white sm:ml-16 lg:ml-0"></div>

          <div className="text-white grid grid-cols-2 gap-8 md:gap-12">
            <div>
              <p className="block text-[20px] font-[500] relative group">
                Programs
              </p>
              <Link
                href="/course/outside-plant-engineering"
                className="block text-[14px] hover:text-[#c3ddf5] transition-colors relative group mt-4"
              >
                Outside Plant Engineering
              </Link>
            </div>
            <div>
              <p className="block text-[20px] font-[500] relative group">
                Company
              </p>
              <Link
                href="https://outlook.office.com/book/SkarionConsultationCall@inuberry.com/?ismsaljsauthenabled"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[14px] hover:text-[#c3ddf5] transition-colors relative group mt-4"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="text-white grid grid-cols-2 gap-8 md:gap-12">
            <div>
              <p className="block text-[20px] font-[500] relative group">
                Resources
              </p>
              <Link
                href="/faq"
                className="block text-[14px] hover:text-[#c3ddf5] transition-colors relative group mt-2"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto w-full">
          <div className="border-t border-white/20 mt-10" />
          <div className="flex flex-col text-white/70 text-sm sm:my-10 my-5">
            <div className="flex gap-6 sm:gap-10">
              <Link
                href="/privacy-policy"
                className="relative hover:text-white group"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="relative hover:text-white group"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="bg-[#122461] lg:hidden">
        <div className="pt-12 pb-5 px-6 md:px-12 w-full flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 items-start max-w-[1440px] mx-auto w-full">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/skarion.png"
                  alt="Skarion"
                  height={32}
                  width={32}
                />
                <span className="text-white font-semibold tracking-wide">
                  Skarion
                </span>
              </div>
              <p className="text-white/80 leading-relaxed">
                Skarion is a career-focused bootcamp that equips you with
                job-ready skills and helps you get hired through expert training
                and personalized support
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <LinkedinIcon />
                <YouTubeIcon />
                <FacebookIcon />
                <InstagramIcon />
              </div>
              <p className="text-white/80 text-[14px] mt-8">
                Copyright 2025 © Skarion. All Rights Reserved
              </p>
            </div>

            <div className="text-white sm:ml-16 lg:ml-0"></div>

            <div className="text-white ">
              <div>
                <p className="block text-[20px] font-[500] relative group">
                  Programs
                </p>
                <a
                  href="/course/outside-plant-engineering"
                  className="block text-[14px] hover:text-[#c3ddf5] transition-colors relative group mt-4"
                >
                  Outside Plant Engineering
                </a>
              </div>
            </div>

            <div className="text-white">
              <div>
                <p className="block text-[20px] font-[500] relative group">
                  Company
                </p>
                <a
                  href="/"
                  className="block text-[14px] hover:text-[#c3ddf5] transition-colors relative group mt-4"
                >
                  About Us
                </a>
                <a
                  href="/"
                  className="block text-[14px] hover:text-[#c3ddf5] transition-colors relative group mt-2"
                >
                  Contact Us
                </a>
                <p className="block text-[20px] font-[500] relative group mt-6">
                  Resources
                </p>
                <a
                  href="/"
                  className="block text-[14px] hover:text-[#c3ddf5] transition-colors relative group mt-2"
                >
                  FAQ
                </a>
              </div>
            </div>
          </div>

          <div className="max-w-[1440px] mx-auto w-full">
            <div className="border-t border-white/20 mt-10" />
            <div className="flex flex-col text-white/70 text-sm sm:my-10 my-5">
              <div className="flex gap-6 sm:gap-10">
                <Link
                  href="/privacy-policy"
                  className="relative hover:text-white group"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms-and-conditions"
                  className="relative hover:text-white group"
                >
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="hidden lg:block lg:relative lg:h-[600px]"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <div className="lg:relative lg:h-[calc(100vh+600px)] lg:-top-[100vh]">
          <div className="lg:h-[600px] bg-[#122461] lg:sticky lg:top-[calc(100vh-600px)]">
            {FooterContent}
          </div>
        </div>
      </div>
    </>
  );
}
