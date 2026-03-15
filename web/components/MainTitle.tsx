interface MainTitleProps {
  title: string;
}

export default function MainTitle({ title }: MainTitleProps) {
  return (
    <p className="font-normal leading-[23px] not-italic text-[16px] text-foreground tracking-[-0.16px] w-full">
      {title}
    </p>
  );
}

