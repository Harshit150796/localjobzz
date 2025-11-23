import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

/**
 * AuthModal - Legacy redirect component
 * This component now redirects to the new /login or /signup pages
 * and is kept for backward compatibility
 */
const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // Redirect to appropriate page
      navigate(initialMode === 'login' ? '/login' : '/signup');
      onClose();
    }
  }, [isOpen, initialMode, navigate, onClose]);

  // This component no longer renders any UI
  return null;
};

export default AuthModal;