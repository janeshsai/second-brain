import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Bookmarks from './pages/Bookmarks';
import Habits from './pages/Habits';
import CalendarPage from './pages/Calendar';
import Learning from './pages/Learning';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={
          <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
        } />
        <Route path="/notes" element={
          <ProtectedRoute><AppLayout><Notes /></AppLayout></ProtectedRoute>
        } />
        <Route path="/bookmarks" element={
          <ProtectedRoute><AppLayout><Bookmarks /></AppLayout></ProtectedRoute>
        } />
        <Route path="/habits" element={
          <ProtectedRoute><AppLayout><Habits /></AppLayout></ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute><AppLayout><CalendarPage /></AppLayout></ProtectedRoute>
        } />
        <Route path="/learning" element={
          <ProtectedRoute><AppLayout><Learning /></AppLayout></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
