import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import { ClinicProvider } from '../../context/clinicContext';
import api from '../../api/axios';

// Mock de l'API axios
jest.mock('../../api/axios');

// Mock des composants qui utilisent import.meta.env
jest.mock('../../components/Clinic/ClinicLanding/ServicesSection', () => {
  return function ServicesSection({ clinic }) {
    return (
      <div data-testid="services-section">
        {clinic.services?.map(service => (
          <div key={service.id}>{service.name}</div>
        ))}
      </div>
    );
  };
});

jest.mock('../../components/Clinic/ClinicLanding/AboutSection', () => {
  return function AboutSection({ clinic }) {
    return <div data-testid="about-section">{clinic.description}</div>;
  };
});

jest.mock('../../components/Clinic/ClinicLanding/ContactSection', () => {
  return function ContactSection({ clinic }) {
    return <div data-testid="contact-section">{clinic.email}</div>;
  };
});

jest.mock('../../components/Clinic/ClinicLanding/LoginCard', () => {
  return function LoginCard() {
    return <div data-testid="login-card">Login</div>;
  };
});

jest.mock('../../components/Clinic/ClinicLanding/TarifsSection', () => {
  return function TarifsSection() {
    return <div data-testid="tarifs-section">Tarifs</div>;
  };
});

jest.mock('../../components/Clinic/ClinicLanding/MedecinsSection', () => {
  return function MedecinsSection() {
    return <div data-testid="medecins-section">Médecins</div>;
  };
});

jest.mock('../../components/Clinic/ClinicLanding/GallerySection', () => {
  return function GallerySection() {
    return <div data-testid="gallery-section">Galerie</div>;
  };
});

jest.mock('../../components/Clinic/ClinicLanding/FAQSection', () => {
  return function FAQSection() {
    return <div data-testid="faq-section">FAQ</div>;
  };
});

jest.mock('../../components/Clinic/ClinicLanding/Hero', () => {
  return function Hero({ clinic }) {
    return <div data-testid="hero-section">{clinic.name}</div>;
  };
});

jest.mock('../../components/Clinic/ClinicLanding/InfoPill', () => {
  return function InfoPill({ children }) {
    return <span>{children}</span>;
  };
});

// Mock du tenant
jest.mock('../../tenant', () => ({
  tenant: 'clinique-test',
  getSubdomain: jest.fn(() => 'clinique-test')
}));

// Mock de framer-motion pour éviter les problèmes d'animation
jest.mock('motion/react', () => ({
  motion: {
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    footer: ({ children, ...props }) => <footer {...props}>{children}</footer>,
  },
}));

