import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Eror404 from "./pages/notFound";
import ManageCreate from "./pages/ManageCreate";
import TaskEdit from "./pages/EditTask";
import TaskCreate from "./pages/TaskCreate";
import Setting from "./pages/Setting";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manage-task" element={<ManageCreate />} />
        <Route path="/tasks/edit/:id" element={<TaskEdit />} />
        <Route path="/tasks/create" element={<TaskCreate />} />
        <Route path="/settings" element={<Setting />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<Eror404 />} />
      </Routes>
    </Router>
  )
}

export default App
