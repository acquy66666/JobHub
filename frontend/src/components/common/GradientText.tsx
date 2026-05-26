interface Props {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function GradientText({ children, className = "", as: Tag = "span" }: Props) {
  return (
    <Tag className={`gradient-text ${className}`}>{children}</Tag>
  );
}
