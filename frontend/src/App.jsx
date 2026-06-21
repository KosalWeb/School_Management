import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Layout and Common Components
import Layout from './components/Layout';
import PrivateRoute from './components/common/PrivateRoute'; // Assuming this checks if user is logged in
import ProtectedRoute from './components/ProtectedRoute';   // This checks user role

// Page Components
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SchoolsPage from './pages/SchoolsPage';
import TeachersPage from './pages/TeachersPage';
import StudentsPage from './pages/StudentsPage';
import ClassesPage from './pages/ClassesPage';
import SubjectsPage from './pages/SubjectsPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import TeacherAttendancePage from './pages/TeacherAttendancePage';
import StudentAttendancePage from './pages/StudentAttendancePage';
import ReportPage from './pages/ReportPage';
import TeacherAttendanceReportPage from './pages/TeacherAttendanceReportPage';
import StudentAttendanceReportPage from './pages/StudentAttendanceReportPage';
import StudentScorePage from './pages/StudentScorePage';
import StudentScoreListPage from './pages/StudentScoreListPage';
import HonorTablePage from './pages/HonorTablePage';

function App() {
  return (
    <ThemeProvider>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>

        {/* --- General Routes (Accessible to all logged-in users) --- */}
        <Route index element={<DashboardPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="attendance" element={<TeacherAttendancePage />} />
        <Route path="student-attendance" element={<StudentAttendancePage />} />
        <Route path="honor-table" element={<HonorTablePage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* --- Admin-Only Routes --- */}
        {/* These routes are wrapped and will only be accessible to the roles defined below. */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin', 'school-admin']} />}>
          <Route path="schools" element={<SchoolsPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="reports" element={<ReportPage />} />
          <Route path="teacher-attendance-report" element={<TeacherAttendanceReportPage />} />
          <Route path="student-attendance-report" element={<StudentAttendanceReportPage />} />
          <Route path="student-score" element={<StudentScorePage />} />
          <Route path="student-score-list" element={<StudentScoreListPage />} />
        </Route>

      </Route>
    </Routes>
    </ThemeProvider>
  );
}

export default App;