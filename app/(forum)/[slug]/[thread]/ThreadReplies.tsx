"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import LexicalEditor from "@/app/_components/LexicalEditor";

type ThreadRepliesContextValue = {
  replyToPost: (quotedHTML: string) => void;
};

const ThreadRepliesContext = createContext<ThreadRepliesContextValue | null>(null);

type ThreadRepliesProps = {
  categorySlug: string;
  threadPublicId: string;
  children: ReactNode;
  canReply: boolean;
};

export function ThreadReplies({
  categorySlug,
  threadPublicId,
  children,
  canReply,
}: ThreadRepliesProps) {
  const router = useRouter();
  const [appendHTML, setAppendHTML] = useState<{ id: number; html: string } | null>(
    null,
  );
  const appendId = useRef(0);
  const [body, setBody] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const composerRef = useRef<HTMLElement | null>(null);

  function replyToPost(quotedHTML: string) {
    appendId.current += 1;
    setAppendHTML({ id: appendId.current, html: quotedHTML });
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/forum/categories/${encodeURIComponent(categorySlug)}/threads/${encodeURIComponent(threadPublicId)}/posts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        },
      );
      if (!response.ok) {
        const result: unknown = await response.json();
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Could not post your reply. Please try again.";
        setError(message);
        return;
      }

      setBody("");
      setAppendHTML(null);
      setEditorKey((current) => current + 1);
      router.refresh();
    } catch (submitError) {
      console.error("Could not submit forum reply.", submitError);
      setError("Could not post your reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThreadRepliesContext.Provider value={{ replyToPost }}>
      {children}
      {canReply ? (
        <section
          ref={composerRef}
          aria-labelledby="reply-heading"
          className="border-t border-slate-200 bg-white p-4 sm:p-5"
        >
          <h2 id="reply-heading" className="mb-3 text-lg font-semibold text-slate-700">
            Post a reply
          </h2>
          <form onSubmit={submitReply}>
            <LexicalEditor
              key={editorKey}
              id="thread-reply-editor"
              name="body"
              ariaLabel="Reply message"
              placeholder="Write your reply..."
              appendHTML={appendHTML}
              onChange={setBody}
            />
            {error ? (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-sm border border-[#286a9b] bg-[#327db4] px-4 py-2 text-sm font-medium text-white hover:bg-[#286a9b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Posting..." : "Post Reply"}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </ThreadRepliesContext.Provider>
  );
}

export function ReplyToPostButton({ quotedHTML }: { quotedHTML: string }) {
  const context = useContext(ThreadRepliesContext);
  if (!context) {
    throw new Error("ReplyToPostButton must be rendered inside ThreadReplies.");
  }

  return (
    <button
      type="button"
      onClick={() => context.replyToPost(quotedHTML)}
      className="font-medium hover:underline"
    >
      + Reply
    </button>
  );
}
