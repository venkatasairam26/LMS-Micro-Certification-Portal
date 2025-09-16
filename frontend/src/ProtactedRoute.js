import { useHistory, Link, Route, Redirect } from "react-router-dom";
import Cookies from "js-cookie";
import NavBar from './components/NavBar';
const ProtectedRoute = (props) => {
    const token = Cookies.get('token');
    const history = useHistory();
    if (!token) {
        return <Redirect to="/login" />;
    }
    return <>
    <NavBar />
    <Route {...props} />
    </>
}
export default ProtectedRoute;
