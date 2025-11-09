import { Users, UserPlus, UserCheck, FileText, Settings, Pill, Cross, ConciergeBell, Building, Building2, UserCog } from 'lucide-react';
import { useClinic } from '../../context/clinicContext';
import { useAuth } from '../../context/authContext';

const HomeAdmin = () => {
    const {user} = useAuth();
    const {clinic} = useClinic();


    return (
        <div className="min-h-[80dvh] bg-gray-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                            Tableau de bord — Administration
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Gérez les utilisateurs et les informations de la clinique</p>
                    </div>
                    <div className="text-sm text-gray-600">Bonjour, {user?.full_name}</div>
                </header>

                {/* Quick stats */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Réceptionnistes</p>
                            <p className="text-2xl font-bold text-gray-900">12</p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                            <ConciergeBell size={22} />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Médecins</p>
                            <p className="text-2xl font-bold text-gray-900">8</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
                            <Cross size={22} />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Patients</p>
                            <p className="text-2xl font-bold text-gray-900">1 243</p>
                        </div>
                        <div className="p-3 bg-sky-50 rounded-full text-sky-600">
                            <Users size={22} />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Infos cliniques</p>
                            <p className="text-2xl font-bold text-gray-900">{clinic?.name}  </p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-full text-amber-600">
                            <Building2 size={22} />
                        </div>
                    </div>
                </section>

                {/* Management actions grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <button
                        type="button"
                        className="group cursor-pointer bg-white rounded-lg p-6 shadow hover:shadow-md transition flex flex-col items-start text-left"
                        onClick={() => console.log('Gérer Réceptionnistes')}
                        aria-label="Gérer Réceptionnistes"
                    >
                        <div className="p-3 bg-gray-100 rounded-md text-indigo-600 mb-4">
                            <UserCog size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Gérer réceptionnistes</h3>
                        <p className="mt-1 text-sm text-gray-500">Création, modification et droits d'accès.</p>
                    </button>

                    <button
                        type="button"
                        className="group cursor-pointer cursor-pointer bg-white rounded-lg p-6 shadow hover:shadow-md transition flex flex-col items-start text-left"
                        onClick={() => console.log('Gérer Médecins')}
                        aria-label="Gérer Médecins"
                    >
                        <div className="p-3 bg-gray-100 rounded-md text-emerald-600 mb-4">
                            <UserCog size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Gérer médecins</h3>
                        <p className="mt-1 text-sm text-gray-500">Profils, spécialités, planning et disponibilités.</p>
                    </button>

                    <button
                        type="button"
                        className="group cursor-pointer bg-white rounded-lg p-6 shadow hover:shadow-md transition flex flex-col items-start text-left"
                        onClick={() => console.log('Gérer Patients')}
                        aria-label="Gérer Patients"
                    >
                        <div className="p-3 bg-gray-100 rounded-md text-sky-600 mb-4">
                            <UserCog size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Gérer patients</h3>
                        <p className="mt-1 text-sm text-gray-500">Historique, dossiers médicaux et rendez-vous.</p>
                    </button>

                    <button
                        type="button"
                        className="group cursor-pointer bg-white rounded-lg p-6 shadow hover:shadow-md transition flex flex-col items-start text-left"
                        onClick={() => console.log('Gérer Infos Cliniques')}
                        aria-label="Gérer Infos Cliniques"
                    >
                        <div className="p-3 bg-gray-100 rounded-md text-amber-600 mb-4">
                            <Settings size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Infos clinique</h3>
                        <p className="mt-1 text-sm text-gray-500">Configurez votre Clinique et ses paramètres.</p>
                    </button>
                </section>

                <footer className="mt-10 text-sm text-gray-500">
                    <p> Utilisez les cartes ci-dessus pour accéder rapidement aux sections. Cette interface est conçue pour rester claire à mesure que la clinique grandit.</p>
                </footer>
            </div>
        </div>
    );
};

export default HomeAdmin;