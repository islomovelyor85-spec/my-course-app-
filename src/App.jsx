import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { RequireAuth, RequireAdmin } from './components/auth/ProtectedRoute'
import AdminGate from './components/admin/AdminGate'
import { initTelegramApp } from './lib/telegram'

import StudentLayout from './components/layout/StudentLayout'
import AdminLayout from './components/layout/AdminLayout'
import LoadingSpinner from './components/common/LoadingSpinner'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import Home from './pages/student/Home'
import MyCourse from './pages/student/MyCourse'
import LessonView from './pages/student/LessonView'
import Tasks from './pages/student/Tasks'
import TaskSubmit from './pages/student/TaskSubmit'
import ProgressPage from './pages/student/Progress'
import Profile from './pages/student/Profile'

import Dashboard from './pages/admin/Dashboard'
import CourseManager from './pages/admin/CourseManager'
import StudentsTracking from './pages/admin/StudentsTracking'
import SubmissionsReview from './pages/admin/SubmissionsReview'
import PaymentsReview from './pages/admin/PaymentsReview'

function AuthGate({ children }) {
 
  // Telegram Mini App ichida bo'lsa ham, oddiy brauzerda bo'lsa ham,
  // dastlabki sessiya tekshiruvi tugaguncha kutamiz.
  const { loading } = useAuth()
  if (loading) return <LoadingSpinner fullscreen label="Ilova ishga tushmoqda..." />
  return children
}

function AppRoutes() {
  return (
    <AuthGate>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* O'quvchi paneli */}
        <Route
          element={
            <RequireAuth>
              <StudentLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/course" element={<MyCourse />} />
          <Route path="/course/lesson/:lessonId" element={<LessonView />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/submit/:lessonId" element={<TaskSubmit />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin (ustoz) paneli — role='admin' TEKSHIRUVI + qo'shimcha parol eshigi (admin123) */}
        <Route
          element={
            <RequireAdmin>
              <AdminGate>
                <AdminLayout />
              </AdminGate>
            </RequireAdmin>
          }
        >
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/courses" element={<CourseManager />} />
          <Route path="/admin/students" element={<StudentsTracking />} />
          <Route path="/admin/submissions" element={<SubmissionsReview />} />
          <Route path="/admin/payments" element={<PaymentsReview />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthGate>
  )
}

export default function App() {
  useEffect(() => {
    initTelegramApp()
  }, [])

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
