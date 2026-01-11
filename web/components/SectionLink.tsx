import Image from "next/image";

interface SectionLinkProps {
  text: string;
  url?: string;
}

export default function SectionLink({ text, url }: SectionLinkProps) {
  const content = (
    <div className="border border-[rgba(0,0,0,0.1)] border-solid flex gap-[10px] items-center justify-start px-[16px] py-[12px] w-full">
      <p className="font-normal leading-[19px] not-italic text-[#5d5d5d] text-[13px] flex-1 min-w-0">
        {text}
      </p>
      <Image src="/link-arrow.svg" alt="" width={14} height={14} className="shrink-0" />
    </div>
  );

  if (url) {
    return (
      <a href={url} className="block pt-[8px] -ml-[3px]">
        {content}
      </a>
    );
  }

  return <div className="flex flex-col items-start justify-center max-w-[600px] pt-[8px] -ml-[3px]">{content}</div>;
}

