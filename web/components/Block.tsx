import MainTitle from "./MainTitle";
import Text from "./Text";
import Price2Col from "./Price2Col";
import ListTitle from "./ListTitle";
import ListItems from "./ListItems";
import ColLayout from "./ColLayout";
import Link from "./Link";
import SectionLink from "./SectionLink";

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
  // ListItems
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
}

interface BlockProps {
  content: BlockContent[];
  backgroundColor?: string;
}

export default function Block({ content, backgroundColor }: BlockProps) {
  const renderComponent = (item: BlockContent) => {
    switch (item._type) {
      case "mainTitle":
        return item.title ? <MainTitle key={item._key} title={item.title} /> : null;
      case "textContent":
        return item.text ? <Text key={item._key} text={item.text} /> : null;
      case "price2Col":
        return item.items ? <Price2Col key={item._key} items={item.items} /> : null;
      case "listTitle":
        return item.title ? <ListTitle key={item._key} title={item.title} /> : null;
      case "listItems":
        return item.listItems ? (
          <ListItems key={item._key} items={item.listItems} showBullets={item.showBullets} />
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
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex flex-col items-start w-full ${backgroundColor ? `bg-[${backgroundColor}]` : ""}`}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <div className="flex flex-col gap-[16px] items-start justify-center max-w-[600px] px-[24px] py-0 w-full">
        {content.map((item) => renderComponent(item))}
      </div>
    </div>
  );
}

