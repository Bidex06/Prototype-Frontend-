import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateBot from './pages/CreateBot';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import ProtectedRoute from './components/common/ProtectedRoute';
function App() { 
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#14141e', color: '#e0e0e0' } }} />
     <Routes>
  <Route path="/login" element={<Login />} />

  <Route path="/register" element={<Register />} />

  <Route
    path="/"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/create-bot"
    element={
      <ProtectedRoute>
        <CreateBot />
      </ProtectedRoute>
    }
  />

  {/* Analytics */}
  <Route
    path="/analytics"
    element={
      <ProtectedRoute>
        <Analytics />
      </ProtectedRoute>
    }
  />

  {/* Analytics for a specific bot */}
  <Route
    path="/analytics/:botId"
    element={
      <ProtectedRoute>
        <Analytics />
      </ProtectedRoute>
    }
  />

  {/* Settings */}
  <Route
    path="/settings"
    element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin"
    element={
      <ProtectedRoute adminOnly>
        <Admin />
      </ProtectedRoute>
    }
  />
</Routes>
    </BrowserRouter>
  );
}

export default App;