"use client";

import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorThemeClasses,
  ElementNode,
  type LexicalEditor as LexicalEditorType,
  type NodeKey,
  type SerializedLexicalNode,
  DecoratorNode,
} from "lexical";
import {
  $createCodeNode,
  $isCodeNode,
  CodeHighlightNode,
  CodeNode,
} from "@lexical/code";
import {
  $toggleLink,
  AutoLinkNode,
  createLinkMatcherWithRegExp,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import {
  $createTableNodeWithDimensions,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "@lexical/table";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { FaAlignCenter, FaAlignJustify, FaAlignLeft, FaAlignRight, FaCheck, FaCode, FaTable, FaImage, FaLink, FaRedo, FaUndo } from "react-icons/fa";

type LexicalEditorProps = {
  id?: string;
  name?: string;
  height?: number;
  initialHTML?: string;
  appendHTML?: { id: number; html: string } | null;
  placeholder?: string;
  ariaLabel?: string;
  onChange?: (html: string) => void;
};

type SerializedForumImageNode = SerializedLexicalNode & {
  src: string;
  alt: string;
};

function isSafeImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeLinkUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

class ForumImageNode extends DecoratorNode<ReactNode> {
  __src: string;
  __alt: string;

  static getType(): string {
    return "forum-image";
  }

  static clone(node: ForumImageNode): ForumImageNode {
    return new ForumImageNode(node.__src, node.__alt, node.__key);
  }

  static importJSON(serializedNode: SerializedForumImageNode): ForumImageNode {
    return $createForumImageNode(serializedNode.src, serializedNode.alt);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (element: Node) => {
        if (!(element instanceof HTMLImageElement) || !isSafeImageUrl(element.src)) {
          return null;
        }
        return {
          conversion: () => ({
            node: $createForumImageNode(element.src, element.alt),
          }),
          priority: 1,
        };
      },
    };
  }

  constructor(src: string, alt: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__alt = alt;
  }

  exportJSON(): SerializedForumImageNode {
    return {
      type: "forum-image",
      version: 1,
      src: this.__src,
      alt: this.__alt,
    };
  }

  createDOM(): HTMLElement {
    const figure = document.createElement("figure");
    figure.className = "my-3";
    return figure;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const image = document.createElement("img");
    image.src = this.__src;
    image.alt = this.__alt;
    return { element: image };
  }

  decorate(): ReactNode {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={this.__src}
        alt={this.__alt}
        className="my-3 h-auto max-w-full rounded-sm"
        draggable={false}
      />
    );
  }

  isKeyboardSelectable(): boolean {
    return true;
  }
}

function $createForumImageNode(src: string, alt: string): ForumImageNode {
  return new ForumImageNode(src, alt);
}

const theme: EditorThemeClasses = {
  paragraph: "mb-3 last:mb-0",
  quote: "my-3 border-l-2 border-slate-300 pl-3 text-slate-500",
  code: "my-3 block overflow-x-auto rounded-sm bg-slate-900 p-3 font-mono text-xs leading-5 text-slate-100",
  link: "text-[#286a9b] underline underline-offset-2",
  list: {
    ul: "my-3 list-disc pl-6",
    ol: "my-3 list-decimal pl-6",
    listitem: "my-1",
    checklist: "my-3 list-none pl-2",
    listitemChecked: "my-1 line-through opacity-60",
    listitemUnchecked: "my-1",
    nested: {
      list: "my-1 ml-4",
      listitem: "my-1",
    },
  },
  heading: {
    h1: "mb-3 text-2xl font-semibold",
    h2: "mb-3 text-xl font-semibold",
    h3: "mb-2 text-lg font-semibold",
  },
  table: "my-3 w-full border-collapse text-sm",
  tableCell: "min-w-24 border border-slate-300 px-2 py-1.5 align-top",
  tableCellHeader: "bg-slate-100 font-semibold",
  tableRow: "border-b border-slate-300",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    subscript: "align-sub text-[0.75em]",
    superscript: "align-super text-[0.75em]",
    code: "rounded bg-slate-100 px-1 font-mono text-[0.9em]",
  },
};

function InitialHTMLPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    editor.update(() => {
      const root = $getRoot();
      root.clear();

      if (!html) {
        root.append($createParagraphNode());
        return;
      }

      const document = new DOMParser().parseFromString(html, "text/html");
      const nodes = $generateNodesFromDOM(editor, document);
      if (nodes.length > 0) root.append(...nodes);
      else root.append($createParagraphNode());
    });
  }, [editor, html]);

  return null;
}

function AppendHTMLPlugin({
  value,
}: {
  value: { id: number; html: string } | null;
}) {
  const [editor] = useLexicalComposerContext();
  const lastAppendedId = useRef<number | null>(null);

  useEffect(() => {
    if (!value || lastAppendedId.current === value.id) return;
    lastAppendedId.current = value.id;

    editor.update(() => {
      const document = new DOMParser().parseFromString(value.html, "text/html");
      const nodes = $generateNodesFromDOM(editor, document);
      if (nodes.length === 0) return;
      const root = $getRoot();
      root.append(...nodes);
      root.selectEnd();
    });
    editor.focus();
  }, [editor, value]);

  return null;
}

function ToolbarButton({
  label,
  children,
  pressed,
  onClick,
}: {
  label: string;
  children: ReactNode;
  pressed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={`min-h-8 min-w-8 rounded-sm border px-2 text-sm text-slate-700 hover:border-slate-300 hover:bg-white ${
        pressed
          ? "border-slate-400 bg-white shadow-inner"
          : "border-transparent"
      }`}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function setSelectedBlocks(
  editor: LexicalEditorType,
  type: "paragraph" | "h1" | "h2" | "h3" | "quote" | "code",
) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    const blocks = new Set<ElementNode>();
    for (const node of selection.getNodes()) {
      const block = node.getTopLevelElement();
      if (block instanceof ElementNode) blocks.add(block);
    }

    for (const block of blocks) {
      if (
        !(
          block.getType() === "paragraph" ||
          $isHeadingNode(block) ||
          $isQuoteNode(block) ||
          $isCodeNode(block)
        )
      ) {
        continue;
      }

      if (
        (type === "paragraph" && block.getType() === "paragraph") ||
        (type === "h1" && $isHeadingNode(block) && block.getTag() === "h1") ||
        (type === "h2" && $isHeadingNode(block) && block.getTag() === "h2") ||
        (type === "h3" && $isHeadingNode(block) && block.getTag() === "h3") ||
        (type === "quote" && $isQuoteNode(block)) ||
        (type === "code" && $isCodeNode(block))
      ) {
        continue;
      }

      let replacement: ElementNode;
      if (type === "h1" || type === "h2" || type === "h3") {
        replacement = $createHeadingNode(type);
      } else if (type === "quote") {
        replacement = $createQuoteNode();
      } else if (type === "code") {
        replacement = $createCodeNode("plain");
      } else {
        replacement = $createParagraphNode();
      }

      replacement.append(...block.getChildren());
      block.replace(replacement);
    }
  });
}

