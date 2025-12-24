import { Button, Card, Modal, Tag } from "antd";
import dayjs from "dayjs";
import type { Worklog } from "../../../services/worklogApi";

type Props = {
  open: boolean;
  item: Worklog | null;
  onClose: () => void;
};

export default function WorklogViewModal({ open, item, onClose }: Props) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      title="Chi tiết worklog"
      width={860}
    >
      {!item ? null : (
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500">Ngày</div>
              <div className="text-base font-semibold text-slate-900">
                {dayjs(item.work_date).format("DD/MM/YYYY")}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">Trạng thái</div>
              {item.feedback && String(item.feedback).trim() ? (
                <Tag color="green">Đã phản hồi</Tag>
              ) : (
                <Tag color="gold">Chờ phản hồi</Tag>
              )}
            </div>
          </div>

          {/* Content */}
          <Card size="small" className="border border-slate-200">
            <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
              Nội dung
            </div>
            <div className="text-sm text-slate-800 whitespace-pre-wrap">
              {item.content || "—"}
            </div>
          </Card>

          {/* Feedback */}
          <Card
            size="small"
            className="border border-emerald-200 bg-emerald-50/60"
          >
            <div className="text-xs font-semibold text-emerald-700 uppercase mb-1">
              Feedback giảng viên
            </div>
            <div className="text-sm text-slate-800 whitespace-pre-wrap">
              {item.feedback && String(item.feedback).trim()
                ? item.feedback
                : "Chưa có feedback."}
            </div>
          </Card>

          {/* Attachments */}
          <Card size="small" className="border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-slate-500 uppercase">
                File đính kèm
              </div>
              <Tag>{item.work_log_attachments?.length ?? 0}</Tag>
            </div>

            {!item.work_log_attachments || item.work_log_attachments.length === 0 ? (
              <div className="text-sm text-slate-500">Không có file.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {item.work_log_attachments.map((f: any) => {
                  const url = f.file_path;
                  const name =
                    f.description ||
                    f.public_id?.split("/").pop() ||
                    `file-${f.id}`;

                  const isPdf =
                    typeof url === "string" && url.toLowerCase().includes(".pdf");
                  const isImage =
                    typeof url === "string" &&
                    /(\.png|\.jpg|\.jpeg|\.webp|\.gif)(\?|$)/i.test(url);

                  return (
                    <div
                      key={f.id}
                      className="border border-slate-200 rounded-xl p-3 bg-white"
                    >
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {name}
                      </div>

                      <div className="mt-2">
                        {isImage ? (
                          <img
                            src={url}
                            alt={name}
                            className="w-full h-40 object-cover rounded-lg border border-slate-100"
                          />
                        ) : isPdf ? (
                          <div className="text-sm text-slate-600">
                            File PDF (bấm “Mở file” để xem)
                          </div>
                        ) : (
                          <div className="text-sm text-slate-600">
                            File đính kèm (bấm “Mở file” để tải/xem)
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button
                          size="small"
                          type="primary"
                          onClick={() =>
                            window.open(url, "_blank", "noopener,noreferrer")
                          }
                        >
                          Mở file
                        </Button>
                        <Button
                          size="small"
                          onClick={() => navigator.clipboard.writeText(url)}
                        >
                          Copy link
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </Modal>
  );
}
