import Block from "./Block";

interface BlockContent {
  _type: string;
  _key: string;
  title?: string;
  text?: string;
  items?: Array<{ label: string; price: string }>;
  listTitle?: string;
  listItems?: string[];
  showBullets?: boolean;
  columns?: Array<{ title: string; items: string[] }>;
  linkText?: string;
  linkUrl?: string;
  sectionLinkText?: string;
  sectionLinkUrl?: string;
}

interface BlockData {
  _key: string;
  content: BlockContent[];
  backgroundColor?: string;
}

interface SectionProps {
  sectionTitle: string;
  blocks: BlockData[];
}

export default function Section({ sectionTitle, blocks }: SectionProps) {
  return (
    <div className="w-full bg-white flex flex-col gap-[24px] items-start">
      <div className="bg-[#eaeaea] flex items-center px-[24px] py-[3px] w-full">
        <p className="font-normal leading-[20px] not-italic text-[13px] text-black">
          {sectionTitle}
        </p>
      </div>
      <div className="flex flex-col gap-[34px] items-start w-full">
        {blocks.map((block) => (
          <Block key={block._key} content={block.content} backgroundColor={block.backgroundColor} />
        ))}
      </div>
    </div>
  );
}

