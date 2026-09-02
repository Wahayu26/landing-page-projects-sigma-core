import type { ReactNode } from 'react';

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  light?: boolean;
  rowClassName?: string;
};

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  light = false,
  rowClassName = 'mb-16',
}: SectionHeadingProps) => {
  const headingBlock = (
    <div>
      <p
        className={`mb-6 flex items-center gap-3 text-xs font-extrabold tracking-[0.16em] uppercase ${
          light ? 'text-white/68' : 'text-[#42607e]'
        }`}
      >
        <span
          aria-hidden='true'
          className='h-0.5 w-9 bg-linear-to-r from-cyan-400 to-lime-400'
        />
        {eyebrow}
      </p>
      <h2
        className={`font-display m-0 max-w-225 text-[clamp(46px,5vw,76px)] leading-[1.05] font-semibold tracking-[-0.055em] ${
          light ? 'text-white' : ''
        }`}
      >
        {title}
      </h2>
    </div>
  );

  if (!description) return headingBlock;

  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_360px] items-end gap-25 ${rowClassName}`}
    >
      {headingBlock}
      <p className='m-0 mb-2 text-base leading-[1.75] text-[#647386]'>
        {description}
      </p>
    </div>
  );
};
