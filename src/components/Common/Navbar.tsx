"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import NavbarCards from "../NavbarCards";

export default function Header({ user }: { user?: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleChangeMenu = (name: string) => {
    setSelectedMenu(name);
    setIsMenuOpen(true);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="sticky top-0 lg:top-4 z-30">
      <div className="relative" onMouseLeave={() => setIsMenuOpen(false)}>
        <div className="lg:max-w-[1400px] lg:mx-auto lg:px-4">
          <div className="flex justify-between lg:mt-4 mt-0 mx-0 h-[70px] bg-[#FFFFFF] lg:rounded-[12px] border border-[#EBEBEB] px-6">
            <div className="flex items-center h-full gap-12">
              <div className="" onMouseEnter={() => setIsMenuOpen(false)}>
                <Link href="/">
                  <Image src="/logo.svg" alt="logo" width={40} height={40} />
                </Link>
              </div>
              <div className="hidden lg:flex gap-6">
                <div
                  onMouseEnter={() => handleChangeMenu("programs")}
                  className="flex gap-2 cursor-pointer"
                >
                  <p className="text-[14px] text-[#191F38] font-medium">
                    Programs
                  </p>
                  <svg
                    className="my-auto"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.5 6L8 9.5L11.5 6"
                      stroke="#191F38"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                {/* <div
                className="flex gap-2 cursor-pointer"
                onMouseEnter={() => handleChangeMenu("company")}
              >
                <p className="text-[14px] text-[#191F38] font-medium">
                  Company
                </p>
                <svg
                  className="my-auto"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.5 6L8 9.5L11.5 6"
                    stroke="#191F38"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div
                className="flex gap-2 cursor-pointer"
                onMouseEnter={() => setIsMenuOpen(false)}
              >
                <Link href={"/"}>
                  <p className="text-[14px] text-[#191F38] font-medium">
                    Success Stories
                  </p>
                </Link>
              </div> */}
                <div
                  className="flex gap-2 cursor-pointer"
                  onMouseEnter={() => setIsMenuOpen(false)}
                >
                  <Link
                    href="https://outlook.office.com/book/SkarionConsultationCall@inuberry.com/?ismsaljsauthenabled"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] text-[#191F38] font-medium"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
            <div
              className="hidden lg:flex items-center h-full gap-4"
              onMouseEnter={() => setIsMenuOpen(false)}
            >
              {user ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-semibold">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* <DropdownMenuGroup> */}
                    {/* <DropdownMenuItem>
                        <BadgeCheck />
                        Dashboard
                      </DropdownMenuItem> */}
                    {/* <DropdownMenuItem>
                        <CreditCard />
                        Billing
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bell />
                        Notifications
                      </DropdownMenuItem> */}
                    {/* </DropdownMenuGroup>
                    <DropdownMenuSeparator /> */}
                    <DropdownMenuItem onClick={() => signOut()}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href={`/auth`}>
                    <div className="bg-[#191F38] border border-[#EBEBEB] rounded-[12px] px-4 py-2 text-center cursor-pointer">
                      <p className="text-[14px] text-white font-semibold">
                        Login
                      </p>
                    </div>
                  </Link>
                  <Link href={`/auth`}>
                    <div className="bg-white border border-[#EBEBEB] rounded-[12px] px-4 py-2 text-center cursor-pointer">
                      <p className="text-[14px] text-[#191F38] font-semibold">
                        Sign up
                      </p>
                    </div>
                  </Link>
                </>
              )}
            </div>

            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {!isMobileMenuOpen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 12H21"
                      stroke="#191F38"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 6H21"
                      stroke="#191F38"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 18H21"
                      stroke="#191F38"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18"
                      stroke="#191F38"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 6L18 18"
                      stroke="#191F38"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden absolute left-0 right-0 bg-white border-b border-[#EBEBEB] shadow-lg lg:mx-2 mx-0 p-4">
              <div className="flex flex-col space-y-4">
                <div
                  onClick={() => handleChangeMenu("programs")}
                  className="flex justify-between items-center cursor-pointer p-2"
                >
                  <p className="text-[16px] text-[#191F38] font-normal">
                    Programs
                  </p>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4.5 6L8 9.5L11.5 6"
                      stroke="#191F38"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                {/* <div
                  onClick={() => handleChangeMenu("company")}
                  className="flex justify-between items-center cursor-pointer p-2"
                >
                  <p className="text-[16px] text-[#191F38] font-normal">
                    Company
                  </p>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4.5 6L8 9.5L11.5 6"
                      stroke="#191F38"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <Link
                  href="/"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2"
                >
                  <p className="text-[16px] text-[#191F38] font-normal">
                    Success Stories
                  </p>
                </Link> */}
                <div className="pt-4 border-t border-[#EBEBEB] space-y-4">
                  <Link
                    href="https://outlook.office.com/book/SkarionConsultationCall@inuberry.com/?ismsaljsauthenabled"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                    }}
                    className="block"
                  >
                    <div className="bg-[#F8FAFC] border border-[#bab9b9] rounded-[12px] px-4 py-2 text-center">
                      <p className="text-[16px] text-[#191F38] font-normal">
                        Contact Us
                      </p>
                    </div>
                  </Link>
                  {user ? (
                    <div className="flex items-center gap-3 rounded-lg mt-2">
                      <Avatar>
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{user.name}</span>
                        <span className="text-xs text-gray-500">
                          {user.email}
                        </span>
                      </div>
                      <button
                        onClick={() => signOut()}
                        className="ml-auto text-sm font-medium"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Link href={`/auth/sign-in`} className="flex-1">
                        <div className="bg-[#191F38] border border-[#EBEBEB] rounded-[12px] px-4 py-2 text-center">
                          <p className="text-[16px] text-white font-semibold">
                            Login
                          </p>
                        </div>
                      </Link>
                      <Link href={`/auth/sign-up`} className="flex-1">
                        <div className="bg-[#191F38] rounded-[12px] px-4 py-2 text-center">
                          <p className="text-[16px] text-white font-semibold">
                            Sign up
                          </p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {isMenuOpen && (
          <div
            ref={dropdownRef}
            className="absolute left-1/2 transform -translate-x-1/2 lg:max-w-[1400px] lg:mx-auto lg:px-4 w-full mx-0 -mt-1 lg:pt-4 pt-0 z-50"
          >
            <div className="bg-[#FFFFFF] rounded-[12px] border border-[#EBEBEB] shadow-[0_8px_30px_0_rgba(0,0,0,0.12)] p-4">
              <div className="overflow-y-auto max-h-[65vh] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedMenu === "programs" && (
                  <div className="p-4 col-span-1 md:col-span-2 lg:col-span-3">
                    <NavbarCards />
                    {/* <div className='mt-8 md:mt-10 lg:mt-12 border-t border-black/20' />
                                <div className="mt-auto pt-5 flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center text-[#4B5563] text-[11px] sm:text-[12px] md:text-[14px]">
                                    <Link href="/">See All Programs</Link>
                                </div>                                 */}
                  </div>
                )}
                {selectedMenu === "company" && (
                  <div className="p-4 col-span-1 md:col-span-2 lg:col-span-3">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
                      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="flex flex-col">
                          {/* <p className="text-[12px] sm:text-[14px] md:text-[16px] text-[#191F38] font-[500] mb-1 md:mb-1.5">
                            About
                          </p>
                          <div className="space-y-1 md:space-y-2 bg-[#ffffff]">
                            <Link
                              href="/About"
                              className="inline-block rounded  py-1 text-[11px] sm:text-[12px] md:text-[14px] text-[#191F38] hover:text-[#4B5563]"
                            >
                              About Skarion
                            </Link>
                          </div> */}
                          <div className="space-y-1 md:space-y-2 bg-[#ffffff]">
                            <Link
                              href="#"
                              className="inline-block rounded  py-1 text-[11px] sm:text-[12px] md:text-[14px] text-[#191F38] hover:text-[#4B5563]"
                            >
                              Student Journey
                            </Link>
                          </div>
                          <div className="space-y-1 md:space-y-2 bg-[#ffffff]">
                            <Link
                              href="https://outlook.office.com/book/SkarionConsultationCall@inuberry.com/?ismsaljsauthenabled"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block rounded py-1 text-[14px] sm:text-[15px] md:text-[16px] text-[#191F38] hover:text-[#4B5563]"
                            >
                              Contact Us
                            </Link>
                          </div>
                          <p className="mt-3 md:mt-4 text-[12px] sm:text-[14px] md:text-[16px] text-[#191F38] font-[500] mb-1 md:mb-1.5">
                            Resources
                          </p>
                          <div className="space-y-1 md:space-y-2 bg-[#ffffff]">
                            <Link
                              href="#"
                              className="inline-block rounded py-1 text-[11px] sm:text-[12px] md:text-[14px] text-[#191F38] hover:text-[#4B5563]"
                            >
                              Blogs
                            </Link>
                          </div>
                          <div className="space-y-1 md:space-y-2 bg-[#ffffff]">
                            <Link
                              href="#"
                              className="inline-block rounded py-1 text-[11px] sm:text-[12px] md:text-[14px] text-[#191F38] hover:text-[#4B5563]"
                            >
                              FAQ
                            </Link>
                          </div>
                        </div>
                        <div>
                          <p className="text-[12px] sm:text-[14px] md:text-[16px] text-[#191F38] font-[500] mb-1 md:mb-1.5">
                            Community
                          </p>
                          <div className="space-y-1 md:space-y-2 bg-[#ffffff]">
                            <Link
                              href="#"
                              className="inline-block rounded py-1 text-[11px] sm:text-[12px] md:text-[14px] text-[#191F38] hover:text-[#4B5563]"
                            >
                              Facebook
                            </Link>
                          </div>
                          <div className="space-y-1 md:space-y-2 bg-[#ffffff]">
                            <Link
                              href="#"
                              className="inline-block rounded py-1 text-[11px] sm:text-[12px] md:text-[14px] text-[#191F38] hover:text-[#4B5563]"
                            >
                              Linkedin
                            </Link>
                          </div>
                          <div className="space-y-1 md:space-y-2 bg-[#ffffff]">
                            <Link
                              href="#"
                              className="inline-block rounded py-1 text-[11px] sm:text-[12px] md:text-[14px] text-[#191F38] hover:text-[#4B5563]"
                            >
                              X
                            </Link>
                          </div>
                          <p className="mt-3 md:mt-4 text-[12px] sm:text-[14px] md:text-[16px] text-[#191F38] font-[500] mb-1 md:mb-1.5">
                            Company
                          </p>
                          <div className="space-y-1 md:space-y-2">
                            <Link
                              href="#"
                              className="inline-block rounded py-1 text-[11px] sm:text-[12px] md:text-[14px] text-[#191F38] hover:text-[#4B5563]"
                            >
                              Career
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-span-2 mt-4 md:mt-5">
                        <Image
                          src="/logo.svg"
                          alt="Skarion"
                          width={100}
                          height={64}
                          className="object-contain"
                        />
                        <p className="mt-3 md:mt-6 text-[14px] sm:text-[15px] md:text-[16px] text-[#4B5563] max-w-xs md:max-w-sm">
                          Skarion is a career-focused bootcamp that equips you
                          with job-ready skills and helps you get hired through
                          expert training and personalized support
                        </p>
                      </div>
                    </div>
                    <div className="mt-8 md:mt-10 lg:mt-12 border-t border-black/20" />
                    <div className="mt-auto pt-5 flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center text-[#4B5563] text-[11px] sm:text-[12px] md:text-[14px] gap-2">
                      <span>info@skarion.com</span>
                      <div className="flex flex-wrap gap-15 mt-1 sm:mt-2">
                        <Link href="#" className="hover:text-[#191F38] ">
                          Terms and Conditions
                        </Link>
                        <Link href="#" className="hover:text-[#191F38] ">
                          Privacy Policy
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