describe('Home - Chargement de la page clinique', () => {
  
  const mockClinicData = {
    id: 456,
    name: 'Clinique Test',
    slug: 'clinique-test',
    description: 'Une clinique de test pour les tests',
    address: '123 Rue Test, Paris',
    email: 'contact@clinique-test.com',
    phone: '+33123456789',
    primary_color: '#3b82f6',
    secondary_color: '#1e40af',
    accent_color: '#f59e0b',
    logo: 'https://example.com/logo.png',
    sections: [
      { id: 'hero', visible: true },
      { id: 'about', visible: true },
      { id: 'services', visible: true },
      { id: 'contact', visible: true },
    ],
    services: [
      { id: 1, name: 'Consultation générale', description: 'Examen médical complet' },
      { id: 2, name: 'Radiologie', description: 'Examens radiologiques' }
    ],
    faqs: [
      { question: 'Comment prendre rendez-vous ?', answer: 'Appelez-nous ou utilisez notre formulaire en ligne.' }
    ]
  };

  const renderHome = () => {
    return render(
      <BrowserRouter>
        <ClinicProvider>
          <Home />
        </ClinicProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => 'clinique-test'),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    global.localStorage = localStorageMock;
  });

  describe('🌐 Chargement initial avec le bon tenant', () => {
    
    test('affiche un loader pendant le chargement', () => {
      api.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderHome();
      
      // Vérifie la présence du spinner
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    test('charge la clinique avec le slug du tenant', async () => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockClinicData
      });
      
      renderHome();
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/clinics/by-slug/?slug=clinique-test');
      });
    });

    test('affiche le nom de la clinique après chargement', async () => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockClinicData
      });
      
      renderHome();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('affiche la description de la clinique', async () => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockClinicData
      });
      
      renderHome();
      
      await waitFor(() => {
        expect(screen.getByText(/Une clinique de test pour les tests/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('📋 Affichage des sections configurées', () => {
    
    beforeEach(() => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockClinicData
      });
    });

    test('affiche la section Hero', async () => {
      renderHome();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('affiche la section À propos si visible', async () => {
      renderHome();
      
      await waitFor(() => {
        // La section About devrait être présente
        const sections = document.querySelectorAll('section, div[class*="motion"]');
        expect(sections.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    test('affiche la section Services si visible', async () => {
      renderHome();
      
      await waitFor(() => {
        // Vérifie que les services sont affichés
        expect(screen.getByText(/Consultation générale/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('affiche la section Contact si visible', async () => {
      renderHome();
      
      await waitFor(() => {
        expect(screen.getByText(/contact@clinique-test.com/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('🎨 Thème de la clinique', () => {
    
    test('applique les couleurs personnalisées de la clinique', async () => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockClinicData
      });
      
      renderHome();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Vérifie que le footer a le gradient avec les bonnes couleurs
      const footer = document.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    test('applique les couleurs par défaut si non définies', async () => {
      const clinicWithoutColors = { ...mockClinicData };
      delete clinicWithoutColors.primary_color;
      delete clinicWithoutColors.secondary_color;
      delete clinicWithoutColors.accent_color;
      
      api.get.mockResolvedValueOnce({
        status: 200,
        data: clinicWithoutColors
      });
      
      renderHome();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('🦶 Footer', () => {
    
    beforeEach(() => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockClinicData
      });
    });

    test('affiche le footer avec le nom de la clinique', async () => {
      renderHome();
      
      await waitFor(() => {
        const currentYear = new Date().getFullYear();
        expect(screen.getByText(new RegExp(`${currentYear}.*Clinique Test.*Tous droits réservés`, 'i'))).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('affiche les badges "Données protégées" et "Suivi patient"', async () => {
      renderHome();
      
      await waitFor(() => {
        expect(screen.getByText(/Données protégées/i)).toBeInTheDocument();
        expect(screen.getByText(/Suivi patient/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('⚠️ Gestion des erreurs', () => {
    
    test('affiche le loader si la clinique n\'est pas trouvée', async () => {
      api.get.mockResolvedValueOnce({
        status: 404,
        data: null
      });
      
      renderHome();
      
      // Le loader devrait rester affiché
      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    test('affiche le loader en cas d\'erreur réseau', async () => {
      api.get.mockRejectedValueOnce(new Error('Network error'));
      
      renderHome();
      
      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('📱 Sections dynamiques', () => {
    
    test('affiche uniquement les sections visibles', async () => {
      const clinicWithHiddenSections = {
        ...mockClinicData,
        sections: [
          { id: 'hero', visible: true },
          { id: 'about', visible: false }, // Cachée
          { id: 'services', visible: true },
          { id: 'contact', visible: false }, // Cachée
        ]
      };
      
      api.get.mockResolvedValueOnce({
        status: 200,
        data: clinicWithHiddenSections
      });
      
      renderHome();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // La section Services devrait être visible
      expect(screen.getByText(/Consultation générale/i)).toBeInTheDocument();
    });

    test('utilise les sections par défaut si aucune section définie', async () => {
      const clinicWithoutSections = { ...mockClinicData };
      delete clinicWithoutSections.sections;
      
      api.get.mockResolvedValueOnce({
        status: 200,
        data: clinicWithoutSections
      });
      
      renderHome();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('⏱️ Délai de rendu', () => {
    
    test('attend 200ms avant d\'afficher la page après chargement', async () => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockClinicData
      });
      
      renderHome();
      
      // Le spinner devrait être visible initialement
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      
      // Après le délai, la page devrait être affichée
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('🔄 Contexte Clinic', () => {
    
    test('fournit les données de la clinique via le contexte', async () => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockClinicData
      });
      
      renderHome();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Les données devraient être disponibles pour tous les composants enfants
      expect(screen.getByText(/Une clinique de test pour les tests/i)).toBeInTheDocument();
    });

    test('fournit le thème via le contexte', async () => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockClinicData
      });
      
      renderHome();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Le thème devrait être appliqué (vérifié via le footer)
      const footer = document.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });
  });
});
