import MainTitle from "./MainTitle";
import Text from "./Text";
import Price2Col from "./Price2Col";
import ListTitle from "./ListTitle";
import ListItems from "./ListItems";
import ColLayout from "./ColLayout";
import Link from "./Link";
import SectionLink from "./SectionLink";
import Clients from "./Clients";
import Video from "./Video";

interface BlockContent {
  _type: string;
  _key: string;
  // MainTitle
  title?: string;
  // Text
  text?: string;
  // Price2Col
  items?: Array<{ label: string; price: string }>;
  // ListTitle (uses title field)
  listTitle?: string;
      // ListItems (uses items field, but as string array)
      listItems?: string[];
      showBullets?: boolean;
  // ColLayout
  columns?: Array<{ title: string; items: string[] }>;
  // Link (uses text and url fields)
  linkText?: string;
  url?: string;
  // SectionLink (uses text and url fields)
  sectionLinkText?: string;
  sectionLinkUrl?: string;
  // Clients
  logos?: Array<{
    _key: string;
    logo: {
      asset: {
        url: string;
      };
      alt?: string;
    };
    companyName?: string;
  }>;
  // Video
  videoFile?: {
    asset?: {
      url?: string;
      _id?: string;
    };
  };
  alt?: string;
}

interface BlockProps {
  content: BlockContent[];
  backgroundColor?: string;
  maxWidth780?: boolean;
  maxWidth980?: boolean;
}

export default function Block({ content, backgroundColor, maxWidth780 = false, maxWidth980 = false }: BlockProps) {
  const renderComponent = (item: BlockContent) => {
    switch (item._type) {
      case "mainTitle":
        return item.title ? <MainTitle key={item._key} title={item.title} /> : null;
      case "textContent":
        return item.text ? <Text key={item._key} text={item.text} /> : null;
      case "price2Col":
        // For price2Col, items is an array of objects with label and price
        const priceItems = item.items && Array.isArray(item.items) && item.items.length > 0 && typeof item.items[0] === 'object' && 'label' in item.items[0]
          ? item.items as Array<{ label: string; price: string }>
          : undefined;
        return priceItems ? <Price2Col key={item._key} items={priceItems} /> : null;
      case "listTitle":
        return item.title ? <ListTitle key={item._key} title={item.title} /> : null;
      case "listItems":
        // For listItems, items is an array of strings, not objects
        const listItemsArray = item.items && Array.isArray(item.items) && item.items.length > 0 && typeof item.items[0] === 'string' 
          ? (item.items as unknown as string[])
          : undefined;
        return listItemsArray ? (
          <ListItems key={item._key} items={listItemsArray} showBullets={item.showBullets} />
        ) : null;
      case "colLayout":
        return item.columns ? <ColLayout key={item._key} columns={item.columns} /> : null;
      case "link":
        return item.text ? (
          <Link key={item._key} text={item.text} url={item.url} />
        ) : null;
      case "sectionLink":
        return item.text ? (
          <SectionLink key={item._key} text={item.text} url={item.url} />
        ) : null;
      case "clients":
        return item.logos ? (
          <Clients key={item._key} logos={item.logos} maxWidth980={maxWidth980} />
        ) : null;
      case "video":
        return item.videoFile ? (
          <Video key={item._key} videoFile={item.videoFile} alt={item.alt} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex flex-col items-start w-full ${backgroundColor ? `bg-[${backgroundColor}]` : ""}`}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <div className={`flex flex-col gap-[16px] items-start justify-center ${maxWidth980 ? 'max-w-[980px]' : maxWidth780 ? 'max-w-[780px]' : 'max-w-[600px]'} px-[2.5%] sm:px-[24px] py-0 w-full`}>
        {content.map((item) => renderComponent(item))}
      </div>
    </div>
  );
}