function EditorToolbar() {
  const [editor] = useLexicalComposerContext();
  const [formats, setFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
    link: false,
  });
  const [blockType, setBlockType] = useState("paragraph");

  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          const anchor = selection.anchor.getNode();
          const block = anchor.getTopLevelElement();
          const linkParent = anchor.getParent();
          setFormats({
            bold: selection.hasFormat("bold"),
            italic: selection.hasFormat("italic"),
            underline: selection.hasFormat("underline"),
            strikethrough: selection.hasFormat("strikethrough"),
            code: selection.hasFormat("code"),
            link: linkParent instanceof LinkNode,
          });
          if (block) {
            if ($isHeadingNode(block)) setBlockType(block.getTag());
            else if ($isQuoteNode(block)) setBlockType("quote");
            else if ($isCodeNode(block)) setBlockType("code");
            else if (block.getType() === "paragraph") setBlockType("paragraph");
          }
        });
      }),
    [editor],
  );

  const insertLink = () => {
    const isCollapsed = editor.getEditorState().read(() => {
      const selection = $getSelection();
      return !$isRangeSelection(selection) || selection.isCollapsed();
    });
    const text = isCollapsed ? window.prompt("Text to display for the link") : null;
    if (isCollapsed && !text) return;
    const value = window.prompt("Enter the link URL");
    if (!value) return;
    const url = value.trim();
    if (!isSafeLinkUrl(url)) {
      window.alert("Enter a valid http, https, or mailto URL.");
      return;
    }
    const attributes = { target: "_blank", rel: "noopener noreferrer" };
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      if (selection.isCollapsed()) {
        const link = new LinkNode(url, attributes);
        link.append($createTextNode(text ?? url));
        selection.insertNodes([link]);
      } else {
        $toggleLink(url, attributes);
      }
    });
  };

  const insertImage = () => {
    const value = window.prompt("Enter the image URL (http or https)");
    if (!value) return;
    const src = value.trim();
    if (!isSafeImageUrl(src)) {
      window.alert("Enter a valid http or https image URL.");
      return;
    }
    const alt = window.prompt("Describe the image for accessibility") ?? "";
    editor.update(() => {
      const selection = $getSelection();
      const image = $createForumImageNode(src, alt.trim());
      if ($isRangeSelection(selection)) selection.insertNodes([image]);
      else $getRoot().append(image);
    });
  };

  const insertTable = () => {
    const rawRows = window.prompt("Number of rows (1-10)", "3");
    if (!rawRows) return;
    const rawColumns = window.prompt("Number of columns (1-10)", "3");
    if (!rawColumns) return;
    const rows = Number(rawRows);
    const columns = Number(rawColumns);
    if (
      !Number.isInteger(rows) ||
      !Number.isInteger(columns) ||
      rows < 1 ||
      rows > 10 ||
      columns < 1 ||
      columns > 10
    ) {
      window.alert("Table dimensions must be whole numbers from 1 to 10.");
      return;
    }
    editor.update(() => {
      const selection = $getSelection();
      const table = $createTableNodeWithDimensions(rows, columns, {
        rows: true,
        columns: false,
      });
      if ($isRangeSelection(selection)) selection.insertNodes([table]);
      else $getRoot().append(table);
    });
  };

  const applyTextStyle = (property: "color" | "background-color", value: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || selection.isCollapsed()) return;
      for (const node of selection.getNodes()) {
        if ($isTextNode(node)) {
          const style = node.getStyle();
          const nextStyle = style
            .split(";")
            .map((part) => part.trim())
            .filter((part) => part && !part.startsWith(`${property}:`));
          if (value) nextStyle.push(`${property}: ${value}`);
          node.setStyle(nextStyle.join("; "));
        }
      }
    });
  };

  return (
    <div
      role="toolbar"
      aria-label="Message formatting"
      className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2"
    >
      <div role="group" aria-label="Block style" className="flex items-center gap-1">
        <label className="sr-only" htmlFor="editor-block-style">Block style</label>
        <select
          id="editor-block-style"
          value={blockType}
          className="h-8 max-w-36 rounded-sm border border-slate-300 bg-white px-2 text-xs text-slate-700"
          onChange={(event) =>
            setSelectedBlocks(
              editor,
              event.target.value as "paragraph" | "h1" | "h2" | "h3" | "quote" | "code",
            )
          }
        >
          <option value="paragraph">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="quote">Quote</option>
          <option value="code">Code block</option>
        </select>
      </div>

      <span className="mx-1 h-5 border-l border-slate-300" aria-hidden="true" />
      <div role="group" aria-label="Text formatting" className="flex items-center gap-1">
        <ToolbarButton label="Bold" pressed={formats.bold} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton label="Italic" pressed={formats.italic} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}>
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton label="Underline" pressed={formats.underline} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}>
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" pressed={formats.strikethrough} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}>
          <span className="line-through">S</span>
        </ToolbarButton>
        <ToolbarButton label="Inline code" pressed={formats.code} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}>
          <span className="font-mono text-xs"><FaCode /></span>
        </ToolbarButton>
        <ToolbarButton label="Subscript" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")}>
          x<sub className="text-[9px]">2</sub>
        </ToolbarButton>
        <ToolbarButton label="Superscript" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")}>
          x<sup className="text-[9px]">2</sup>
        </ToolbarButton>
      </div>

      <span className="mx-1 h-5 border-l border-slate-300" aria-hidden="true" />
      <div role="group" aria-label="Lists" className="flex items-center gap-1">
        <ToolbarButton label="Bulleted list" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}>
          • List
        </ToolbarButton>
        <ToolbarButton label="Numbered list" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}>
          1. List
        </ToolbarButton>
        <ToolbarButton label="Checklist" onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)}>
          <FaCheck className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <span className="mx-1 h-5 border-l border-slate-300" aria-hidden="true" />
      <div role="group" aria-label="Alignment" className="flex items-center gap-1">
        {(["left", "center", "right", "justify"] as const).map((alignment) => (
          <ToolbarButton
            key={alignment}
            label={`Align ${alignment}`}
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment)}
          >
            {alignment === "justify" ? <FaAlignJustify /> : alignment === "left" ? <FaAlignLeft /> : alignment === "center" ? <FaAlignCenter/> : <FaAlignRight />}
          </ToolbarButton>
        ))}
      </div>

      <span className="mx-1 h-5 border-l border-slate-300" aria-hidden="true" />
      <div role="group" aria-label="Insert content" className="flex items-center gap-1">
        <ToolbarButton label="Insert link" pressed={formats.link} onClick={insertLink}><FaLink /></ToolbarButton>
        <ToolbarButton label="Insert image from URL" onClick={insertImage}><FaImage /></ToolbarButton>
        <ToolbarButton label="Insert table" onClick={insertTable}><FaTable /></ToolbarButton>
      </div>

      <span className="mx-1 h-5 border-l border-slate-300" aria-hidden="true" />
      <div role="group" aria-label="Text color" className="flex items-center gap-2 px-1">
        <label className="flex items-center gap-1 text-[11px] text-slate-600">
          Text
          <input
            type="color"
            aria-label="Text color"
            className="h-6 w-7 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
            onChange={(event) => applyTextStyle("color", event.target.value)}
          />
        </label>
        <label className="flex items-center gap-1 text-[11px] text-slate-600">
          Highlight
          <input
            type="color"
            aria-label="Highlight color"
            className="h-6 w-7 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
            onChange={(event) => applyTextStyle("background-color", event.target.value)}
          />
        </label>
      </div>

      <span className="mx-1 h-5 border-l border-slate-300" aria-hidden="true" />
      <div role="group" aria-label="History" className="flex items-center gap-1">
        <ToolbarButton label="Undo" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}><FaUndo /></ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}><FaRedo /></ToolbarButton>
      </div>
    </div>
  );
}

