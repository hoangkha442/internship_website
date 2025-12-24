// import { useEffect, useMemo, useState } from "react";
// import {
//   Alert,
//   Card,
//   Descriptions,
//   Empty,
//   Progress,
//   Row,
//   Col,
//   Spin,
//   Statistic,
//   Tag,
//   Typography,
//   Divider,
// } from "antd";
// import dayjs from "dayjs";

// import PageHeader from "../../../shared/components/PageHeader";
// import { useNotification } from "../../../../provider/Notification";
// import {
//   getMyInternship,
//   getMyTopicRegistration,
// } from "../../../../services/studentApi";
// import type {
//   MyInternshipResponse,
//   MyTopicRegistrationResponse,
// } from "../../../shared/types/studentInternship";

// const { Title, Text } = Typography;

// const STATUS_LABEL: Record<string, string> = {
//   registered: "Đã đăng ký",
//   in_progress: "Đang thực tập",
//   completed: "Hoàn thành",
//   canceled: "Đã hủy",
// };

// const STATUS_COLOR: Record<string, string> = {
//   registered: "processing",
//   in_progress: "blue",
//   completed: "green",
//   canceled: "red",
// };

// const REG_STATUS_LABEL: Record<string, string> = {
//   pending: "Đang chờ duyệt",
//   approved: "Đã được duyệt",
//   rejected: "Bị từ chối",
// };

// const REG_STATUS_COLOR: Record<string, string> = {
//   pending: "gold",
//   approved: "green",
//   rejected: "red",
// };

// const fmtDate = (v?: string | null) => (v ? dayjs(v).format("DD/MM/YYYY") : "—");
// const fmtDateTime = (v?: string | null) =>
//   v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—";
// const safeText = (v?: string | null) => (v && v.trim() ? v.trim() : "—");

// const SoftCard = ({
//   title,
//   children,
// }: {
//   title: React.ReactNode;
//   children: React.ReactNode;
// }) => (
//   <Card
//     size="small"
//     className="border border-slate-200 shadow-sm"
//     title={title}
//     headStyle={{ borderBottom: "1px solid #e2e8f0" }}
//     bodyStyle={{ paddingTop: 12 }}
//   >
//     {children}
//   </Card>
// );

// const StudentInternshipProfilePage = () => {
//   const { notify } = useNotification();
//   const [loading, setLoading] = useState(true);
//   const [internship, setInternship] = useState<MyInternshipResponse | null>(
//     null
//   );
//   const [registration, setRegistration] = useState<
//     MyTopicRegistrationResponse["registration"] | null
//   >(null);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const [internshipRes, regRes] = await Promise.all([
//         getMyInternship().catch(() => null),
//         getMyTopicRegistration().catch(() => ({ registration: null })),
//       ]);
//       setInternship(internshipRes || null);
//       setRegistration(regRes?.registration || null);
//     } catch (err) {
//       console.error(err);
//       notify("error", "Không tải được hồ sơ thực tập");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const hasInternship = !!internship;
//   const isPending =
//     !hasInternship && registration && registration.status === "pending";
//   const isRejected =
//     !hasInternship && registration && registration.status === "rejected";
//   const nothing =
//     !hasInternship && (!registration || registration.status === "rejected");

//   const internshipView = useMemo(() => {
//     if (!internship) return null;

//     const term = internship.internship_terms;
//     const topic = internship.internship_topics;
//     const gv = internship.lecturers;

//     const status = internship.status;
//     const statusLabel = STATUS_LABEL[status] || status;
//     const statusColor = STATUS_COLOR[status] || "default";

//     const progress = Math.max(0, Math.min(100, Number(internship.progress_percent || 0)));

//     // Nếu type của term thiếu field, cast nhẹ để TS không đỏ
//     const termExtra = (term ?? {}) as unknown as {
//       total_weeks?: number;
//       min_attendance_days_per_week?: number;
//       min_reports?: number;
//     };

//     const internshipStart = internship.start_date ?? term?.start_date ?? null;
//     const internshipEnd = internship.end_date ?? term?.end_date ?? null;

