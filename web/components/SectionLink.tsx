import Image from "next/image";

interface SectionLinkProps {
  text: string;
  url?: string;
}

export default function SectionLink({ text, url }: SectionLinkProps) {
  const content = (
    <div className="border border-[rgba(0,0,0,0.1)] border-solid flex gap-[10px] items-center justify-start px-[16px] py-[12px]">
      <p className="font-normal leading-[19px] not-italic text-[#5d5d5d] text-[13px] text-nowrap">
        {text}
      </p>
      <Image src="/link-arrow.svg" alt="" width={14} height={14} className="shrink-0" />
    </div>
  );

  if (url) {
    return (
      <a href={url} className="block">
        {content}
      </a>
    );
  }

  return <div className="flex flex-col items-start justify-center max-w-[600px]">{content}</div>;
}

