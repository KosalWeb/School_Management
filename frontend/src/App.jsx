import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Layout and Common Components
import Layout from './components/Layout';
import PrivateRoute from './components/common/PrivateRoute';
import ProtectedRoute from './components/ProtectedRoute';
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
import ReportCardPage from './pages/ReportCardPage';
import StudentPromotionPage from './pages/StudentPromotionPage';
import DisciplineRecordsPage from './pages/DisciplineRecordsPage';
import EventCalendarPage from './pages/EventCalendarPage';
import ExamSchedulePage from './pages/ExamSchedulePage';
import NotificationsPage from './pages/NotificationsPage';
import StudentIDCardPage from './pages/StudentIDCardPage';
import TeacherEvaluationPage from './pages/TeacherEvaluationPage';
import TimetablePage from './pages/TimetablePage';
import FeeTypesPage from './pages/FeeTypesPage';
import FeePaymentsPage from './pages/FeePaymentsPage';

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
          <Route path="profile" element={<ProfilePage />} />
          <Route path="timetable" element={<TimetablePage />} />
          <Route path="fee-payments" element={<FeePaymentsPage />} />
          <Route path="report-card" element={<ReportCardPage />} />
          <Route path="student-promotion" element={<StudentPromotionPage />} />
          <Route path="discipline" element={<DisciplineRecordsPage />} />
          <Route path="event-calendar" element={<EventCalendarPage />} />
          <Route path="exam-schedule" element={<ExamSchedulePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="student-id-card" element={<StudentIDCardPage />} />
          <Route path="teacher-evaluation" element={<TeacherEvaluationPage />} />

          {/* --- Admin-Only Routes --- */}
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
            <Route path="student-score-list" element={<StudentScorePage />} />
            <Route path="monthly-result" element={<StudentScorePage />} />
            <Route path="fee" element={<FeeTypesPage />} />
          </Route>

        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;