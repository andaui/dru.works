interface ListTitleProps {
  title: string;
}

export default function ListTitle({ title }: ListTitleProps) {
  return (
    <p className="font-normal leading-[19px] not-italic text-foreground text-[13px] text-nowrap">
      {title}
    </p>
  );
}

