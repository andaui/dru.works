import Block from "./Block";
import FeaturedImage from "./FeaturedImage";

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
  maxWidth780?: boolean;
  maxWidth980?: boolean;
}

interface SectionProps {
  sectionTitle: string;
  blocks: BlockData[];
  sectionId?: string;
  featuredImage?: {
    image?: {
      asset?: {
        url?: string;
        _id?: string;
      };
      alt?: string;
    };
    text?: string;
  };
}

export default function Section({ sectionTitle, blocks, sectionId, featuredImage }: SectionProps) {
  return (
    <div id={sectionId} className="w-full bg-white flex flex-col gap-[24px] items-start">
      <div className="bg-[#eaeaea] flex items-center px-[24px] py-[3px] w-full">
        <p className="font-normal leading-[20px] not-italic text-[13px] text-black">
          {sectionTitle}
        </p>
      </div>
      <div className="flex flex-col gap-[34px] items-start w-full overflow-hidden lg:flex-row lg:items-start">
        {/* Left Column - Blocks */}
        <div className="flex flex-col gap-[34px] items-start flex-1 min-w-0 w-full lg:min-w-[430px]">
          {blocks.map((block) => (
            <Block key={block._key} content={block.content} backgroundColor={block.backgroundColor} maxWidth780={block.maxWidth780} maxWidth980={block.maxWidth980} />
          ))}
        </div>
        {/* Right Column - Featured Image */}
        {featuredImage && (
          <FeaturedImage image={featuredImage.image} text={featuredImage.text} />
        )}
      </div>
    </div>
  );
}

