import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";
import './App.css';
import EnrollmentList from "./components/EnrollmentList";
import Header from './components/Header'
import NotePage from "./pages/NotePage";
import NotesListPage from './pages/NotesListPage'

function App() {
  return (
    <Router>
      <div className="container">
        <div className="App">
          <Route path="/Registrar/Enrollment/" exact component={EnrollmentList} />
          {/* <Route path="/Registrar/Enrollment/" exact component={NotesListPage} /> */}
          {/* <Route path="/Registrar/Enrollment/Note/:id/" exact component={NotePage} /> */}
        </div>

      </div>
    </Router>
  );
}

export default App;
