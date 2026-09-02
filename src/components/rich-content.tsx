import { RichText } from "@payloadcms/richtext-lexical/react";

import type { Insight, Project, Solution } from "@/payload-types";

type RichContentData =
  | Insight["content"]
  | NonNullable<Project["challenge"]>
  | NonNullable<Solution["content"]>;

export function RichContent({ data }: { data: RichContentData | null }) {
  if (!data) return null;
  return <RichText className="rich-content" data={data} />;
}
