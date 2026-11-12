import "server-only";

import sanitizeHtml from "sanitize-html";

const postBodySanitizerOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "a",
    "b",
    "blockquote",
    "br",
    "code",
    "del",
    "em",
    "h1",
    "h2",
    "h3",
    "hr",
    "i",
    "img",
    "li",
    "ol",
    "p",
    "pre",
    "s",
    "span",
    "strike",
    "strong",
    "sub",
    "sup",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "u",
    "ul",
  ],
  allowedAttributes: {
    a: ["href", "rel", "target"],
    img: ["src", "alt", "title"],
    ol: ["start"],
    span: ["style"],
    p: ["style"],
    h1: ["style"],
    h2: ["style"],
    h3: ["style"],
    table: ["style"],
    td: ["colspan", "rowspan", "style"],
    th: ["colspan", "rowspan", "style"],
    tr: ["style"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  allowedStyles: {
    "*": {
      "background-color": [
        /^#[0-9a-f]{3,8}$/i,
        /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i,
      ],
      color: [
        /^#[0-9a-f]{3,8}$/i,
        /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i,
      ],
      "text-align": [/^(left|center|right|justify)$/],
    },
  },
};

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, postBodySanitizerOptions);
}
