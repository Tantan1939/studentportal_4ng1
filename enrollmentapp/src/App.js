import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";
import './App.css';
import './index.css'
import ForAdmissionStudents from "./components/admissionComponents/ForAdmissionStudents";
import EnrollmentBatch from "./components/enrollmentComponents/EnrollmentBatch";
import RenderSchoolYears from "./components/schoolYears/RenderSchoolYears";
import YearLevelComponent from "./components/schoolYears/renderComponents/YearLevelComponent";

function App() {
  return (
    <Router>
      <div className="container">
        <div className="App">
          <Route path="/Registrar/Admission/" exact component={ForAdmissionStudents} />
          <Route path="/Registrar/Enrollment/" exact component={EnrollmentBatch} />
          <Route path="/Registrar/schoolyear/View/" exact component={RenderSchoolYears} />
          <Route path='/Registrar/schoolyear/View/YearLevel/' exact component={YearLevelComponent} />
        </div>
      </div>
    </Router>
  );
}

export default App;
