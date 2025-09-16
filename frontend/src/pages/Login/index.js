import './index.css';

import { useState } from 'react';
import { useHistory,Link,Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';

const Login = () =>{
    const history = useHistory();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const token = Cookies.get('token');
    

    const handleLogin = async (e) => {
        e.preventDefault();
        
        
        try {
            const response = await fetch('http://localhost:4000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                Cookies.set('token', data.token);
                history.push('/');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Network error');
        }
    }
    
    if (token) {
        return <Redirect to="/" />;
    }

    return (
        <div className="login-container">
  <h2>Login</h2>
  <form onSubmit={handleLogin} className="login-form">
    <input 
      type="email" 
      placeholder="Email" 
      value={email} 
      onChange={(e) => setEmail(e.target.value)} 
      required
    />
    <input 
      type="password" 
      placeholder="Password" 
      value={password} 
      onChange={(e) => setPassword(e.target.value)} 
      required
    />
    <button type="submit">Login</button>
  </form>
  {error && <p className="error">{error}</p>}
  <p className="register-para">Don't have an account?<Link to="/register" className="register-link">
     Register
  </Link></p>
</div>

    );
}

export default Login;