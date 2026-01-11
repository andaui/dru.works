import Image from "next/image";

interface ListItemsProps {
  items: string[];
  showBullets?: boolean;
}

export default function ListItems({ items, showBullets = false }: ListItemsProps) {
  if (showBullets) {
    return (
      <div className="flex flex-col gap-[4px] items-start leading-[19px] text-[#5d5d5d] text-[13px] w-full">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-[4px] w-full">
            <Image src="/dot.svg" alt="" width={12} height={12} className="shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[4px] items-start leading-[19px] text-[#5d5d5d] text-[13px] text-nowrap">
      {items.map((item, index) => (
        <p key={index} className="relative shrink-0">
          {item}
        </p>
      ))}
    </div>
  );
}

