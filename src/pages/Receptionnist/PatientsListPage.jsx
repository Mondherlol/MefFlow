import React from 'react';
import ReceptionTemplate from '../../components/Reception/ReceptionTemplate';
import PatientsManager from '../../components/Patients/PatientsManager';

export default function PatientsListPage() {
    return <PatientsManager Template={ReceptionTemplate} title="Patients" />;
}