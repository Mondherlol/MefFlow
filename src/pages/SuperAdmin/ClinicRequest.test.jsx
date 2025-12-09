import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ClinicRequest from './ClinicRequest';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// Mock de l'API axios
jest.mock('../../api/axios');

// Mock de react-hot-toast
jest.mock('react-hot-toast');

// Mock du navigate et useParams
const mockNavigate = jest.fn();
const mockParams = { id: '123' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

describe('ClinicRequest - Tests d\'approbation de clinique', () => {
  
  const mockRequestData = {
    id: 123,
    clinic_name: 'Clinique Test',
    clinic_slug: 'clinique-test',
    admin_email: 'admin@test.com',
    admin_firstname: 'Jean',
    admin_name: 'Dupont',
    admin_phone: '+33612345678',
    address: '123 Rue de Test, Paris',
    description: 'Une clinique de test',
    created_at: '2025-12-09T10:00:00Z',
    metadata: { country: 'France' }
  };

  const renderClinicRequest = () => {
    return render(
      <BrowserRouter>
        <ClinicRequest />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    
    // Mock toast methods
    toast.success = jest.fn();
    toast.error = jest.fn();
  });

  describe('🌐 Chargement initial de la demande', () => {
    
    test('affiche un loader pendant le chargement', () => {
      api.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderClinicRequest();
      
      // Vérifie l'état de chargement (skeleton)
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    test('charge et affiche les informations de la demande', async () => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockRequestData
      });
      
      // Mock pour les autres demandes
      api.get.mockResolvedValueOnce({
        status: 200,
        data: { clinic_requests: [], clinics: [] }
      });
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      expect(screen.getByText('clinique-test')).toBeInTheDocument();
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
      expect(screen.getByText('Jean')).toBeInTheDocument();
    });

    test('affiche un message d\'erreur si le chargement échoue', async () => {
      api.get.mockRejectedValueOnce(new Error('Network error'));
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Impossible de charger la demande.');
      });
    });

    test('appelle l\'API avec le bon ID', async () => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockRequestData
      });
      
      api.get.mockResolvedValueOnce({
        status: 200,
        data: { clinic_requests: [], clinics: [] }
      });
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/clinic-requests/123/');
      });
    });
  });

  describe('✅ Approbation de la demande', () => {
    
    beforeEach(async () => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockRequestData
      });
      
      api.get.mockResolvedValueOnce({
        status: 200,
        data: { clinic_requests: [], clinics: [] }
      });
    });

    test('affiche les boutons Accepter et Refuser', async () => {
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('button', { name: /Accepter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Refuser/i })).toBeInTheDocument();
    });

    test('appelle l\'API d\'approbation au clic sur Accepter', async () => {
      const user = userEvent.setup();
      
      api.post.mockResolvedValueOnce({
        status: 200,
        data: { clinic_id: 456 }
      });
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      const acceptButton = screen.getByRole('button', { name: /Accepter/i });
      await user.click(acceptButton);
      
      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/clinic-requests/123/approve/');
      });
    });

    test('affiche un message de succès après approbation', async () => {
      const user = userEvent.setup();
      
      api.post.mockResolvedValueOnce({
        status: 200,
        data: { clinic_id: 456 }
      });
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      const acceptButton = screen.getByRole('button', { name: /Accepter/i });
      await user.click(acceptButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(' Demande acceptée avec succès.');
      });
    });

    test('redirige vers la page de la clinique créée après approbation', async () => {
      const user = userEvent.setup();
      
      api.post.mockResolvedValueOnce({
        status: 200,
        data: { clinic_id: 456 }
      });
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      const acceptButton = screen.getByRole('button', { name: /Accepter/i });
      await user.click(acceptButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/__superadmin/clinic-infos/456');
      });
    });

    test('affiche un loader pendant le traitement de l\'approbation', async () => {
      const user = userEvent.setup();
      
      // Mock qui ne se résout jamais pour capturer l'état de chargement
      let resolvePromise;
      api.post.mockReturnValueOnce(new Promise((resolve) => {
        resolvePromise = resolve;
      }));
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      const acceptButton = screen.getByRole('button', { name: /Accepter/i });
      await user.click(acceptButton);
      
      await waitFor(() => {
        // Cherche le texte dans le bouton spécifiquement
        expect(screen.getAllByText(/Traitement.../i).length).toBeGreaterThan(0);
      });
      
      // Résoudre pour nettoyer
      resolvePromise({ status: 200, data: { clinic_id: 456 } });
    });

    test('désactive les boutons pendant le traitement', async () => {
      const user = userEvent.setup();
      
      let resolvePromise;
      api.post.mockReturnValueOnce(new Promise((resolve) => {
        resolvePromise = resolve;
      }));
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      const acceptButton = screen.getByRole('button', { name: /Accepter/i });
      const declineButton = screen.getByRole('button', { name: /Refuser/i });
      
      await user.click(acceptButton);
      
      await waitFor(() => {
        expect(acceptButton).toBeDisabled();
        expect(declineButton).toBeDisabled();
      });
      
      resolvePromise({ status: 200, data: { clinic_id: 456 } });
    });

    test('affiche une erreur si l\'approbation échoue', async () => {
      const user = userEvent.setup();
      
      api.post.mockRejectedValueOnce({
        response: {
          data: { message: 'Erreur serveur' }
        }
      });
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      const acceptButton = screen.getByRole('button', { name: /Accepter/i });
      await user.click(acceptButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur serveur');
      });
    });

    test('affiche une erreur générique en cas d\'erreur réseau', async () => {
      const user = userEvent.setup();
      
      api.post.mockRejectedValueOnce(new Error('Network error'));
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      const acceptButton = screen.getByRole('button', { name: /Accepter/i });
      await user.click(acceptButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur de connexion, veuillez réessayer.');
      });
    });

    test('affiche une erreur si clinic_id manque dans la réponse', async () => {
      const user = userEvent.setup();
      
      api.post.mockResolvedValueOnce({
        status: 200,
        data: {} // Pas de clinic_id
      });
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      const acceptButton = screen.getByRole('button', { name: /Accepter/i });
      await user.click(acceptButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('ID de la clinique manquant dans la réponse.');
      });
    });
  });

  describe('❌ Refus de la demande', () => {
    
    beforeEach(async () => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockRequestData
      });
      
      api.get.mockResolvedValueOnce({
        status: 200,
        data: { clinic_requests: [], clinics: [] }
      });
    });

    test('appelle l\'API de refus au clic sur Refuser', async () => {
      const user = userEvent.setup();
      
      api.post.mockResolvedValueOnce({
        status: 200,
        data: {}
      });
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      const declineButton = screen.getByRole('button', { name: /Refuser/i });
      await user.click(declineButton);
      
      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/clinic-requests/123/reject/');
      });
    });

    test('affiche un message de succès après refus', async () => {
      const user = userEvent.setup();
      
      api.post.mockResolvedValueOnce({
        status: 200,
        data: {}
      });
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      const declineButton = screen.getByRole('button', { name: /Refuser/i });
      await user.click(declineButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Demande refusée avec succès.');
      });
    });

    test('retourne à la page précédente après refus', async () => {
      const user = userEvent.setup();
      
      api.post.mockResolvedValueOnce({
        status: 200,
        data: {}
      });
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      const declineButton = screen.getByRole('button', { name: /Refuser/i });
      await user.click(declineButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(-1);
      });
    });

    test('affiche un loader pendant le refus', async () => {
      const user = userEvent.setup();
      
      let resolvePromise;
      api.post.mockReturnValueOnce(new Promise((resolve) => {
        resolvePromise = resolve;
      }));
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      const declineButton = screen.getByRole('button', { name: /Refuser/i });
      await user.click(declineButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Refus en cours.../i)).toBeInTheDocument();
      });
      
      resolvePromise({ status: 200, data: {} });
    });
  });

  describe('🔙 Navigation', () => {
    
    beforeEach(async () => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockRequestData
      });
      
      api.get.mockResolvedValueOnce({
        status: 200,
        data: { clinic_requests: [], clinics: [] }
      });
    });

    test('affiche le bouton Retour', async () => {
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('button', { name: /Retour/i })).toBeInTheDocument();
    });

    test('retourne à la page précédente au clic sur Retour', async () => {
      const user = userEvent.setup();
      
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
      
      const backButton = screen.getByRole('button', { name: /Retour/i });
      await user.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('📋 Affichage des informations', () => {
    
    beforeEach(async () => {
      api.get.mockResolvedValueOnce({
        status: 200,
        data: mockRequestData
      });
      
      api.get.mockResolvedValueOnce({
        status: 200,
        data: { clinic_requests: [], clinics: [] }
      });
    });

    test('affiche le nom de la clinique', async () => {
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Clinique Test')).toBeInTheDocument();
      });
    });

    test('affiche le slug de la clinique', async () => {
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('clinique-test')).toBeInTheDocument();
      });
    });

    test('affiche l\'email de l\'admin', async () => {
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('admin@test.com')).toBeInTheDocument();
      });
    });

    test('affiche le prénom de l\'admin', async () => {
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Jean')).toBeInTheDocument();
      });
    });

    test('affiche l\'adresse de la clinique', async () => {
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('123 Rue de Test, Paris')).toBeInTheDocument();
      });
    });

    test('affiche la description', async () => {
      renderClinicRequest();
      
      await waitFor(() => {
        expect(screen.getByText('Une clinique de test')).toBeInTheDocument();
      });
    });
  });
});
