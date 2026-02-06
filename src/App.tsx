import { Route, Routes, Navigate } from 'react-router-dom'
import Navbar from './Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import MultiStepForm from './pages/MultiStepForm'
import { ToastContainer } from 'react-toastify';
import EditUser from './pages/EditUser'
import AdminSubjects from './pages/ManageSubjects' 
import ProtectedRoute from './reusable/ProtectedRoute' 
import { AuthProvider } from './context/AuthContext' 

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <ToastContainer />
      <div className="container-fluid">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<MultiStepForm/>} />
    
          {/* --- PROTECTED ROUTES (Any logged-in user) --- */}
          {/* Note: No allowedRoles passed means any valid token can enter */}
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<Home />} />
            <Route path='/edit' element={<EditUser />} />
          </Route>
          
          {/* --- ADMIN ONLY ROUTES --- */}
          {/* Use both variations to be safe, or match your Backend exactly */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "ROLE_admin", "ADMIN", "ROLE_ADMIN"]} />}>
            <Route path='/admin/subjects' element={<AdminSubjects />} />
          </Route>

          {/* --- FALLBACK --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App