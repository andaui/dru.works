interface Column {
  title: string;
  items: string[];
}

interface ColLayoutProps {
  columns: Column[];
}

export default function ColLayout({ columns }: ColLayoutProps) {
  return (
    <div className="flex gap-[48px] items-start">
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-[10px] items-start justify-center max-w-[600px]">
          <p className="font-normal leading-[19px] not-italic text-[#151515] text-[13px]">
            {column.title}
          </p>
          <div className="flex flex-col gap-[4px] items-start leading-[19px] text-[#5d5d5d] text-[13px] text-nowrap">
            {column.items.map((item, itemIndex) => (
              <p key={itemIndex} className="relative shrink-0">
                {item}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

