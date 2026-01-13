// import { Modal, Tag, Typography } from "antd";
// import dayjs from "dayjs";
// import type { ProgressReport } from "../../../../../services/reportApi";
// import RichHtmlView from "../../../../shared/components/RichHtmlView";

// const { Title, Text } = Typography;

// const statusTag = (s?: string | null) => {
//   if (s === "reviewed") return <Tag color="green">Đã duyệt</Tag>;
//   if (s === "needs_revision") return <Tag color="red">Cần chỉnh sửa</Tag>;
//   return <Tag color="gold">Đã nộp</Tag>;
// };

// export default function ReportViewModal(props: {
//   open: boolean;
//   item: ProgressReport | null;
//   onClose: () => void;
// }) {
//   const r = props.item;
//   console.log('r: ', r);

//   return (
//     <Modal
//       open={props.open}
//       onCancel={props.onClose}
//       onOk={props.onClose}
//       title="Chi tiết báo cáo"
//       width={860}
//       okText="Đóng"
//       cancelButtonProps={{ style: { display: "none" } }}
//     >
//       {!r ? null : (
//         <div className="space-y-3">
//           <div className="flex flex-wrap items-center gap-2">
//             {statusTag(r.status)}
//             <Tag>Report #{r.report_no ?? "-"}</Tag>
//             <Tag>Week {r.week_no ?? "-"}</Tag>
//             <Tag>
//               Nộp:{" "}
//               {r.submitted_at
//                 ? dayjs(r.submitted_at).format("DD/MM/YYYY HH:mm")
//                 : "-"}
//             </Tag>
//           </div>

//           <Title level={4} style={{ margin: 0 }}>
//             {r.title}
//           </Title>

//           {r.content ? (
//             <RichHtmlView html={r.content} />
//           ) : (
//             <Text type="secondary">Không có nội dung.</Text>
//           )}

//           <div className="border-t pt-3">
//             <div className="font-semibold mb-1">File đính kèm</div>
//             {r.report_attachments?.length ? (
//               <ul className="list-disc pl-5">
//                 {r.report_attachments.map((a) => (
//                   <li key={String(a.id)}>
//                     <a href={a.file_path} target="_blank" rel="noreferrer">
//                       {a.description || a.file_path}
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <Text type="secondary">Không có file.</Text>
//             )}
//           </div>

//           <div className="border-t pt-3">
//             <div className="font-semibold mb-1">Phản hồi giảng viên</div>
//             <div className="flex flex-wrap items-center gap-2 mb-2">
//               <Tag>Điểm: {r.score ?? "-"}</Tag>
//               <Tag>Pass: {r.is_pass == null ? "-" : r.is_pass ? "Yes" : "No"}</Tag>
//               <Tag>
//                 Review:{" "}
//                 {r.reviewed_at
//                   ? dayjs(r.reviewed_at).format("DD/MM/YYYY HH:mm")
//                   : "-"}
//               </Tag>
//             </div>

//             {r.feedback && String(r.feedback).trim() ? (
//               <RichHtmlView html={r.feedback} />
//             ) : (
//               <Text type="secondary">Chưa có phản hồi.</Text>
//             )}
//           </div>
//         </div>
//       )}
//     </Modal>
//   );
// }

import { Modal, Tag, Typography } from "antd";
import dayjs from "dayjs";
import type { ProgressReport } from "../../../../../services/reportApi";
import RichHtmlView from "../../../../shared/components/RichHtmlView";

const { Title, Text } = Typography;

const statusTag = (s?: string | null) => {
  if (s === "reviewed") return <Tag color="green">Đã duyệt</Tag>;
  if (s === "needs_revision") return <Tag color="red">Cần chỉnh sửa</Tag>;
  return <Tag color="gold">Đã nộp</Tag>;
};

export default function ReportViewModal(props: {
  open: boolean;
  item: ProgressReport | null;
  onClose: () => void;
}) {
  const r = props.item;

  const passTag = () => {
    if (!r) return null;
    if (r.status !== "reviewed" || !r.reviewed_at) return <Tag color="gold">Chờ duyệt</Tag>;
    if (r.is_pass == null) return <Tag>Chưa có kết luận</Tag>;
    return r.is_pass ? <Tag color="green">Pass</Tag> : <Tag color="red">Fail</Tag>;
  };

  return (
    <Modal
      open={props.open}
      onCancel={props.onClose}
      onOk={props.onClose}
      title="Chi tiết báo cáo"
      width={860}
      okText="Đóng"
      cancelButtonProps={{ style: { display: "none" } }}
    >
      {!r ? null : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {statusTag(r.status)}
            <Tag>Report #{r.report_no ?? "-"}</Tag>
            <Tag>Week {r.week_no ?? "-"}</Tag>
            <Tag>
              Nộp: {r.submitted_at ? dayjs(r.submitted_at).format("DD/MM/YYYY HH:mm") : "-"}
            </Tag>
          </div>

          <Title level={4} style={{ margin: 0 }}>
            {r.title}
          </Title>

          {r.content ? <RichHtmlView html={r.content} /> : <Text type="secondary">Không có nội dung.</Text>}

          <div className="border-t pt-3">
            <div className="font-semibold mb-1">File đính kèm</div>
            {r.report_attachments?.length ? (
              <ul className="list-disc pl-5">
                {r.report_attachments.map((a) => (
                  <li key={String(a.id)}>
                    <a href={a.file_path} target="_blank" rel="noreferrer">
                      {a.description || a.file_path}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <Text type="secondary">Không có file.</Text>
            )}
          </div>

          <div className="border-t pt-3">
            <div className="font-semibold mb-1">Phản hồi giảng viên</div>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Tag>Điểm: {r.score ?? "-"}</Tag>
              {passTag()}
              <Tag>
                Review: {r.reviewed_at ? dayjs(r.reviewed_at).format("DD/MM/YYYY HH:mm") : "-"}
              </Tag>
            </div>

            {/*  render HTML feedback */}
            {r.feedback && String(r.feedback).trim() ? (
              <RichHtmlView html={r.feedback} />
            ) : (
              <Text type="secondary">Chưa có phản hồi.</Text>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
