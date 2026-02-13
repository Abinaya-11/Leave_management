import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminFaculties from './pages/admin/AdminFaculties';
import NotificationPage from './pages/NotificationPage';
import ApplyLeave from './pages/ApplyLeave';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/apply-leave" element={<ApplyLeave />} />
                <Route path="/faculty-dashboard" element={<FacultyDashboard />} />

                {/* Admin Routes */}
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin/students" element={<AdminStudents />} />
                <Route path="/admin/faculties" element={<AdminFaculties />} />

                <Route path="/notifications" element={<NotificationPage />} />
              </Routes>
            </Router>
          </ToastProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
