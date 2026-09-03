import { createElement, Fragment, type ReactNode } from "react";
import Image from "next/image";
import { cmsAPIBase, cmsMediaURL, safeContentLink } from "@/lib/cms-solutions";

type Node = Record<string, unknown>;
const node = (value: unknown): Node => value && typeof value === "object" ? value as Node : {};

// Render the standard Lexical text blocks without shipping the CMS runtime to the public app.
// React escapes text; CMS HTML, inline styles and arbitrary tag names are never executed.
export function RichContent({ data, mediaAPIBase }: { data: unknown | null; mediaAPIBase?: string }) {
  const root = node(node(data).root);
  if (!Array.isArray(root.children) || root.children.length === 0) return null;

  function render(value: unknown, key: number, depth = 0): ReactNode {
    if (depth > 40) return null;
    const item = node(value);
    const children = Array.isArray(item.children) ? item.children.map((child, index) => render(child, index, depth + 1)) : null;
    if (item.type === "text" && typeof item.text === "string") {
      let result: ReactNode = item.text;
      const format = typeof item.format === "number" ? item.format : 0;
      // Lexical's standard text-format bit flags.
      for (const [flag, tag] of [[1, "strong"], [2, "em"], [4, "s"], [8, "u"], [16, "code"], [32, "sub"], [64, "sup"]] as const) {
        if (format & flag) result = createElement(tag, null, result);
      }
      return <Fragment key={key}>{result}</Fragment>;
    }
    if (item.type === "linebreak") return <br key={key} />;
    if (item.type === "horizontalrule") return <hr key={key} />;
    if (item.type === "upload" && mediaAPIBase) {
      const media = node(item.value);
      const src = cmsMediaURL(media, cmsAPIBase(mediaAPIBase));
      if (!src) return null;
      const alt = typeof media.alt === "string" ? media.alt : "";
      if (typeof media.mimeType === "string" && media.mimeType.startsWith("image/")) {
        return <Image key={key} src={src} alt={alt} unoptimized
          width={typeof media.width === "number" && media.width > 0 ? media.width : 1200}
          height={typeof media.height === "number" && media.height > 0 ? media.height : 800}
          style={{ maxWidth: "100%", height: "auto" }} />;
      }
      return <p key={key}><a href={src}>{alt || "Unduh lampiran"}</a></p>;
    }
    if (item.type === "paragraph") return <p key={key}>{children}</p>;
    if (item.type === "quote") return <blockquote key={key}>{children}</blockquote>;
    if (item.type === "heading") {
      const tag = typeof item.tag === "string" && /^h[2-6]$/.test(item.tag) ? item.tag : "h2";
      return createElement(tag, { key }, children);
    }
    if (item.type === "list") return item.listType === "number"
      ? <ol key={key} start={typeof item.start === "number" ? item.start : undefined}>{children}</ol>
      : <ul key={key}>{children}</ul>;
    if (item.type === "listitem") return <li key={key}>{children}</li>;
    if (item.type === "link" || item.type === "autolink") {
      const fields = node(item.fields);
      const relation = node(fields.doc);
      const related = node(relation.value);
      const collectionPaths: Record<string, string> = { solutions: "solusi", projects: "proyek", insights: "insight" };
      const path = typeof relation.relationTo === "string" ? collectionPaths[relation.relationTo] : undefined;
      const href = safeContentLink(fields.linkType === "internal" && path && typeof related.slug === "string"
        ? `/${path}/${encodeURIComponent(related.slug)}` : fields.url ?? item.url);
      return href ? <a key={key} href={href} target={fields.newTab ? "_blank" : undefined} rel={fields.newTab ? "noopener noreferrer" : undefined}>{children}</a>
        : <Fragment key={key}>{children}</Fragment>;
    }
    return <Fragment key={key}>{children}</Fragment>;
  }
  return <div className="rich-content">{root.children.map((child, index) => render(child, index))}</div>;
}
