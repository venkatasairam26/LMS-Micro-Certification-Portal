
import './App.css';
import { BrowserRouter as Router,Switch, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import ProtectedRoute from './ProtactedRoute';
import Login from './pages/Login';
import Quiz from './pages/Quiz';
function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
         <ProtectedRoute  exact path='/' component={Home} />
         <ProtectedRoute  exact path='/quiz' component={Quiz} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
