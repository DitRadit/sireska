import { Link } from 'react-router-dom'
import '../styles/auth.css'

const Register = () => {
  return (
    <div className="auth-container">
      
      {/* LEFT */}
      <div className="auth-left">
        <h1>SIRESKA</h1>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <div className="auth-box">
          <h2>Create an account</h2>
          <p>Lorem ipsum dolor sit amet</p>

          <input type="text" placeholder="Your name" />
          <input type="text" placeholder="Student ID (optional)" />
          <input type="email" placeholder="Your email" />
          <input type="password" placeholder="Create password" />

          <button>Sign Up</button>

          <div className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Register