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
import Contact from "./pages/Clinic/Contact";

// Admin pages
import HomeAdmin from "./pages/Admin/Home";
import Receptionnistes from "./pages/Admin/Receptionnistes";
import Medecins from "./pages/Admin/Medecins";
import Patients from "./pages/Admin/Patients";
import ClinicInfo from "./pages/Admin/ClinicInfo";
import Services from "./pages/Admin/Services";
import Tarifs from "./pages/Admin/Tarifs";
import StripeBilling from "./pages/Admin/StripeBilling";
import Factures from "./pages/Admin/Factures";
import CustomHome from "./pages/Admin/Clinic/CustomHome";
import Horaires from "./pages/Admin/Clinic/Horaires";
// Other pages
import Landing from "./pages/Landing";
import StartClinic from "./pages/StartClinic";
import NotFound from "./pages/NotFound";

// Components
import Navbar from "./components/Navbar/Navbar";
import SuperAdminNavbar from "./components/Navbar/SuperAdminNavbar";
import ClinicNavbar from "./components/Navbar/ClinicNavbar";
import Footer from "./components/Footer/Footer";
import ClinicFooter from "./components/Footer/ClinicFooter";
import { useAuth } from "./context/authContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ClinicRoute from "./components/ClinicRoute";
import { Toaster } from "react-hot-toast";
import { useClinic } from "./context/clinicContext";
import EditClinic from "./pages/Admin/Clinic/EditClinic";

export default function App() {
  const onRoot = !tenant; // root domain or localhost
  const { user, loading: authLoading } = useAuth();

  return (
    <>
      <Toaster />
      { user && !authLoading && user.role === "SUPER_ADMIN" ?
        <SuperAdminNavbar /> : onRoot ? <Navbar /> : <ClinicNavbar />
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
                <Route path="/home" element={
                  <ClinicRoute>
                    <Home/>
                  </ClinicRoute>
                } />
                <Route path="/" element={<Navigate to="/home" replace />} />

                <Route path="/contact" element={
                  <ClinicRoute>
                    <Contact />
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

              <Route path="/admin/receptionnistes" element={
                <ClinicRoute>
                  <ProtectedRoute roles={["ADMIN"]} redirectTo="/login">
                    <Receptionnistes />
                  </ProtectedRoute>
                </ClinicRoute>
              } />
              <Route path="/admin/medecins" element={
                <ClinicRoute>
                  <ProtectedRoute roles={["ADMIN"]} redirectTo="/login">
                    <Medecins />
                  </ProtectedRoute>
                </ClinicRoute>
              } />
              <Route path="/admin/patients" element={
                <ClinicRoute>
                  <ProtectedRoute roles={["ADMIN"]} redirectTo="/login">
                    <Patients />
                  </ProtectedRoute>
                </ClinicRoute>
              } />
              <Route path="/admin/clinique" element={
                <ClinicRoute>
                  <ProtectedRoute roles={["ADMIN"]} redirectTo="/login">
                    <ClinicInfo />
                  </ProtectedRoute>
                </ClinicRoute>
              } />
              
               <Route path="/admin/clinique/custom-home" element={
                <ClinicRoute>
                  <ProtectedRoute roles={["ADMIN"]} redirectTo="/login">
                    <CustomHome />
                  </ProtectedRoute>
                </ClinicRoute>
               } />

              <Route path="/admin/clinique/horaires" element={ 
                <ClinicRoute>
                  <ProtectedRoute roles={["ADMIN"]} redirectTo="/login">
                    <Horaires />
                  </ProtectedRoute>
                </ClinicRoute>
              } />

              <Route path="/admin/clinique/edit" element={
                <ClinicRoute>
                  <ProtectedRoute roles={["ADMIN"]} redirectTo="/login">
                    <EditClinic />
                  </ProtectedRoute>
                </ClinicRoute>
              } />

              <Route path="/admin/services" element={
                <ClinicRoute>
                  <ProtectedRoute roles={["ADMIN"]} redirectTo="/login">
                    <Services />
                  </ProtectedRoute>
                </ClinicRoute>
              } />
              <Route path="/admin/tarifs" element={
                <ClinicRoute>
                  <ProtectedRoute roles={["ADMIN"]} redirectTo="/login">
                    <Tarifs />
                  </ProtectedRoute>
                </ClinicRoute>
              } />
              <Route path="/admin/billing/stripe" element={
                <ClinicRoute>
                  <ProtectedRoute roles={["ADMIN"]} redirectTo="/login">
                    <StripeBilling />
                  </ProtectedRoute>
                </ClinicRoute>
              } />
              <Route path="/admin/factures" element={
                <ClinicRoute>
                  <ProtectedRoute roles={["ADMIN"]} redirectTo="/login">
                    <Factures />
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
