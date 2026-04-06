import Link from "next/link";
export default function YouTubeIcon() {
  return (
    <Link
      href="https://www.youtube.com/@SkarionYouTube"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-white/40 text-white/80 hover:bg-white/10 transition-colors"
    >
      <svg
        className="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M21.582 7.025c-.23-.808-.857-1.435-1.665-1.665C18.743 5 12 5 12 5s-6.743 0-7.917.36c-.808.23-1.435.857-1.665 1.665C2 8.257 2 12 2 12s0 3.743.36 4.917c.23.808.857 1.435 1.665 1.665C5.257 19 12 19 12 19s6.743 0 7.917-.36c.808-.23 1.435-.857 1.665-1.665C22 15.743 22 12 22 12s0-3.743-.36-4.917zM9.75 15.5V8.5l6.5 3.5-6.5 3.5z" />
      </svg>
    </Link>
  );
}
