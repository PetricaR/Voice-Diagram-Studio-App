/**
 * "Sign in with Google" (Google Identity Services). The button hands the page a
 * Google ID token, which goes straight to the studio server
 * (POST /api/auth/google); the server verifies it and sets an HttpOnly session
 * cookie, so the page itself never keeps a credential.
 * https://developers.google.com/identity/gsi/web/guides/overview
 */

interface GsiId {
  initialize(config: Record<string, unknown>): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GsiId } };
  }
}

const SCRIPT = 'https://accounts.google.com/gsi/client';
let loading: Promise<GsiId> | null = null;
let initializedFor: string | null = null;
let onCredential: ((credential: string) => void) | null = null;

function load(): Promise<GsiId> {
  const ready = window.google?.accounts?.id;
  if (ready) return Promise.resolve(ready);
  loading ??= new Promise<GsiId>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => {
      const id = window.google?.accounts?.id;
      if (id) resolve(id);
      else reject(new Error('Google sign-in did not load.'));
    };
    script.onerror = () => reject(new Error('Google sign-in could not be loaded; check the connection or an ad blocker.'));
    document.head.append(script);
  }).catch((e: unknown) => {
    loading = null;
    throw e;
  });
  return loading;
}

/** Renders Google's button into `parent`; `callback` gets the ID token of the chosen account. */
export async function renderGoogleButton(
  parent: HTMLElement,
  clientId: string,
  callback: (credential: string) => void,
  dark: boolean,
): Promise<void> {
  const id = await load();
  onCredential = callback;
  if (initializedFor !== clientId) {
    id.initialize({
      client_id: clientId,
      callback: (response: { credential?: string }) => {
        if (response.credential) onCredential?.(response.credential);
      },
      ux_mode: 'popup',
      context: 'signin',
      auto_select: false,
      itp_support: true,
      use_fedcm_for_button: true,
    });
    initializedFor = clientId;
  }
  parent.replaceChildren();
  id.renderButton(parent, {
    type: 'standard',
    theme: dark ? 'filled_black' : 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'pill',
    logo_alignment: 'left',
    width: 280,
  });
}

/** After signing out, Google must not pick the same account again on its own. */
export function forgetGoogleAccount() {
  window.google?.accounts?.id?.disableAutoSelect();
}
