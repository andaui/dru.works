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
    type?: 'image' | 'video';
    image?: {
      asset?: {
        url?: string;
        _id?: string;
        metadata?: {
          dimensions?: {
            width?: number;
            height?: number;
          };
        };
      };
      alt?: string;
    };
    video?: {
      asset?: {
        url?: string;
        _id?: string;
        mimeType?: string;
        metadata?: {
          dimensions?: {
            width?: number;
            height?: number;
          };
        };
      };
    };
    text?: string;
  };
}

export default function Section({ sectionTitle, blocks, sectionId, featuredImage }: SectionProps) {
  return (
    <div id={sectionId} className="w-full flex flex-col gap-[24px] items-start">
      <div className="bg-[#eaeaea] flex items-center w-screen -ml-[2.5%] sm:ml-0 sm:w-full py-[3px]">
        <p className="font-normal leading-[20px] not-italic text-[13px] text-black pl-[5%] sm:pl-[24px]">
          {sectionTitle}
        </p>
      </div>
      <div className="flex flex-col gap-[34px] items-start w-full overflow-hidden sm:flex-row sm:items-start">
        {/* Left Column - Blocks */}
        <div className="flex flex-col gap-[34px] items-start flex-1 min-w-0 w-full sm:min-w-[430px]">
          {blocks.map((block) => (
            <Block key={block._key} content={block.content} backgroundColor={block.backgroundColor} maxWidth780={block.maxWidth780} maxWidth980={block.maxWidth980} />
          ))}
        </div>
        {/* Right Column - Featured Media */}
        {featuredImage && (
          <FeaturedImage 
            type={featuredImage.type || 'image'}
            image={featuredImage.image} 
            video={featuredImage.video}
            text={featuredImage.text} 
          />
        )}
      </div>
    </div>
  );
}

