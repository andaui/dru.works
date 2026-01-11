import Image from "next/image";

interface LinkProps {
  text: string;
  url?: string;
}

export default function Link({ text, url }: LinkProps) {
  const content = (
    <div className="flex gap-[4px] items-center max-w-[600px] w-full">
      <p className="font-normal leading-[19px] not-italic text-[#151515] text-[13px] text-nowrap">
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

  return content;
}

