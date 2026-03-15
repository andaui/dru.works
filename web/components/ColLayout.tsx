interface Column {
  title: string;
  items: string[];
}

interface ColLayoutProps {
  columns: Column[];
}

export default function ColLayout({ columns }: ColLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row gap-[48px] items-start">
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-[10px] items-start justify-center max-w-[600px] w-full md:w-auto">
          <p className="font-normal leading-[19px] not-italic text-foreground text-[13px]">
            {column.title}
          </p>
          <div className="flex flex-col gap-[4px] items-start leading-[19px] text-[#5d5d5d] dark:text-[#a3a3a3] text-[13px]">
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

