import { useEffect, useMemo, useState } from "react";
import {
  App,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Space,
  Tag,
  Typography,
  Upload,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UserProfile } from "../types/user";
import { userApi, type UpdateMePayload } from "../../../services/userApi";


const { Text } = Typography;

type PasswordFormVM = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

export default function AccountPage() {
  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [me, setMe] = useState<UserProfile | null>(null);

  const [form] = Form.useForm<UpdateMePayload>();
  const [pwdForm] = Form.useForm<PasswordFormVM>();

  const role = me?.role;
  const student = me?.students?.[0] ?? null;
  const lecturer = me?.lecturers ?? null;

  const roleTag = useMemo(() => {
    if (!role) return <Tag>—</Tag>;
    if (role === "admin") return <Tag color="purple">Admin</Tag>;
    if (role === "lecturer") return <Tag color="blue">Giảng viên</Tag>;
    return <Tag color="green">Sinh viên</Tag>;
  }, [role]);

  const avatarSrc = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL;
    const u = me?.avatar_url;
    if (!u) return undefined;

    try {
      // u dạng "/uploads/avatars/xxx.png"
      return new URL(u, base).toString();
    } catch {
      return u;
    }
  }, [me?.avatar_url]);

  const loadMe = async () => {
    setLoading(true);
    try {
      const data = await userApi.me();
      setMe(data);

      form.setFieldsValue({
        full_name: data.full_name,
        phone:
          data.role === "student"
            ? (data.students?.[0]?.phone ?? "")
            : data.role === "lecturer"
              ? (data.lecturers?.phone ?? "")
              : "",
        department: data.role === "lecturer" ? (data.lecturers?.department ?? "") : undefined,
        class_id: data.role === "student" ? (data.students?.[0]?.class_id ?? undefined) : undefined,
      });
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không tải được thông tin tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============== AVATAR ==============
  const beforeUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      message.error("Chỉ cho phép file ảnh");
      return Upload.LIST_IGNORE;
    }
    if (file.size > 2 * 1024 * 1024) {
      message.error("Ảnh tối đa 2MB");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const uploadAvatar = async (file: File) => {
    setLoading(true);
    try {
      await userApi.uploadAvatar(file);
      message.success("Đã cập nhật avatar");
      await loadMe();
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Upload avatar thất bại");
    } finally {
      setLoading(false);
    }
  };

  const removeAvatar = async () => {
    setLoading(true);
    try {
      await userApi.removeAvatar();
      message.success("Đã xoá avatar");
      await loadMe();
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Xoá avatar thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ============== UPDATE PROFILE ==============
  const onSubmitProfile = async (values: UpdateMePayload) => {
    setLoading(true);
    try {
      const payload: UpdateMePayload = {
        full_name: values.full_name?.trim(),
      };

      if (role === "student") {
        payload.phone = values.phone?.trim();
        payload.class_id = values.class_id ? String(values.class_id) : "";
      }

      if (role === "lecturer") {
        payload.phone = values.phone?.trim();
        payload.department = values.department?.trim();
      }

      await userApi.updateMe(payload);

      message.success("Cập nhật hồ sơ thành công");
      await loadMe();
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ============== UPDATE PASSWORD ==============
  const onSubmitPassword = async (values: PasswordFormVM) => {
    if (values.new_password !== values.confirm_password) {
      message.error("Xác nhận mật khẩu không khớp");
      return;
    }

    setLoadingPwd(true);
    try {
      await userApi.updatePassword({
        old_password: values.old_password,
        new_password: values.new_password,
      });

      message.success("Đổi mật khẩu thành công");
      pwdForm.resetFields();
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoadingPwd(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* HEADER + AVATAR */}
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Avatar size={56} src={avatarSrc}>
              {me?.full_name?.[0]?.toUpperCase() ?? "U"}
            </Avatar>

            <div>
              <div className="text-xl font-semibold text-slate-900">Tài khoản của tôi</div>
              <div className="text-xs text-slate-500 mt-1">
                {roleTag}{" "}
                {me?.email ? (
                  <span>
                    · <b className="text-slate-700">{me.email}</b>
                  </span>
                ) : null}
              </div>

              <Space wrap className="mt-2">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  customRequest={async (opt) => {
                    const f = opt.file as File;
                    await uploadAvatar(f);
                    opt.onSuccess?.({}, new XMLHttpRequest());
                  }}
                >
                  <Button icon={<UploadOutlined />} loading={loading}>
                    Tải avatar
                  </Button>
                </Upload>

                <Button
                  icon={<DeleteOutlined />}
                  danger
                  disabled={!me?.avatar_url}
                  onClick={removeAvatar}
                  loading={loading}
                >
                  Xoá avatar
                </Button>
              </Space>
            </div>
          </div>

          <Button onClick={loadMe} loading={loading}>
            Reload
          </Button>
        </div>
      </Card>

      {/* UPDATE PROFILE */}
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
        <div className="text-lg font-semibold text-slate-900">Cập nhật hồ sơ</div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmitProfile}
          disabled={loading}
          className="mt-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item
              name="full_name"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item label="Email">
              <Input value={me?.email ?? ""} disabled />
            </Form.Item>

            {role === "student" && (
              <>
                <Form.Item label="Mã sinh viên">
                  <Input value={student?.student_code ?? ""} disabled />
                </Form.Item>

                <Form.Item name="phone" label="Số điện thoại">
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item name="class_id" label="Class ID">
                  <Input placeholder="VD: 1" />
                </Form.Item>

                <Form.Item label="Lớp hiện tại">
                  <Input
                    value={
                      student?.classes
                        ? `${student.classes.class_code} · ${student.classes.class_name}`
                        : ""
                    }
                    disabled
                  />
                </Form.Item>
              </>
            )}

            {role === "lecturer" && (
              <>
                <Form.Item label="Mã giảng viên">
                  <Input value={lecturer?.lecturer_code ?? ""} disabled />
                </Form.Item>

                <Form.Item name="phone" label="Số điện thoại">
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item name="department" label="Bộ môn / Khoa">
                  <Input placeholder="Nhập bộ môn/khoa" />
                </Form.Item>
              </>
            )}

            {role === "admin" && (
              <div className="md:col-span-2">
                <Text type="secondary">
                  Admin chỉ cập nhật họ tên ở trang này.
                </Text>
              </div>
            )}
          </div>

          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu thay đổi
          </Button>
        </Form>
      </Card>

      {/* UPDATE PASSWORD */}
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
        <div className="text-lg font-semibold text-slate-900">Đổi mật khẩu</div>

        <Form
          form={pwdForm}
          layout="vertical"
          onFinish={onSubmitPassword}
          disabled={loadingPwd}
          className="mt-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Form.Item
              name="old_password"
              label="Mật khẩu cũ"
              rules={[{ required: true, message: "Nhập mật khẩu cũ" }]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>

            <Form.Item
              name="new_password"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: "Nhập mật khẩu mới" },
                { min: 6, message: "Tối thiểu 6 ký tự" },
              ]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label="Xác nhận mật khẩu mới"
              dependencies={["new_password"]}
              rules={[
                { required: true, message: "Nhập lại mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("new_password") === value) return Promise.resolve();
                    return Promise.reject(new Error("Xác nhận mật khẩu không khớp"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>
          </div>

          <Button type="primary" htmlType="submit" loading={loadingPwd}>
            Đổi mật khẩu
          </Button>
        </Form>
      </Card>
    </div>
  );
}