//     return (
//       <Card className="border border-slate-200 shadow-sm">
//         {/* ======= TOP SUMMARY (nổi bật) ======= */}
//         <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
//           <div className="min-w-0">
//             <div className="flex items-center gap-2 flex-wrap">
//               <Tag color={statusColor} className="m-0 text-sm">
//                 {statusLabel}
//               </Tag>
//               <Text className="text-xs text-slate-500">
//                 Tạo lúc: {fmtDateTime(internship.created_at)}
//               </Text>
//             </div>

//             <Title level={4} className="mt-2! mb-0! text-slate-900! truncate">
//               {term?.term_name ? term.term_name : "Hồ sơ thực tập"}
//             </Title>

//             <Text className="text-sm text-slate-600">
//               {safeText(topic?.title)}
//             </Text>
//           </div>

//           <div className="w-full md:w-[320px]">
//             <div className="flex items-center justify-between">
//               <Text className="text-xs text-slate-500">Tiến độ</Text>
//               <Text className="text-xs text-slate-600">{progress}%</Text>
//             </div>
//             <Progress percent={progress} size="small" showInfo={false} />
//             <div className="mt-2 flex items-center justify-between">
//               <Text className="text-xs text-slate-500">Thực tập</Text>
//               <Text className="text-xs text-slate-700">
//                 {fmtDate(internshipStart)} → {fmtDate(internshipEnd)}
//               </Text>
//             </div>
//           </div>
//         </div>

//         <Divider className="my-4" />

//         {/* ======= GRID 2 CỘT ĐỀU ======= */}
//         <Row gutter={[16, 16]}>
//           {/* LEFT COLUMN */}
//           <Col xs={24} lg={12}>
//             <div className="flex flex-col gap-4">
//               <SoftCard
//                 title={<span className="text-sm font-semibold">Đề tài</span>}
//               >
//                 <Title level={5} className="m-0! text-slate-900!">
//                   {safeText(topic?.title)}
//                 </Title>
//                 <div className="mt-2">
//                   {topic?.description ? (
//                     <Text className="text-sm text-slate-600">
//                       {topic.description}
//                     </Text>
//                   ) : (
//                     <Text className="text-sm text-slate-400 italic">
//                       Không có mô tả
//                     </Text>
//                   )}
//                 </div>

//                 <Divider className="my-3" />

//                 <Descriptions size="small" column={1} colon={false}>
//                   <Descriptions.Item label={<Text className="text-xs text-slate-500">Công ty</Text>}>
//                     <Text className="text-sm">{safeText(topic?.company_name)}</Text>
//                   </Descriptions.Item>
//                   <Descriptions.Item label={<Text className="text-xs text-slate-500">Địa chỉ</Text>}>
//                     <Text className="text-sm">{safeText(topic?.company_address)}</Text>
//                   </Descriptions.Item>
//                 </Descriptions>
//               </SoftCard>

//               <SoftCard
//                 title={<span className="text-sm font-semibold">Mốc & yêu cầu</span>}
//               >
//                 <Row gutter={[12, 12]}>
//                   <Col xs={8}>
//                     <Statistic
//                       title="Tổng tuần"
//                       value={termExtra.total_weeks ?? "—"}
//                       valueStyle={{ fontSize: 18 }}
//                     />
//                   </Col>
//                   <Col xs={8}>
//                     <Statistic
//                       title="Buổi/tuần"
//                       value={termExtra.min_attendance_days_per_week ?? "—"}
//                       valueStyle={{ fontSize: 18 }}
//                     />
//                   </Col>
//                   <Col xs={8}>
//                     <Statistic
//                       title="Báo cáo"
//                       value={termExtra.min_reports ?? "—"}
//                       valueStyle={{ fontSize: 18 }}
//                     />
//                   </Col>
//                 </Row>

//                 <Divider className="my-3" />

