interface TextProps {
  text: string;
}

export default function Text({ text }: TextProps) {
  return (
    <p className="font-normal leading-[19px] not-italic text-[#5d5d5d] text-[13px] w-full">
      {text}
    </p>
  );
}

