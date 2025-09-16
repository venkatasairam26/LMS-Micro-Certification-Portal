import { Link, useHistory } from "react-router-dom";
import Cookies from "js-cookie";
import './index.css';

const NavBar = () =>{
    const history = useHistory();
    const handleLogout = () => {
        Cookies.remove('token');
        history.push('/login');
    }
    return(
    <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/quiz">Quiz</Link>
        <button onClick={handleLogout}>Logout</button>
    </nav>
)
}

export default NavBar;