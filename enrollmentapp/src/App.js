import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";
import './App.css';
import './index.css'
import ForAdmissionStudents from "./components/admissionComponents/ForAdmissionStudents";
import EnrollmentBatch from "./components/enrollmentComponents/EnrollmentBatch";

function App() {
  return (
    <Router>
      <div className="container">
        <div className="App">
          <Route path="/Registrar/Admission/" exact component={ForAdmissionStudents} />
          <Route path="/Registrar/Enrollment/" exact component={EnrollmentBatch} />
        </div>
      </div>
    </Router>
  );
}

export default App;
