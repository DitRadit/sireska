import { Link } from 'react-router-dom'
import logoPutih from '../assets/logoPutih.png'
import sideImage from '../assets/Side Image.png' 

const Login = () => {
  return (
    <div className="flex w-full h-screen bg-white font-sans overflow-hidden">
      
      <div className="hidden md:flex w-1/2 p-4">
        <div 
          className="w-full h-full bg-cover rounded-xl bg-center flex items-center justify-center relative" 
          style={{ backgroundImage: `url('${sideImage}')` }}
        >
          <img src={logoPutih} alt="Logo SiResKa" className="w-80 h-auto relative z-10" />
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative p-8">
        
        <button className="absolute top-8 right-8 text-2xl font-bold text-black hover:text-gray-600">
          &lt;
        </button>

        <div className="w-full max-w-sm flex flex-col">
          
          <h2 className="text-[#ff6b2c] text-4xl font-bold mb-3">Hello Again!</h2>
          <p className="text-gray-500 text-xs font-light mb-8 leading-relaxed pr-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          </p>

          <div className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-800">Your email</label>
              <input 
                type="email" 
                placeholder="email@gmail.com" 
                className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-800">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="password" 
                  className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:border-[#ff6b2c] text-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer text-sm">
                  👁️
                </span>
              </div>
            </div>

          </div>

          <button className="w-full py-3 bg-[#ff6b2c] hover:bg-[#e85a1f] text-white font-semibold rounded-lg mt-8 transition-colors shadow-md shadow-orange-500/20">
            Login
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-[11px] text-gray-400 font-medium">or continue with</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button className="flex items-center justify-center w-10 h-10 mx-auto bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <span className="text-sm font-bold text-gray-600">G</span>
          </button>

          <div className="text-center mt-8 text-xs font-semibold text-gray-500">
            Doesn't have an account?{' '}
            <Link to="/register" className="text-[#ff6b2c] hover:underline">
              Sign Up
            </Link>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Login