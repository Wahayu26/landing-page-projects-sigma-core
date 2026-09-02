type RichContentProps = {
  data: unknown | null;
};

export const RichContent: React.FC<RichContentProps> = ({ data }) => {
  if (!data) return null;
  return <div className="rich-content" />;
};