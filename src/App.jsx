import { Routes, Route, Navigate } from "react-router-dom";
import { tenant } from "./tenant";

// Super Admin pages
import SuperAdminLogin from "./pages/SuperAdmin/Login";
import Dashboard from "./pages/SuperAdmin/Dashboard";
import Home from "./pages/SuperAdmin/Home";
import ClinicRequest from "./pages/SuperAdmin/ClinicRequest";
import ClinicInfos from "./pages/SuperAdmin/ClinicInfos";

// Other pages
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";

// Components
import Navbar from "./components/Navbar/Navbar";
import SuperAdminNavbar from "./components/Navbar/SuperAdminNavbar";
import Footer from "./components/Footer/Footer";
import { useAuth } from "./context/authContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

export default function App() {
  const onRoot = !tenant; // root domain or localhost  
  const { user, loading } = useAuth();

  return (
    <>
      <Toaster />
      { user && !loading && user.role === "SUPER_ADMIN" ?
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

        <Route path="/__superadmin/*" element={<Navigate to="/__superadmin/login" replace />} />
      
      {onRoot ? (
        <>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
   
        </>
      ) : (
        // Ici plus tard: routes pour la clinique (login/inscription/espaces).
        <>
          <Route path="*" element={<Navigate to="/" replace />} />
          {/* placeholder clinic landing (à remplacer par la vraie app clinique) */}
          <Route path="/" element={<Landing clinicMode />} />
        </>
      )}
      </Routes>
      <Footer />
    </>
  );
}
