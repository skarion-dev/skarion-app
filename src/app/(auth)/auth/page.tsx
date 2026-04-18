"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignInForm } from "@/components/sign-in-form";
import { SignUpForm } from "@/components/sign-up-form";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperComponent from "@/components/SwiperComponent";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const swiperImages = [
    {
        src: "/checkout1.png",
        title: "Pay-When-Hired Model",
        details: "Zero upfront risk. Join now and pay only after you land a job.",
    },
    {
        src: "/post placement.jpg",
        title: "End-to-End Placement",
        details: "From resume to interview, We handle every step of your job journey.",
    },
    {
        src: "/globe to us.jpg",
        title: "Global-to-U.S.A Visa Support",
        details: "Get career-ready with pathaways tailored for OPT, CPT, and H-18 success.",
    },
    {
        src: "/end to end.jpg",
        title: "Post-Placement Career Support",
        details: "Enjoy ongoing career support even after securing your job, from salary negotiation to job advancement.",
    },
];

function AuthContent() {
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode");
    const [formSwiper, setFormSwiper] = useState<any>(null);

    // Determine initial slide based on mode
    const initialSlide = mode === "signup" ? 1 : 0;

    useEffect(() => {
        if (formSwiper) {
            if (mode === "signup") {
                formSwiper.slideTo(1);
            } else if (mode === "signin") {
                formSwiper.slideTo(0);
            }
        }
    }, [mode, formSwiper]);

    return (
        <div className="grid h-svh lg:grid-cols-2 overflow-hidden relative">
            {/* Logo - Positioned Absolute for consistent placement across panels */}
            <div className="absolute top-0 left-0 p-8 lg:p-12 z-50">
                <Link href="/" className="inline-block">
                    <Image
                        src="/skarion.png"
                        alt="Skarion Logo"
                        width={64}
                        height={64}
                        className="w-16 h-16"
                    />
                </Link>
            </div>

            {/* Left side: Form */}
            <div className="flex flex-col h-full bg-white overflow-y-auto">
                <div className="flex-1 flex items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-[480px] mt-40 relative">
                        <Swiper
                            onSwiper={setFormSwiper}
                            initialSlide={initialSlide}
                            centeredSlides
                            allowTouchMove={false}
                            slidesPerView={1}
                            spaceBetween={100}
                            speed={600}
                            className="w-full"
                        >
                            <SwiperSlide>
                                <SignInForm onSwitch={() => formSwiper?.slideTo(1)} />
                            </SwiperSlide>
                            <SwiperSlide>
                                <SignUpForm onSwitch={() => formSwiper?.slideTo(0)} />
                            </SwiperSlide>
                        </Swiper>
                    </div>
                </div>
            </div>

            {/* Right side: Swiper Component */}
            <div className="relative hidden bg-muted lg:block">
                <div className="h-full w-full scale-103">
                    <Swiper
                        grabCursor
                        centeredSlides
                        slidesPerView={1}
                        spaceBetween={0}
                        coverflowEffect={{
                            rotate: 50,
                            stretch: 0,
                            depth: 150,
                            modifier: 1,
                            slideShadows: false,
                        }}
                        autoplay={{
                            delay: 2500,
                            disableOnInteraction: true,
                        }}
                        loop
                        modules={[EffectCoverflow, Pagination, Autoplay]}
                        className="mySwiper w-full h-full rounded-[14px]"
                    >
                        {swiperImages.map((image, index) => (
                            <SwiperSlide key={index} className="h-full px-2">
                                <div className="relative w-full h-full min-h-[300px] rounded-[14px] overflow-hidden">
                                    <Image
                                        src={image.src}
                                        alt={`Slide ${index + 1}`}
                                        fill
                                        sizes="100vw"
                                        className="object-cover z-0"
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div className="flex h-svh items-center justify-center">Loading...</div>}>
            <AuthContent />
        </Suspense>
    );
}