//                 <Descriptions size="small" column={1} colon={false}>
//                   <Descriptions.Item label={<Text className="text-xs text-slate-500">Kỳ thực tập</Text>}>
//                     <Text className="text-sm">
//                       {fmtDate(term?.start_date)} → {fmtDate(term?.end_date)}
//                     </Text>
//                   </Descriptions.Item>
//                   <Descriptions.Item label={<Text className="text-xs text-slate-500">Thực tập</Text>}>
//                     <Text className="text-sm">
//                       {fmtDate(internshipStart)} → {fmtDate(internshipEnd)}
//                     </Text>
//                   </Descriptions.Item>
//                 </Descriptions>
//               </SoftCard>
//             </div>
//           </Col>

//           {/* RIGHT COLUMN */}
//           <Col xs={24} lg={12}>
//             <div className="flex flex-col gap-4">
//               <SoftCard
//                 title={<span className="text-sm font-semibold">Giảng viên hướng dẫn</span>}
//               >
//                 <Descriptions size="small" column={1} colon={false}>
//                   <Descriptions.Item label={<Text className="text-xs text-slate-500">Mã giảng viên</Text>}>
//                     <Text className="text-sm">{safeText(gv?.lecturer_code)}</Text>
//                   </Descriptions.Item>
//                   <Descriptions.Item label={<Text className="text-xs text-slate-500">Khoa</Text>}>
//                     <Text className="text-sm">{safeText(gv?.department)}</Text>
//                   </Descriptions.Item>
//                   <Descriptions.Item label={<Text className="text-xs text-slate-500">SĐT</Text>}>
//                     <Text className="text-sm">{safeText(gv?.phone)}</Text>
//                   </Descriptions.Item>
//                 </Descriptions>
//               </SoftCard>

//               <SoftCard
//                 title={<span className="text-sm font-semibold">Tóm tắt nhanh</span>}
//               >
//                 <Row gutter={[12, 12]}>
//                   <Col xs={12}>
//                     <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
//                       <Text className="text-xs text-slate-500">Trạng thái</Text>
//                       <div className="mt-1">
//                         <Tag color={statusColor} className="m-0">
//                           {statusLabel}
//                         </Tag>
//                       </div>
//                     </div>
//                   </Col>

//                   <Col xs={12}>
//                     <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
//                       <Text className="text-xs text-slate-500">Tiến độ</Text>
//                       <div className="mt-1">
//                         <Text className="text-sm font-semibold text-slate-900">
//                           {progress}%
//                         </Text>
//                       </div>
//                     </div>
//                   </Col>

//                   <Col xs={24}>
//                     <div className="p-3 rounded-xl border border-slate-200 bg-white">
//                       <Text className="text-xs text-slate-500">Đề tài</Text>
//                       <div className="mt-1">
//                         <Text className="text-sm font-semibold text-slate-900">
//                           {safeText(topic?.title)}
//                         </Text>
//                       </div>
//                       <div className="mt-1">
//                         <Text className="text-xs text-slate-600">
//                           {safeText(topic?.company_name)}
//                         </Text>
//                       </div>
//                     </div>
//                   </Col>
//                 </Row>
//               </SoftCard>
//             </div>
//           </Col>
//         </Row>
//       </Card>
//     );
//   }, [internship]);

//   const pendingView = useMemo(() => {
//     if (!registration || registration.status !== "pending") return null;

//     const topic = registration.internship_topics;
//     const gv = topic?.lecturers;

//     return (
//       <Card className="border border-amber-200 bg-amber-50/70 shadow-sm">
//         <div className="flex items-start justify-between gap-3">
//           <div className="min-w-0">
//             <Text className="text-xs font-semibold text-amber-800 uppercase">
//               Đang chờ duyệt đề tài
//             </Text>
//             <Title level={4} className="mt-2! mb-0! text-slate-900! truncate">
//               {safeText(topic?.title)}
//             </Title>
//             {topic?.description ? (
//               <Text className="text-sm text-slate-600">{topic.description}</Text>
//             ) : null}
//           </div>

//           <Tag color={REG_STATUS_COLOR[registration.status]} className="m-0">
//             {REG_STATUS_LABEL[registration.status]}
//           </Tag>
//         </div>

