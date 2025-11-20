import React from 'react';
import AdminTemplate from '../../components/Admin/AdminTemplate';
import PatientsManager from '../../components/Patients/PatientsManager';

export default function Patients() {
  return <PatientsManager Template={AdminTemplate} title="Gérer patients" />;
}
