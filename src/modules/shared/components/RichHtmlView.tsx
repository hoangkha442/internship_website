import DOMPurify from "dompurify";

export default function RichHtmlView(props: { html?: string | null }) {
  const html = props.html ?? "";
  if (!html.trim()) return null;

  return (
    <div
      className="rounded-lg border border-slate-200 p-3 bg-white"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}
