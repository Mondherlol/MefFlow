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
import Receptionnistes from "./pages/Admin/GererReceptionnistes";
import Medecins from "./pages/Admin/GererMedecins";
import Patients from "./pages/Admin/GererPatients";
import ClinicInfo from "./pages/Admin/ClinicInfo";
import Services from "./pages/Admin/Services";
import Tarifs from "./pages/Admin/Tarifs";
import StripeBilling from "./pages/Admin/StripeBilling";
import Factures from "./pages/Admin/Factures";
import CustomHome from "./pages/Admin/Clinic/CustomHome";
import Horaires from "./pages/Admin/Clinic/Horaires";
import EditClinic from "./pages/Admin/Clinic/EditClinic";
import EditMedia from "./pages/Admin/Clinic/EditMedia";


// Doctor pages
import HomeDoctor from "./pages/Doctor/Home";
import DoctorHoraires from "./pages/Doctor/HorairesMedecin";
import EmploiMedecin from "./pages/Doctor/EmploiMedecin";
import TarifsMedecin from "./pages/Doctor/TarifsMedecin"; 

// Receptionnist pages
import PatientsListPage from "./pages/Receptionnist/PatientsListPage";
import ReceptionnistHome from "./pages/Receptionnist/Home";
import CreatePatient from "./pages/Receptionnist/CreatePatient";
import ReceptionSearch from "./pages/Receptionnist/Search";
import PatientPage from "./pages/Receptionnist/PatientPage";
import Doctors from "./pages/Receptionnist/Doctors";
import Consultations from "./pages/Receptionnist/Consultations";
import Requests from "./pages/Receptionnist/Requests";
import NewConsultation from "./pages/Receptionnist/NewConsultation";
import PlanningMedecin from "./pages/Receptionnist/PlanningMedecin";

// Patient pages
import HomePatient from "./pages/Patient/Home";

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
import BodyModel3D from "./pages/BodyModel";


