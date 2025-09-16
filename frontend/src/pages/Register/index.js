import './index.css';

import { useState } from 'react';
import { useHistory,Redirect,Link } from 'react-router-dom';
import Cookies from 'js-cookie';

const Register = () => {
    const history = useHistory();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); 
    const token = Cookies.get('token');

    const handleRegister = async(e) =>{
        e.preventDefault();
        
        const response = await fetch('http://localhost:4000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            setError("Register successfully");
            setTimeout(() => {
                Cookies.set('token', data.token);
                history.push('/');
                setError('');
            }, 3000);
        }else{
            setError(data.error);
        }
        setName('');
        setEmail('');
        setPassword('');
        
    }

    if (token) {
        return <Redirect to="/" />;
    }

    return(
        <div className="register-container">
        <h2>Register</h2>
        <form onSubmit={handleRegister} className="register-form">
          <input 
            type="text" 
            placeholder="Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required
          />
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
          <button type="submit">Register</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="register-para">Already have an account?<Link to="/login" className="register-link">
           Login
        </Link></p>
      </div>
      
    )
}

export default Register;