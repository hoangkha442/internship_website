import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link"],
  [{ align: [] }],
  ["clean"],
];

export default function RichTextEditor(props: {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ border: "1px solid #d9d9d9", borderRadius: 8 }}>
      <ReactQuill
        theme="snow"
        value={props.value ?? ""}
        onChange={props.onChange as any}
        placeholder={props.placeholder ?? "Nhập nội dung..."}
        modules={{ toolbar: toolbarOptions }}
      />
    </div>
  );
}
