import Link from "next/link";

interface HeaderProps {
  currentPage?: "work" | "about" | "services" | "intro";
}

export default function Header({ currentPage = "work" }: HeaderProps) {
  return (
    <nav className="w-full flex justify-start md:justify-center items-center gap-[18px] text-[13px] leading-[19px] not-italic font-inter pt-[24px] pb-[24px] px-[2.5%] lg:px-0">
      <Link href="/" className={`relative shrink-0 z-50 pointer-events-auto ${currentPage === "work" ? "text-black" : "text-[#989898]"}`}>
        Work
      </Link>
      <Link href="/about" className={`relative shrink-0 z-50 pointer-events-auto ${currentPage === "about" ? "text-black" : "text-[#989898]"}`}>
        About
      </Link>
      <Link href="/services" className={`relative shrink-0 z-50 pointer-events-auto ${currentPage === "services" ? "text-black" : "text-[#989898]"}`}>
        Services & Sessions
      </Link>
      <Link href="#" className={`relative shrink-0 z-50 pointer-events-auto ${currentPage === "intro" ? "text-black" : "text-[#989898]"}`}>
        Intro call
      </Link>
    </nav>
  );
}

