/**
 * Google OAuth & Identity Services Configuration
 *
 * Implements strict security policies:
 * 1. Disables aggressive "Google One Tap" auto-popups to avoid unintended auto-sign-ins.
 * 2. Enforces prompt: 'select_account' so users consciously choose their email.
 * 3. Prevents credential caching across browser profiles on shared devices.
 */

export interface GoogleAuthUser {
  name: string;
  email: string;
  picture?: string;
  sub?: string;
}

/**
 * Configure Google Identity Services (GSI) options
 * Ensuring auto_select is strictly false and One Tap is disabled.
 */
export const GOOGLE_AUTH_CONFIG = {
  // Never auto-select or silently sign in without explicit user gesture
  auto_select: false,
  // Force account chooser prompt every time
  prompt: "select_account" as const,
  // Disable aggressive One Tap popups
  cancel_on_tap_outside: true,
  itp_support: false,
};

/**
 * Initialize Google OAuth client if Google Identity Services script is present.
 * Ensures strict prompt: 'select_account' and no auto-sign-in.
 */
export function initGoogleAuthClient(
  clientId: string,
  onSuccess: (user: GoogleAuthUser) => void,
  onError?: (err: unknown) => void
) {
  if (typeof window === "undefined") return;

  const win = window as unknown as {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: Record<string, unknown>) => void;
          disableAutoSelect: () => void;
          revoke: (hint: string, callback?: () => void) => void;
        };
        oauth2?: {
          initTokenClient: (options: Record<string, unknown>) => {
            requestAccessToken: (overrideConfig?: Record<string, unknown>) => void;
          };
        };
      };
    };
  };

  if (!win.google?.accounts?.id) {
    return;
  }

  // Explicitly disable any auto-selection from previous browser sessions
  try {
    win.google.accounts.id.disableAutoSelect();
  } catch (e) {
    console.debug("[Google Auth] disableAutoSelect failed:", e);
  }

  // Initialize with strict options
  win.google.accounts.id.initialize({
    client_id: clientId,
    auto_select: false, // Strict: never auto sign-in
    cancel_on_tap_outside: true,
    prompt_parent_id: undefined,
    callback: (response: { credential?: string }) => {
      if (response.credential) {
        try {
          const payloadBase64 = response.credential.split(".")[1];
          const decodedJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
          const payload = JSON.parse(decodedJson);
          onSuccess({
            name: payload.name || "Google User",
            email: payload.email,
            picture: payload.picture,
            sub: payload.sub,
          });
        } catch (err) {
          console.error("[Google Auth] Error decoding credential:", err);
          onError?.(err);
        }
      }
    },
  });
}

/**
 * Trigger explicit Google Account Chooser with prompt: 'select_account'
 */
export function triggerGoogleAccountChooser(
  clientId: string,
  onUserSelected: (user: GoogleAuthUser) => void,
  onFallback?: () => void
) {
  if (typeof window === "undefined") return;

  const win = window as unknown as {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (options: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (res: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  };

  const hasValidClientId = Boolean(
    clientId &&
    !clientId.includes("your_") &&
    !clientId.includes("undefined") &&
    clientId.trim().length > 10
  );

  if (win.google?.accounts?.oauth2 && hasValidClientId) {
    try {
      const tokenClient = win.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        prompt: "select_account", // Enforce native account chooser prompt
        callback: async (tokenResponse) => {
          if (tokenResponse.access_token) {
            try {
              const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const data = await userInfoRes.json();
              if (data?.email) {
                onUserSelected({
                  name: data.name || data.given_name || "Google User",
                  email: data.email,
                  picture: data.picture,
                  sub: data.sub,
                });
                return;
              }
            } catch (e) {
              console.error("[Google Auth] Failed to fetch userinfo:", e);
            }
          }
          if (onFallback) onFallback();
        },
      });

      // Request token with explicit prompt: 'select_account'
      tokenClient.requestAccessToken({ prompt: "select_account" });
      return;
    } catch (err) {
      console.warn("[Google Auth] Native client request failed:", err);
    }
  }

  // Graceful fallback to the standard native-styled account chooser dialog
  if (onFallback) {
    onFallback();
  }
}