export default function App() {
  const onRoot = !tenant; // root domain or localhost
  const { user, loading: authLoading } = useAuth();

  const superAdminRoutes = [
    { path: "/__superadmin/login", component: SuperAdminLogin },
    { path: "/__superadmin/dashboard", component: Dashboard, protectedRoles: ["SUPER_ADMIN"], redirectTo: "/__superadmin/login" },
    { path: "/__superadmin/clinic-request/:id", component: ClinicRequest, protectedRoles: ["SUPER_ADMIN"], redirectTo: "/__superadmin/login" },
    { path: "/__superadmin/clinic-infos/:id", component: ClinicInfos, protectedRoles: ["SUPER_ADMIN"], redirectTo: "/__superadmin/login" },
    { path: "/__superadmin/manage-admins/:id", component: ManageAdmins, protectedRoles: ["SUPER_ADMIN"], redirectTo: "/__superadmin/login" },
    { path: "/__superadmin/*", element: <Navigate to="/__superadmin/login" replace /> },
  ];

  const rootRoutes = [
    { path: "/", component: Landing },
    { path: "/StartClinic", component: StartClinic },
  ];

  const clinicPublicRoutes = [
    { path: "/home", component: Home, clinicRoute: true },
    { path: "/", element: <Navigate to="/home" replace />, clinicRoute: true },
    { path: "/contact", component: Contact, clinicRoute: true },
    { path: "/login", component: Login, clinicRoute: true },
    { path: "/signup", component: SignUp, clinicRoute: true },
    { path: "/body", component: BodyModel3D, clinicRoute: true },
  ];

  const adminRoutes = [
    { path: "/admin", component: HomeAdmin, clinicRoute: true, protectedRoles: ["ADMIN"]},
    { path: "/admin/receptionnistes", component: Receptionnistes, clinicRoute: true, protectedRoles: ["ADMIN"] },
    { path: "/admin/medecins", component: Medecins, clinicRoute: true, protectedRoles: ["ADMIN"] },
    { path: "/admin/patients", component: Patients, clinicRoute: true, protectedRoles: ["ADMIN"] },
    { path: "/admin/clinique", component: ClinicInfo, clinicRoute: true, protectedRoles: ["ADMIN"]},
    { path: "/admin/clinique/custom-home", component: CustomHome, clinicRoute: true, protectedRoles: ["ADMIN"] },
    { path: "/admin/clinique/horaires", component: Horaires, clinicRoute: true, protectedRoles: ["ADMIN"] },
    { path: "/admin/clinique/edit", component: EditClinic, clinicRoute: true, protectedRoles: ["ADMIN"] },
    { path: "/admin/clinique/media", component: EditMedia, clinicRoute: true, protectedRoles: ["ADMIN"] },
    { path: "/admin/services", component: Services, clinicRoute: true, protectedRoles: ["ADMIN"] },
    { path: "/admin/tarifs", component: Tarifs, clinicRoute: true, protectedRoles: ["ADMIN"] },
    { path: "/admin/billing/stripe", component: StripeBilling, clinicRoute: true, protectedRoles: ["ADMIN"] },
    { path: "/admin/factures", component: Factures, clinicRoute: true, protectedRoles: ["ADMIN"] },
  ];

  const doctorRoutes = [
    { path: "/doctor", component: HomeDoctor, clinicRoute: true, protectedRoles: ["MEDECIN"] },
    { path: "/doctor/horaires", component: DoctorHoraires, clinicRoute: true, protectedRoles: ["MEDECIN"] },
    { path :"/doctor/emploi", component: EmploiMedecin, clinicRoute: true, protectedRoles: ["MEDECIN"] },
    { path: "/doctor/tarifs", component: TarifsMedecin, clinicRoute: true, protectedRoles: ["MEDECIN"] },
  ];

  const receptionnistRoutes = [
   { path: "/reception", component: ReceptionnistHome, clinicRoute: true, protectedRoles: ["RECEPTIONNISTE"] },
   { path: "/reception/patients/new", component: CreatePatient, clinicRoute: true, protectedRoles: ["RECEPTIONNISTE"] },
   { path: "/reception/search", component: ReceptionSearch, clinicRoute: true, protectedRoles: ["RECEPTIONNISTE"] },
   { path: "/reception/patients/:id", component: PatientPage, clinicRoute: true, protectedRoles: ["RECEPTIONNISTE"] },
   { path: "/reception/consultations", component: Consultations, clinicRoute: true, protectedRoles: ["RECEPTIONNISTE"] },
   { path: "/reception/doctors" ,component: Doctors,  clinicRoute: true, protectedRoles: ["RECEPTIONNISTE"] },
   { path :"/reception/requests", component: Requests, clinicRoute: true, protectedRoles: ["RECEPTIONNISTE"] },
   { path: "/reception/patients", component: PatientsListPage, clinicRoute: true, protectedRoles: ["RECEPTIONNISTE"] },
   { path: "/reception/consultations/new", component: NewConsultation, clinicRoute: true, protectedRoles: ["RECEPTIONNISTE"] },
   { path: "/reception/emploi/:id", component: PlanningMedecin, clinicRoute: true, protectedRoles: ["RECEPTIONNISTE"] },

  ];

  const patientsRoutes = [
    { path: "/patient", component: HomePatient, clinicRoute: true, protectedRoles: ["PATIENT"] },
  ];

  const clinicRoutes = [...clinicPublicRoutes, ...adminRoutes, ...doctorRoutes, ...receptionnistRoutes, ...patientsRoutes];

  const renderRoute = (r) => {
    if (r.element) return <Route key={r.path} path={r.path} element={r.element} />;
    const Elem = r.component;
    let jsx = <Elem />;
    if (r.protectedRoles) {
      jsx = (
        <ProtectedRoute roles={r.protectedRoles} redirectTo={r.redirectTo}>
          {jsx}
        </ProtectedRoute>
      );
    }
    if (r.clinicRoute) {
      jsx = <ClinicRoute>{jsx}</ClinicRoute>;
    }
    return <Route key={r.path} path={r.path} element={jsx} />;
  };

  return (
    <>
      <Toaster />
      {user && !authLoading && user.role === "SUPER_ADMIN" ? <SuperAdminNavbar /> : onRoot ? <Navbar /> : <ClinicNavbar />}
      <Routes>
        <Route path="*" element={<NotFound />} />
        {superAdminRoutes.map(renderRoute)}
        {onRoot ? rootRoutes.map(renderRoute) : clinicRoutes.map(renderRoute)}
      </Routes>
      {onRoot ? <Footer /> : <ClinicFooter />}
    </>
  );
}