//         <Divider className="my-4" />

//         <Row gutter={[16, 16]}>
//           <Col xs={24} md={12}>
//             <SoftCard title={<span className="text-sm font-semibold">Công ty</span>}>
//               <Descriptions size="small" column={1} colon={false}>
//                 <Descriptions.Item label={<Text className="text-xs text-slate-500">Tên</Text>}>
//                   <Text className="text-sm">{safeText(topic?.company_name)}</Text>
//                 </Descriptions.Item>
//                 <Descriptions.Item label={<Text className="text-xs text-slate-500">Địa chỉ</Text>}>
//                   <Text className="text-sm">{safeText(topic?.company_address)}</Text>
//                 </Descriptions.Item>
//               </Descriptions>
//             </SoftCard>
//           </Col>

//           <Col xs={24} md={12}>
//             <SoftCard title={<span className="text-sm font-semibold">Giảng viên</span>}>
//               <Descriptions size="small" column={1} colon={false}>
//                 <Descriptions.Item label={<Text className="text-xs text-slate-500">Mã GV</Text>}>
//                   <Text className="text-sm">{safeText(gv?.lecturer_code)}</Text>
//                 </Descriptions.Item>
//                 <Descriptions.Item label={<Text className="text-xs text-slate-500">Khoa</Text>}>
//                   <Text className="text-sm">{safeText(gv?.department)}</Text>
//                 </Descriptions.Item>
//                 <Descriptions.Item label={<Text className="text-xs text-slate-500">SĐT</Text>}>
//                   <Text className="text-sm">{safeText(gv?.phone)}</Text>
//                 </Descriptions.Item>
//               </Descriptions>
//             </SoftCard>
//           </Col>
//         </Row>

//         <div className="mt-4">
//           <Text className="text-xs text-slate-600">
//             Ngày đăng ký: {fmtDateTime(registration.registered_at)}
//           </Text>
//         </div>
//       </Card>
//     );
//   }, [registration]);

//   if (loading) {
//     return (
//       <div className="p-6">
//         <PageHeader
//           title="Hồ sơ thực tập"
//           subtitle="Theo dõi trạng thái duyệt đề tài và thông tin kỳ thực tập của bạn."
//         />
//         <div className="mt-6 flex justify-center">
//           <Spin />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 flex flex-col gap-4">
//       <PageHeader
//         title="Hồ sơ thực tập"
//         subtitle="Theo dõi trạng thái duyệt đề tài và thông tin kỳ thực tập của bạn."
//       />

//       {hasInternship && internshipView}

//       {!hasInternship && isPending && pendingView}

//       {!hasInternship && isRejected && (
//         <Alert
//           type="error"
//           showIcon
//           message="Đề tài thực tập của bạn đã bị từ chối"
//           description="Vui lòng đăng ký một đề tài khác hoặc liên hệ giảng viên phụ trách."
//           className="shadow-sm"
//         />
//       )}

//       {nothing && (
//         <Card className="border border-slate-200 shadow-sm">
//           <Empty
//             description={
//               <div className="text-sm text-slate-700">
//                 Bạn chưa có hồ sơ thực tập nào. Hãy vào mục{" "}
//                 <span className="font-semibold">Danh sách đề tài</span> để đăng ký.
//               </div>
//             }
//           />
//         </Card>
//       )}
//     </div>
//   );
// };

// export default StudentInternshipProfilePage;

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Card,
  Collapse,
  Col,
  Empty,
  Progress,
  Row,
  Spin,
  Statistic,
  Tag,
  Typography,
  Divider,
} from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import PageHeader from "../../../shared/components/PageHeader";
import { useNotification } from "../../../../provider/Notification";
import {
  getMyInternship,
  getMyTopicRegistration,
} from "../../../../services/studentApi";
import type {
  MyInternshipResponse,
  MyTopicRegistrationResponse,
} from "../../../shared/types/studentInternship";

const { Title, Text, Paragraph } = Typography;

