import { Link } from 'react-router-dom'
import '../styles/auth.css'

const Login = () => {
  return (
    <div className="auth-container">

      {/* LEFT */}
      <div className="auth-left">
        <h1>SIRESKA</h1>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <div className="auth-box">
          <h2>Hello Again!</h2>
          <p>Lorem ipsum dolor sit amet</p>

          <input type="email" placeholder="Your email" />
          <input type="password" placeholder="Password" />

          <button>Login</button>

          <div className="auth-link">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Login