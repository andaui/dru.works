interface PriceItem {
  label: string;
  price: string;
}

interface Price2ColProps {
  items: PriceItem[];
}

export default function Price2Col({ items }: Price2ColProps) {
  return (
    <div className="flex gap-[22px] items-start">
      <div className="flex flex-col gap-px items-start leading-[19px] text-[13px] text-nowrap">
        {items.map((item, index) => (
          <p key={index} className="relative shrink-0 text-foreground">
            {item.label}
          </p>
        ))}
      </div>
      <div className="flex flex-col gap-px items-start leading-[19px] text-[13px] text-nowrap w-[67px]">
        {items.map((item, index) => (
          <p key={index} className="relative shrink-0 text-foreground">
            {item.price}
          </p>
        ))}
      </div>
    </div>
  );
}

