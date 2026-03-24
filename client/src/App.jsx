import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentAnalytics from './pages/StudentAnalytics';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminFaculties from './pages/admin/AdminFaculties';
import AdminMappings from './pages/admin/AdminMappings';
import AdminLeaves from './pages/admin/AdminLeaves';
import GPSchedule from './pages/admin/GPSchedule';
import AcademicCalendar from './pages/admin/AcademicCalendar';
import Profile from './pages/Profile';
import NotificationPage from './pages/NotificationPage';
import ApplyLeave from './pages/ApplyLeave';
import DomainDashboard from './pages/DomainDashboard';
import EventManagement from './pages/EventManagement';
import ParentApprovePage from './pages/ParentApprovePage';
import LeaveBlockPage from './pages/LeaveBlockPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/student/dashboard" element={<StudentAnalytics />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/apply-leave" element={<ApplyLeave />} />
                <Route path="/parent-approve/:id" element={<ParentApprovePage />} />
                <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
                <Route path="/placement-cell-dashboard" element={<DomainDashboard />} />
                <Route path="/clubs-dashboard" element={<DomainDashboard />} />
                <Route path="/iecc-dashboard" element={<DomainDashboard />} />
                <Route path="/placement-cell/schedule" element={<EventManagement />} />
                <Route path="/clubs/schedule" element={<EventManagement />} />
                <Route path="/iecc/schedule" element={<EventManagement />} />

                {/* Admin Routes */}
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin/students" element={<AdminStudents />} />
                <Route path="/admin/faculties" element={<AdminFaculties />} />
                <Route path="/admin/assign-faculty" element={<AdminMappings />} />
                <Route path="/admin/leaves" element={<AdminLeaves />} />
                <Route path="/admin/gp-schedule" element={<GPSchedule />} />
                <Route path="/admin/academic-calendar" element={<AcademicCalendar />} />
                <Route path="/admin/leave-block" element={<LeaveBlockPage />} />
                <Route path="/faculty/leave-block" element={<LeaveBlockPage />} />

                <Route path="/notifications" element={<NotificationPage />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Router>
          </ToastProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