const STATUS_LABEL: Record<string, string> = {
  registered: "Đã đăng ký",
  in_progress: "Đang thực tập",
  completed: "Hoàn thành",
  canceled: "Đã hủy",
};

const STATUS_COLOR: Record<string, string> = {
  registered: "processing",
  in_progress: "blue",
  completed: "green",
  canceled: "red",
};

const REG_STATUS_LABEL: Record<string, string> = {
  pending: "Đang chờ duyệt",
  approved: "Đã được duyệt",
  rejected: "Bị từ chối",
};

const REG_STATUS_COLOR: Record<string, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

const fmtDate = (v?: string | null) =>
  v ? dayjs(v).format("DD/MM/YYYY") : "—";
const fmtDateTime = (v?: string | null) =>
  v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—";
const safeText = (v?: string | null) => (v && v.trim() ? v.trim() : "—");

const KpiCard = ({ children }: { children: React.ReactNode }) => (
  <Card
    className="border border-slate-200 shadow-sm"
    bodyStyle={{ padding: 14 }}
  >
    {children}
  </Card>
);

const StudentInternshipProfilePage = () => {
  const { notify } = useNotification();

  const [loading, setLoading] = useState(true);
  const [internship, setInternship] = useState<MyInternshipResponse | null>(
    null
  );
  const [registration, setRegistration] = useState<
    MyTopicRegistrationResponse["registration"] | null
  >(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [internshipRes, regRes] = await Promise.all([
        getMyInternship().catch(() => null),
        getMyTopicRegistration().catch(() => ({ registration: null })),
      ]);

      setInternship(internshipRes || null);
      setRegistration(regRes?.registration || null);
    } catch (err) {
      console.error(err);
      notify("error", "Không tải được hồ sơ thực tập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasInternship = !!internship;
  const isPending =
    !hasInternship && registration && registration.status === "pending";
  const isRejected =
    !hasInternship && registration && registration.status === "rejected";
  const nothing =
    !hasInternship && (!registration || registration.status === "rejected");

  const internshipView = useMemo(() => {
    if (!internship) return null;

    const term = internship.internship_terms;
    const topic = internship.internship_topics;
    const gv = internship.lecturers;

    const status = internship.status;
    const statusLabel = STATUS_LABEL[status] || status;
    const statusColor = STATUS_COLOR[status] || "default";

    const progress = Math.max(
      0,
      Math.min(100, Number(internship.progress_percent || 0))
    );

    // Nếu type của term chưa có field thì cast nhẹ để không đỏ TS
    const termExtra = (term ?? {}) as unknown as {
      total_weeks?: number;
      min_attendance_days_per_week?: number;
      min_reports?: number;
    };

    const internshipStart = internship.start_date ?? term?.start_date ?? null;
    const internshipEnd = internship.end_date ?? term?.end_date ?? null;

    return (
      <div className="flex flex-col gap-4">
        {/* HERO: nổi bật + ít chữ */}
        <KpiCard>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag color={statusColor} className="m-0 text-sm">
                  {statusLabel}
                </Tag>
                <Text className="text-xs text-slate-500">
                  {fmtDateTime(internship.created_at)}
                </Text>
              </div>

              <Title level={4} className="mt-2! mb-0! text-slate-900! truncate">
                {safeText(term?.term_name)}
              </Title>

              <Text className="text-sm text-slate-600 truncate">
                {safeText(topic?.title)}
              </Text>
            </div>

            <div className="w-full md:w-[320px]">
              <div className="flex items-center justify-between">
                <Text className="text-xs text-slate-500">Tiến độ</Text>
                <Text className="text-xs text-slate-700 font-medium">
                  {progress}%
                </Text>
              </div>
              <Progress percent={progress} size="small" showInfo={false} />
              <Text className="text-xs text-slate-500">
                {fmtDate(internshipStart)} → {fmtDate(internshipEnd)}
              </Text>
            </div>
          </div>

          <Divider className="my-4" />

          {/* KPI row (ít chữ, dễ nhìn) */}
          <Row gutter={[12, 12]}>
            <Col xs={12} md={6}>
              <Statistic
                title={
                  <span className="text-xs text-slate-500">
                    <TeamOutlined /> Công ty
                  </span>
                }
                value={safeText(topic?.company_name)}
                valueStyle={{ fontSize: 16 }}
              />
            </Col>

            <Col xs={12} md={6}>
              <Statistic
                title={
                  <span className="text-xs text-slate-500">
                    <UserOutlined /> GV
                  </span>
                }
                value={safeText(gv?.lecturer_code)}
                valueStyle={{ fontSize: 16 }}
              />
            </Col>

            <Col xs={12} md={6}>
              <Statistic
                title={
                  <span className="text-xs text-slate-500">
                    <CalendarOutlined /> Tổng tuần
                  </span>
                }
                value={termExtra.total_weeks ?? "—"}
                valueStyle={{ fontSize: 16 }}
              />
            </Col>

            <Col xs={12} md={6}>
              <Statistic
                title={
                  <span className="text-xs text-slate-500">
                    <FileTextOutlined /> Báo cáo
                  </span>
                }
                value={termExtra.min_reports ?? "—"}
                valueStyle={{ fontSize: 16 }}
              />
            </Col>
          </Row>
        </KpiCard>

        {/* 2 cột cân bằng – ít text */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card className="border border-slate-200 shadow-sm" title="Đề tài">
              <Title level={5} className="mt-0! mb-2! text-slate-900!">
                {safeText(topic?.title)}
              </Title>

              <Paragraph
                className="mb-0! text-sm text-slate-600"
                ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}
              >
                {topic?.description ? topic.description : "Không có mô tả."}
              </Paragraph>
            </Card>

            <Collapse
              className="border border-slate-200 shadow-sm mt-5!"
              items={[
                {
                  key: "detail",
                  label: "Xem chi tiết",
                  children: (
                    <Row gutter={[16, 12]}>
                      <Col xs={24} md={12}>
                        <div className="text-xs text-slate-500 mb-2 font-semibold">
                          Kỳ thực tập
                        </div>
                        <div className="text-sm text-slate-700">
                          {fmtDate(term?.start_date)} →{" "}
                          {fmtDate(term?.end_date)}
                        </div>
                        <div className="text-sm text-slate-700 mt-1">
                          Buổi/tuần tối thiểu:{" "}
                          <Text className="font-medium">
                            {termExtra.min_attendance_days_per_week ?? "—"}
                          </Text>
                        </div>
                      </Col>

                      <Col xs={24} md={12}>
                        <div className="text-xs text-slate-500 mb-2 font-semibold">
                          Thực tập
                        </div>
                        <div className="text-sm text-slate-700">
                          {fmtDate(internshipStart)} → {fmtDate(internshipEnd)}
                        </div>
                        <div className="text-sm text-slate-700 mt-1">
                          ID hồ sơ:{" "}
                          <Text className="font-medium">
                            {safeText(internship.id)}
                          </Text>
                        </div>
                      </Col>
                    </Row>
                  ),
                },
              ]}
            />
          </Col>

          <Col xs={24} lg={12}>
          
            <Card
              className="border border-slate-200 shadow-sm"
              title="Liên hệ nhanh"
            >
              <div className="flex flex-col gap-2">

                <div className="flex items-start gap-2">
                  <UserOutlined className="mt-1 text-slate-400" />
                  <div className="min-w-0">
                    <Text className="text-xs text-slate-500">Giảng viên</Text>
                    <div className="text-sm text-slate-800 font-medium">
                      {safeText(gv?.lecturer_code)}
                      {gv?.department ? (
                        <Text className="text-sm text-slate-600">
                          {" "}
                          · {gv.department}
                        </Text>
                      ) : null}
                    </div>
                    {gv?.phone ? (
                      <div className="text-sm text-slate-700">
                        SĐT: {gv.phone}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400">SĐT: —</div>
                    )}
                  </div>
                </div>

            <Divider className="my-2" />

                <div className="flex items-start gap-2">
                  <TeamOutlined className="mt-1 text-slate-400" />
                  <div className="min-w-0">
                    <Text className="text-xs text-slate-500">Công ty</Text>
                    <div className="text-sm text-slate-800 font-medium truncate">
                      {safeText(topic?.company_name)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <EnvironmentOutlined className="mt-1 text-slate-400" />
                  <div className="min-w-0">
                    <Text className="text-xs text-slate-500">Địa chỉ</Text>
                    <div className="text-sm text-slate-700">
                      {safeText(topic?.company_address)}
                    </div>
                  </div>
                </div>

                
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }, [internship]);

  const pendingView = useMemo(() => {
    if (!registration || registration.status !== "pending") return null;

    const topic = registration.internship_topics;
    const gv = topic?.lecturers;

    return (
      <div className="flex flex-col gap-4">
        <KpiCard>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Tag
                color={REG_STATUS_COLOR[registration.status]}
                className="m-0"
              >
                {REG_STATUS_LABEL[registration.status]}
              </Tag>
              <Title level={4} className="mt-2! mb-0! text-slate-900! truncate">
                {safeText(topic?.title)}
              </Title>
              <Text className="text-xs text-slate-500">
                Đăng ký lúc: {fmtDateTime(registration.registered_at)}
              </Text>
            </div>
          </div>

          <Divider className="my-4" />

          <Row gutter={[12, 12]}>
            <Col xs={12} md={8}>
              <Statistic
                title={
                  <span className="text-xs text-slate-500">
                    <TeamOutlined /> Công ty
                  </span>
                }
                value={safeText(topic?.company_name)}
                valueStyle={{ fontSize: 16 }}
              />
            </Col>
            <Col xs={12} md={8}>
              <Statistic
                title={
                  <span className="text-xs text-slate-500">
                    <UserOutlined /> GV
                  </span>
                }
                value={safeText(gv?.lecturer_code)}
                valueStyle={{ fontSize: 16 }}
              />
            </Col>
            <Col xs={24} md={8}>
              <Statistic
                title={
                  <span className="text-xs text-slate-500">
                    <EnvironmentOutlined /> Địa chỉ
                  </span>
                }
                value={safeText(topic?.company_address)}
                valueStyle={{ fontSize: 14 }}
              />
            </Col>
          </Row>
        </KpiCard>

        <Card
          className="border border-slate-200 shadow-sm"
          title="Mô tả đề tài"
        >
          <Paragraph
            className="mb-0! text-sm text-slate-600"
            ellipsis={{ rows: 4, expandable: true, symbol: "Xem thêm" }}
          >
            {topic?.description ? topic.description : "Không có mô tả."}
          </Paragraph>
        </Card>
      </div>
    );
  }, [registration]);

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader
          title="Hồ sơ thực tập"
          subtitle="Theo dõi trạng thái duyệt đề tài và thông tin kỳ thực tập của bạn."
        />
        <div className="mt-6 flex justify-center">
          <Spin />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      <PageHeader
        title="Hồ sơ thực tập"
        subtitle="Theo dõi trạng thái duyệt đề tài và thông tin kỳ thực tập của bạn."
      />

      {hasInternship && internshipView}

      {!hasInternship && isPending && pendingView}

      {!hasInternship && isRejected && (
        <Alert
          type="error"
          showIcon
          message="Đề tài thực tập của bạn đã bị từ chối"
          description="Vui lòng đăng ký một đề tài khác hoặc liên hệ giảng viên phụ trách."
          className="shadow-sm"
        />
      )}

      {!hasInternship && nothing && (
        <Card className="border border-slate-200 shadow-sm">
          <Empty
            description={
              <div className="text-sm text-slate-700">
                Bạn chưa có hồ sơ thực tập nào. Hãy vào mục{" "}
                <span className="font-semibold">Danh sách đề tài</span> để đăng
                ký.
              </div>
            }
          />
        </Card>
      )}
    </div>
  );
};

export default StudentInternshipProfilePage;
