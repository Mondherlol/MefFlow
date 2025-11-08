import { Routes, Route, Navigate } from "react-router-dom";
import { tenant } from "./tenant";

// Super Admin pages
import SuperAdminLogin from "./pages/SuperAdmin/Login";
import Dashboard from "./pages/SuperAdmin/Dashboard";
import ClinicRequest from "./pages/SuperAdmin/ClinicRequest";
import ClinicInfos from "./pages/SuperAdmin/ClinicInfos";
import ManageAdmins from "./pages/SuperAdmin/ManageAdmins";

// Clinic pages
import Home from "./pages/Clinic/Home";
import Login from "./pages/Clinic/Login";
import SignUp from "./pages/Clinic/SignUp";

// Admin pages
import HomeAdmin from "./pages/Admin/Home";

// Other pages
import Landing from "./pages/Landing";
import StartClinic from "./pages/StartClinic";
import NotFound from "./pages/NotFound";

// Components
import Navbar from "./components/Navbar/Navbar";
import SuperAdminNavbar from "./components/Navbar/SuperAdminNavbar";
import Footer from "./components/Footer/Footer";
import ClinicFooter from "./components/Footer/ClinicFooter";
import { useAuth } from "./context/authContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ClinicRoute from "./components/ClinicRoute";
import { Toaster } from "react-hot-toast";
import { useClinic } from "./context/clinicContext";

export default function App() {
  const onRoot = !tenant; // root domain or localhost
  const { user, loading: authLoading } = useAuth();

  return (
    <>
      <Toaster />
      { user && !authLoading && user.role === "SUPER_ADMIN" ?
        <SuperAdminNavbar /> :
        <Navbar />  
      }
      <Routes>

      <Route path="*" element={<NotFound />} />

      {/* Super Admin routes */}
        <Route path="/__superadmin/login" element={<SuperAdminLogin />} />
        <Route
          path="/__superadmin/dashboard"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route path="/__superadmin/clinic-request/:id" 
          element={
            <ProtectedRoute roles={["SUPER_ADMIN"]}>
              <ClinicRequest />
            </ProtectedRoute>
          } 
        />

        <Route path="/__superadmin/clinic-infos/:id" 
          element={
            <ProtectedRoute roles={["SUPER_ADMIN"]}>
              <ClinicInfos />
            </ProtectedRoute>
          } 
        />

        <Route path="/__superadmin/manage-admins/:id" element={
          <ProtectedRoute roles={["SUPER_ADMIN"]}>
            <ManageAdmins />
          </ProtectedRoute>
        } />

        <Route path="/__superadmin/*" element={<Navigate to="/__superadmin/login" replace />} />
      
      {onRoot ? (
        <>
          <Route path="/" element={<Landing />} />
          <Route path="/StartClinic" element={<StartClinic />} />
   
        </>
      ) : (
        // Routes pour les cliniques en sous-domaine 
              <>
                <Route path="/" element={
                  <ClinicRoute>
                    <Home/>
                  </ClinicRoute>
                } />

                <Route path="/login" element={
                  <ClinicRoute>
                    <Login />
                  </ClinicRoute>
                } />

                <Route path="/signup" element={
                  <ClinicRoute>
                    <SignUp />
                  </ClinicRoute>
                } />

              <Route path="/admin" element={
                <ClinicRoute>
                  <ProtectedRoute roles={["ADMIN"]} redirectTo="/login">
                    <HomeAdmin />
                  </ProtectedRoute>
                </ClinicRoute>
              } />
              </>
      )}
      </Routes>
      { onRoot ? <Footer /> : <ClinicFooter /> }
      
    </>
  );
}
