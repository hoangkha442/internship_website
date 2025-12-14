import { useNavigate } from 'react-router-dom'
import notFoundPicture from '../../../assets/notfoundpage.png'

type Props = {}

export default function NotFoundPage({}: Props) {
  const navigate = useNavigate()

  const handleBackHome = () => {
    navigate('/')
  }

  return (
    <section className="relative w-screen h-screen overflow-hidden bg-slate-900">
      <div className="pointer-events-none absolute inset-0 z-0 flex justify-center items-center">
        <img
          src={notFoundPicture}
          alt="Trang không tồn tại"
          className="w-screen h-screen object-contain opacity-80"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 bg-slate-900/40" />

      {/* NỘI DUNG TEXT BÊN TRÁI */}
      <div className="relative z-50 w-full h-full flex items-center px-4 md:px-10">
        <div className="max-w-xl space-y-4">
          <p className="text-sm font-semibold tracking-wider text-primary uppercase">
            Oops...
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Không tìm thấy trang bạn yêu cầu
          </h1>

          <p className="text-sm md:text-base text-slate-100/90 leading-relaxed">
            Có thể đường dẫn đã bị thay đổi, bị xóa, hoặc bạn đã nhập sai URL.
            Hãy kiểm tra lại đường dẫn hoặc quay lại trang chủ để tiếp tục sử dụng hệ thống.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handleBackHome}
              className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer"
            >
              Trở về trang chủ
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-slate-300 bg-white/90 text-sm font-medium text-slate-800 hover:bg-white transition-all cursor-pointer"
            >
              Quay lại trang trước
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
