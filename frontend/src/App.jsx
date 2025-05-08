import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Eror404 from "./pages/notFound";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Catch-all route for 404 */}
        <Route path="*" element={<Eror404 />} />
      </Routes>
    </Router>
  )
}

export default App
