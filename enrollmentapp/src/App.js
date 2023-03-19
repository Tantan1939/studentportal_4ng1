import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";
import './App.css';
import './index.css'
import EnrollmentList from "./components/EnrollmentList";
import Header from './components/Header'
import NotePage from "./pages/NotePage";
import NotesListPage from './pages/NotesListPage'
import ForAdmissionStudents from "./components/admissionComponents/ForAdmissionStudents";
import ModalHandler from "./components/ModalHandler";
import HoverHandler from "./components/HoverHandler";

function App() {
  return (
    <Router>
      <div className="container">
        <div className="App">
          <Route path="/Registrar/Enrollment/" exact component={EnrollmentList} />
          {/* <Route path="/Registrar/Enrollment/" exact component={NotesListPage} /> */}
          {/* <Route path="/Registrar/Enrollment/Note/:id/" exact component={NotePage} /> */}
          <Route path="/Registrar/Admission/" exact component={ForAdmissionStudents} />

        </div>

      </div>
    </Router>
  );
}

export default App;
