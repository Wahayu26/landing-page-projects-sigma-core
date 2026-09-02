export const RichContent = ({ data }: { data: unknown | null }) => {
  if (!data) return null;
  return <div className="rich-content" />;
};