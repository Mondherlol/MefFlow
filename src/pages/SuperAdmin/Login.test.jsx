import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SuperAdminLogin from './Login';
import api from '../../api/axios';

// Mock de l'API axios
jest.mock('../../api/axios');

// Mock du navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock du contexte d'authentification
const mockLogin = jest.fn();
const mockLogout = jest.fn();

jest.mock('../../context/authContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: mockLogin,
    logout: mockLogout,
  }),
}));

describe('SuperAdminLogin - Tests avec les VRAIS composants', () => {
  
  // Helper pour render avec le router
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <SuperAdminLogin />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    // Reset des mocks avant chaque test
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockLogin.mockClear();
    mockLogout.mockClear();
    
    // Mock localStorage et cookies
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
    document.cookie = '';
  });

  describe('🌐 Affichage initial', () => {
    
    test('affiche le formulaire de connexion', () => {
      renderLogin();
      
      expect(screen.getByText(/Connectez-vous/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email@exemple.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
    });

    test('affiche les valeurs par défaut dans les champs', () => {
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText(/email@exemple.com/i);
      const passwordInput = screen.getByPlaceholderText(/••••••••/i);
      
      expect(emailInput).toHaveValue('superadmin@example.com');
      expect(passwordInput).toHaveValue('string');
    });

    test('affiche le lien de retour en lieu sûr', () => {
      renderLogin();
      
      const link = screen.getByText(/lieu sûr/i);
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/');
    });
  });

  describe('📝 Saisie dans les champs', () => {
    
    test('permet de modifier l\'email', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText(/email@exemple.com/i);
      
      await user.clear(emailInput);
      await user.type(emailInput, 'admin@medflow.tn');
      
      expect(emailInput).toHaveValue('admin@medflow.tn');
    });

    test('permet de modifier le mot de passe', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      const passwordInput = screen.getByPlaceholderText(/••••••••/i);
      
      await user.clear(passwordInput);
      await user.type(passwordInput, 'newpassword123');
      
      expect(passwordInput).toHaveValue('newpassword123');
    });
  });

  describe('✅ Connexion réussie', () => {
    
    test('appelle l\'API avec les bonnes credentials', async () => {
      const user = userEvent.setup();
      
      // Mock d'une réponse API réussie
      api.post.mockResolvedValueOnce({
        status: 200,
        data: {
          user: { id: 1, email: 'superadmin@example.com', role: 'superadmin' },
          access: 'fake-access-token',
          refresh: 'fake-refresh-token'
        }
      });
      
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/auth/super-login/', {
          email: 'superadmin@example.com',
          password: 'string'
        });
      });
    });

    test('redirige vers le dashboard après connexion réussie', async () => {
      const user = userEvent.setup();
      
      api.post.mockResolvedValueOnce({
        status: 200,
        data: {
          user: { id: 1, email: 'superadmin@example.com', role: 'superadmin' },
          access: 'fake-access-token',
          refresh: 'fake-refresh-token'
        }
      });
      
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/__superadmin/dashboard', { replace: true });
      });
    });

    test('envoie les credentials modifiés', async () => {
      const user = userEvent.setup();
      
      api.post.mockResolvedValueOnce({
        status: 200,
        data: {
          user: { id: 1, email: 'admin@test.com', role: 'superadmin' },
          access: 'token',
          refresh: 'refresh'
        }
      });
      
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText(/email@exemple.com/i);
      const passwordInput = screen.getByPlaceholderText(/••••••••/i);
      
      await user.clear(emailInput);
      await user.type(emailInput, 'admin@test.com');
      
      await user.clear(passwordInput);
      await user.type(passwordInput, 'testpass');
      
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/auth/super-login/', {
          email: 'admin@test.com',
          password: 'testpass'
        });
      });
    });
  });

  describe('❌ Erreurs de connexion', () => {
    
    test('affiche un message d\'erreur si les credentials sont invalides', async () => {
      const user = userEvent.setup();
      
      api.post.mockRejectedValueOnce({
        response: {
          data: { detail: 'Email ou mot de passe incorrect' }
        }
      });
      
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Email ou mot de passe incorrect/i)).toBeInTheDocument();
      });
    });

    test('affiche un message d\'erreur générique en cas d\'erreur réseau', async () => {
      const user = userEvent.setup();
      
      api.post.mockRejectedValueOnce({
        // Pas de response = erreur réseau
      });
      
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Erreur de connexion, veuillez réessayer/i)).toBeInTheDocument();
      });
    });

    test('efface l\'erreur précédente lors d\'une nouvelle tentative', async () => {
      const user = userEvent.setup();
      
      // Première tentative échoue
      api.post.mockRejectedValueOnce({
        response: {
          data: { detail: 'Erreur test' }
        }
      });
      
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /Se connecter/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Erreur test/i)).toBeInTheDocument();
      });
      
      // Deuxième tentative réussit
      api.post.mockResolvedValueOnce({
        status: 200,
        data: {
          user: { id: 1, email: 'superadmin@example.com' },
          access: 'token',
          refresh: 'refresh'
        }
      });
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/Erreur test/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('🔒 Validation du formulaire', () => {
    
    test('les champs email et password sont required', () => {
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText(/email@exemple.com/i);
      const passwordInput = screen.getByPlaceholderText(/••••••••/i);
      
      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    test('le champ email a le type email', () => {
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText(/email@exemple.com/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('le champ password a le type password', () => {
      renderLogin();
      
      const passwordInput = screen.getByPlaceholderText(/••••••••/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('🎨 Interface utilisateur', () => {
    
    test('affiche les labels des champs', () => {
      renderLogin();
      
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Mot de passe')).toBeInTheDocument();
    });

    test('affiche le message pour les utilisateurs perdus', () => {
      renderLogin();
      
      expect(screen.getByText(/Vous ne savez pas ce que vous faites ici/i)).toBeInTheDocument();
    });
  });
});
