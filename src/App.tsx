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
import UserFinder from './pages/UserFinder'
import SeeProfile from './pages/SeeProfile'
import SeeRequests from './pages/SeeRequest'
import ForgotPassword from './pages/ForgotPasswordEmail'
import ResetPassword from './pages/ResetPassword'
import ListUsersAdmin from './pages/ListUsers'
import AuditTable from './pages/Logs'
import AdminValidation from './pages/AdminValidation'
import BecomeMentorForm from './pages/BecomeMentorForm'
import ManageAvailability from './pages/ManageAvailability'
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
          <Route path='/seeProfile/:id' element={<SeeProfile />} />
          <Route path='/forgotPassword' element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* --- PROTECTED ROUTES (Any logged-in user) --- */}
          {/* Note: No allowedRoles passed means any valid token can enter */}
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<Home />} />
            <Route path='/edit' element={<EditUser />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={["mentor", "student"]}/>}>
            <Route path='/findMentor' element={<UserFinder />} />
            <Route path='/seeRequests' element={<SeeRequests />} />
            <Route path="/become-mentor" element={<BecomeMentorForm />} />
            <Route path="/subjects" element={<AdminSubjects />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["mentor"]}/>}>
            <Route path='/findMentor' element={<UserFinder />} />
            <Route path='/seeRequests' element={<SeeRequests />} />
            <Route path="/availability" element={<ManageAvailability />} />

          </Route>

          {/* --- ADMIN ONLY ROUTES --- */}
          {/* Use both variations to be safe, or match your Backend exactly */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "ROLE_admin", "ADMIN", "ROLE_ADMIN"]} />}>
            <Route path='/admin/subjects' element={<AdminSubjects />} />
            <Route path='/admin/listUsers' element={<ListUsersAdmin />}></Route>
            <Route path='/admin/logs' element={<AuditTable />} />
            <Route path="/admin/requests" element={<AdminValidation />} />
          </Route>

          {/* --- FALLBACK --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App