const autoLinkMatcher = createLinkMatcherWithRegExp(
  /https?:\/\/[^\s<]+[^<.,:;"')\]\s]/i,
  (text) => text,
);

export default function LexicalEditor({
  id = "message-editor",
  name,
  height = 200,
  initialHTML = "",
  appendHTML = null,
  placeholder = "Write your message...",
  ariaLabel = "Message editor",
  onChange,
}: LexicalEditorProps) {
  const [html, setHtml] = useState(initialHTML);

  const initialConfig = {
    namespace: "ForumEditor",
    theme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableRowNode,
      TableCellNode,
      ForumImageNode,
    ],
    onError(error: Error) {
      throw error;
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="overflow-hidden rounded-sm border border-slate-300 bg-white focus-within:border-[#327db4]">
        <EditorToolbar />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                id={id}
                aria-label={ariaLabel}
                className="px-3 py-2 text-sm leading-6 text-slate-700 outline-none"
                style={{ minHeight: `${height}px` }}
              />
            }
            placeholder={
              <div className="pointer-events-none absolute left-0 top-0 px-3 py-2 text-sm leading-6 text-slate-400">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <LinkPlugin
          validateUrl={isSafeLinkUrl}
          attributes={{ target: "_blank", rel: "noopener noreferrer" }}
        />
        <AutoLinkPlugin matchers={[autoLinkMatcher]} />
        <TablePlugin hasCellMerge={false} hasHorizontalScroll />
        <InitialHTMLPlugin html={initialHTML} />
        <AppendHTMLPlugin value={appendHTML} />
        <OnChangePlugin
          onChange={(editorState, editor) => {
            const nextHTML = editorState.read(() => $generateHtmlFromNodes(editor));
            setHtml(nextHTML);
            onChange?.(nextHTML);
          }}
        />
      </div>
      {name ? <input type="hidden" name={name} value={html} /> : null}
    </LexicalComposer>
  );
}
