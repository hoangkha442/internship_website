import LoginForm from '../components/LoginForm'
import bgLogin from '../../../assets/loginbg.png'
import {
  ReadOutlined
} from '@ant-design/icons'

const LoginPage = () => {
  return (
    <section className='w-full'>
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-gray-100 ">
      <div className="flex flex-1 justify-center items-stretch">
        <div className="flex flex-col w-full">
          <div className="grid flex-1 lg:grid-cols-2">
            <div className="relative hidden lg:flex items-center justify-center bg-gray-900">
              <div
                className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-cover opacity-50"
                style={{
                  backgroundImage:
                    `url(${bgLogin})`,
                }}
              ></div>
              <div className="relative z-10 p-12 text-white text-center">
                <h2 className="text-4xl font-bold mb-4">
                  Internship Management Portal
                </h2>
                <p className="text-lg text-gray-200">
                  Streamlining connections between students, lecturers, and
                  industry partners.
                </p>
              </div>
            </div>
            <div className="w-full flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gray-200">
              <div className="max-w-md w-full mx-auto">
                <div className="flex justify-center mb-8">
                  <div className="flex items-center gap-3">
                    <ReadOutlined className="text-4xl text-blue-600!"/>
                    <span className="text-2xl font-bold text-gray-800">
                      IT Faculty
                    </span>
                  </div>
                </div>
                <div className="text-center mb-8">
                  <h1 className="text-gray-900  text-3xl font-bold">
                    Welcome Back
                  </h1>
                  <p className="text-gray-500 pt-2 font-medium">
                    Please enter your credentials to access your account.
                  </p>
                </div>
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </section>
    
  )
}

export default LoginPage
