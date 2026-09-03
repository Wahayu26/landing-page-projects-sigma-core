import type { ReactNode } from 'react';

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  light?: boolean;
  rowClassName?: string;
  id?: string;
};

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  light = false,
  rowClassName = 'mb-16',
  id,
}) => {
  const headingBlock = (
    <div>
      <p
        className={`eyebrow${light ? ' light' : ''}`}
      >
        <span
          aria-hidden='true'
        />
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`section-title${light ? ' light-title' : ''}`}
      >
        {title}
      </h2>
    </div>
  );

  if (!description) return headingBlock;

  return (
    <div
      className={`section-heading-row ${rowClassName}`}
    >
      {headingBlock}
      <p>
        {description}
      </p>
    </div>
  );
};
