import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import StartClinic from './StartClinic';
import api from '../api/axios';
import Cookies from 'js-cookie';

// Mock uniquement des dépendances externes (API, Cookies)
jest.mock('../api/axios');
jest.mock('js-cookie');

// PAS de mock des composants - on teste les VRAIS composants !

const renderApp = () => {
  return render(
    <BrowserRouter>
      <StartClinic />
      <Toaster />
    </BrowserRouter>
  );
};

describe('StartClinic - Tests avec les VRAIS composants', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    Cookies.get.mockReturnValue(undefined);
    api.get.mockResolvedValue({ data: { available: true } });
    api.post.mockResolvedValue({ data: { id: 1, message: 'Succès' } });
  });

  describe('🌐 Affichage initial (vrais composants)', () => {
    test('affiche le vrai formulaire avec tous les éléments', () => {
      renderApp();

      // Vérifier les vrais titres
      expect(screen.getByText('Informations de la clinique')).toBeInTheDocument();
      
      // Vérifier les vrais labels
      expect(screen.getByText(/Nom de la clinique/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Pays/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Ville/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Adresse/i)[0]).toBeInTheDocument();
    });

    test('affiche le stepper avec les deux étapes', () => {
      renderApp();

      expect(screen.getByText('Informations Clinique')).toBeInTheDocument();
      expect(screen.getByText('Vos Informations')).toBeInTheDocument();
    });

    test('affiche le panneau latéral informatif', () => {
      renderApp();

      // Le vrai composant InfoSidebar
      expect(screen.getByText(/Guide de configuration/i)).toBeInTheDocument();
    });

    test('affiche les boutons de navigation', () => {
      renderApp();

      expect(screen.getByRole('button', { name: /suivant/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /précédent/i })).toBeInTheDocument();
    });
  });

  describe('📝 Saisie dans les vrais champs du formulaire', () => {
    test('permet de saisir le nom de la clinique dans le vrai input', async () => {
      renderApp();

      // Trouver le vrai input par son placeholder
      const input = screen.getByPlaceholderText(/Guéridon/i);
      await user.type(input, 'Ma Super Clinique');

      expect(input).toHaveValue('Ma Super Clinique');
    });

    test('génère automatiquement le slug en temps réel', async () => {
      renderApp();

      const input = screen.getByPlaceholderText(/Guéridon/i);
      await user.type(input, 'Clinique des Roses');

      // Le slug devrait être visible
      await waitFor(() => {
        expect(screen.getByText(/clinique-des-roses/i)).toBeInTheDocument();
      });
    });

    test('vérifie la disponibilité du slug via API', async () => {
      renderApp();

      const input = screen.getByPlaceholderText(/Guéridon/i);
      await user.type(input, 'Clinique Test');

      // Attendre que l'API soit appelée pour vérifier le slug
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          expect.stringContaining('check-slug/?slug=clinique-test')
        );
      }, { timeout: 3000 });
    });

    test('affiche un message si le slug est disponible', async () => {
      renderApp();

      const input = screen.getByPlaceholderText(/Guéridon/i);
      await user.type(input, 'Clinique Disponible');

      await waitFor(() => {
        expect(screen.getByText(/disponible/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('affiche un message si le slug n\'est pas disponible', async () => {
      // Simuler que le slug est déjà pris
      api.get.mockResolvedValueOnce({ data: { available: false } });

      renderApp();

      const input = screen.getByPlaceholderText(/Guéridon/i);
      await user.type(input, 'Clinique Occupée');

      // Attendre le message d'indisponibilité
      await waitFor(() => {
        expect(screen.getByText(/déjà utilisé/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('peut saisir la ville et l\'adresse', async () => {
      renderApp();

      const cityInput = screen.getByPlaceholderText(/Tunis/i);
      const addressInput = screen.getByPlaceholderText(/Avenue du Parc/i);

      await user.type(cityInput, 'Lyon');
      await user.type(addressInput, '123 avenue Test');

      expect(cityInput).toHaveValue('Lyon');
      expect(addressInput).toHaveValue('123 avenue Test');
    });

    test('affiche react-select pour le pays', () => {
      renderApp();

      // Le vrai composant react-select
      const selectInput = screen.getByRole('combobox');
      expect(selectInput).toBeInTheDocument();
    });
  });

  describe('🚦 Validation des vrais champs', () => {
    test('affiche les vrais messages d\'erreur si on clique Suivant sans remplir', async () => {
      renderApp();

      const nextButton = screen.getByRole('button', { name: /suivant/i });
      await user.click(nextButton);

      // Attendre les vrais messages d'erreur du formulaire
      await waitFor(() => {
        expect(screen.getByText(/nom.*clinique.*requis/i)).toBeInTheDocument();
        expect(screen.getByText(/pays.*requis/i)).toBeInTheDocument();
        expect(screen.getByText(/ville.*requise/i)).toBeInTheDocument();
        expect(screen.getByText(/adresse.*requise/i)).toBeInTheDocument();
      });
    });

    test('le bouton Précédent est désactivé à l\'étape 1', () => {
      renderApp();

      const prevButton = screen.getByRole('button', { name: /précédent/i });
      expect(prevButton).toBeDisabled();
    });
  });

  describe('🍪 Gestion des cookies', () => {
    test('affiche directement l\'écran de succès si déjà soumis', () => {
      Cookies.get.mockReturnValue('true');

      renderApp();

      // Devrait voir l'écran de succès immédiatement
      expect(screen.getByText(/Demande reçue/i)).toBeInTheDocument();
      
      // Ne devrait PAS voir le formulaire
      expect(screen.queryByPlaceholderText(/Guéridon/i)).not.toBeInTheDocument();
    });
  });

  describe('📊 Affichage du slug et du site', () => {
    test('affiche le format du site medflow.tn', () => {
      renderApp();

      expect(screen.getByText(/medflow\.tn/i)).toBeInTheDocument();
    });

    test('affiche "votre-clinique" par défaut si pas de saisie', () => {
      renderApp();

      expect(screen.getByText(/votre-clinique/i)).toBeInTheDocument();
    });
  });
});

// Tests d'intégration plus complexes (navigation entre étapes) sont mieux adaptés
// pour Cypress ou Playwright car ils nécessitent des interactions complexes avec
// react-select et react-phone-input qui sont difficiles à tester avec Testing Library
