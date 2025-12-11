import { useAuth } from "../../shared/hooks/useAuth";
import { useNotification } from "../../../provider/Notification";
import { useState } from "react";

import {
  UserOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const { login} = useAuth();
  const { notify } = useNotification();

  // const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);

      const email = (formData.get("email") || "").toString().trim();
      const password = (formData.get("password") || "").toString().trim();

      if (!email || !password) {
        notify("error", "Vui lòng nhập đầy đủ thông tin");
        return;
      }

      await login({ email, password });
      notify("success", "Đăng nhập thành công");

      
    } catch (err: any) {
      const msg =
        typeof err === "string"
          ? err
          : err?.message || "Sai email hoặc mật khẩu";

      notify("error", msg);
    }
  };

  return (
    <form className="flex flex-col gap-y-6" onSubmit={onSubmit}>
      {/* EMAIL FIELD */}
      <label className="flex flex-col w-full">
        <p className="text-gray-900 text-sm font-medium pb-2">Email</p>

        <div className="relative flex items-center">
          <UserOutlined className="absolute left-4 text-gray-400! text-lg" />
          <input
            name="email"
            placeholder="Enter your email"
            className="w-full rounded-lg h-14 pl-12 pr-4 border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-blue-500/50 outline-none"
          />
        </div>
      </label>

      {/* PASSWORD FIELD */}
      <label className="flex flex-col w-full">
        <p className="text-gray-900 text-sm font-medium pb-2">Password</p>

        <div className="relative flex items-center">
          <LockOutlined className="absolute left-4 text-gray-400! text-lg" />

          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="bg-gray-100 w-full rounded-lg h-14 pl-12 pr-12 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500/50 outline-none"
          />

          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {showPassword ? (
              <EyeInvisibleOutlined className="text-xl" />
            ) : (
              <EyeOutlined className="text-xl" />
            )}
          </button>
        </div>
      </label>

      {/* FORGOT PASSWORD */}
      <div className="flex justify-end -mt-3">
        <a
          className="text-sm font-medium text-blue-600! hover:text-blue-800! transition-all! duration-500! cursor-pointer"
          onClick={() => { 
            notify("warning", "Tính năng chưa được phát triển!");
           }}
        >
          Forgot Password?
        </a>
      </div>

      {/* LOGIN BUTTON */}
      <button
        type="submit"
        className="flex items-center justify-center h-14 w-full rounded-lg bg-blue-600 text-white text-base font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-600/60 cursor-pointer transition-all duration-300"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
