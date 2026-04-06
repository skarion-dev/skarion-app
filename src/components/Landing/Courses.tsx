import CourseCards from "@/components/CourseCards";

export default function Courses() {
  return (
    <div className="w-full bg-[#ffffff] py-5 sm:py-10 sm:px-12 px-6 max-w-[1440px] mx-auto">
      <p className="text-[#000000] text-[40px] sm:text-[64px] leading-[1.2] text-left mb-6 sm:mb-12">
        Our Offered Courses
      </p>
      <CourseCards />
    </div>
  );
}
