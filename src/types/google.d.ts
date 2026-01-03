// Google Identity Services type declarations
interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  clientId?: string;
}

interface GoogleButtonConfig {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

interface GoogleInitializeConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  ux_mode?: 'popup' | 'redirect';
  login_uri?: string;
  native_callback?: (response: GoogleCredentialResponse) => void;
  prompt_parent_id?: string;
  state_cookie_domain?: string;
  itp_support?: boolean;
}

interface Google {
  accounts: {
    id: {
      initialize: (config: GoogleInitializeConfig) => void;
      prompt: (momentListener?: (notification: {
        isDisplayMoment: () => boolean;
        isDisplayed: () => boolean;
        isNotDisplayed: () => boolean;
        getNotDisplayedReason: () => string;
        isSkippedMoment: () => boolean;
        getSkippedReason: () => string;
        isDismissedMoment: () => boolean;
        getDismissedReason: () => string;
      }) => void) => void;
      renderButton: (parent: HTMLElement, config: GoogleButtonConfig) => void;
      disableAutoSelect: () => void;
      storeCredential: (credential: { id: string; password: string }, callback?: () => void) => void;
      cancel: () => void;
      revoke: (hint: string, callback?: (response: { successful: boolean; error?: string }) => void) => void;
    };
  };
}

declare global {
  interface Window {
    google?: Google;
  }
}

export {};
