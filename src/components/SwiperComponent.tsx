"use client";
import Image from "next/image";
import { FC } from "react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface SlideItem {
  src: string;
  title?: string;
  details?: string;
}
interface SwiperComponentProps {
  images: (SlideItem | string)[];
}

const SwiperComponent: FC<SwiperComponentProps> = ({ images }) => {
  const slides: SlideItem[] = (images ?? [])
    .map((item) =>
      typeof item === "string"
        ? { src: item }
        : { src: item?.src ?? "", title: item?.title, details: item?.details },
    )
    .filter((s) => !!s.src);

  return (
    <>
      <div className="swiper-container relative w-full h-full rounded-[14px]">
        <Swiper
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={1}
          spaceBetween={16}
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
          loop={true}
          modules={[EffectCoverflow, Pagination, Autoplay]}
          className="mySwiper w-full h-full rounded-[14px]"
        >
          {slides.map((image, index) => (
            <SwiperSlide key={index} className="h-full px-2">
              <div className="relative w-full h-full min-h-[300px] rounded-[14px] overflow-hidden">
                <Image
                  src={image.src}
                  alt={`Slide ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent rounded-[14px] pointer-events-none z-10" />
                <div className="absolute bottom-5 left-1 right-0 p-6 text-white z-20">
                  <p className="text-[#ffffff] text-[30px] sm:text-[30px] md:text-[48px] lg:text-[52px] font-[600] leading-[1.2] z-10">
                    {image.title}
                  </p>
                  <span className="relative top-3 text-[14px] md:text-[16px] opacity-90">
                    {image.details}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
};

export default SwiperComponent;
