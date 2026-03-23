// import DefaultPage from "./pages/index";
import { Provider } from 'react-redux';
import {RegisterPage}  from './pages/RegisterPage';
// import { store } from './components/store';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalysticsPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';
function App() {

  return (
    <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
               <Route path="tasks" element={<TasksPage />} />
              {/* <Route path="kanban" element={<KanbanPage />} /> */}
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="team" element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <TeamPage />
                </ProtectedRoute>
              } /> 
               <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
  
      // <Routes>
      //   <Route path="/register" element={<RegisterPage/>} />
      //   <Route path="/" element={<RegisterPage />} />
      //   <Route path="/login" element={<LoginPage />} />
      //   <Route path="/dashboard" element={<DashboardPage/>} />     
      // </Routes> 

  )
}

export default App;
