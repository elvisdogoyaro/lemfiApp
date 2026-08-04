import "./App.css";
import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Pin from "./pages/Pin";
import Otp from "./pages/Otp";

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pin" element={<Pin />} />
           <Route path="/otp" element={<Otp />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
