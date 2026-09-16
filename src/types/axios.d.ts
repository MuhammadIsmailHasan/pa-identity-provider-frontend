import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * When true, a 401 (missing/expired token, or a revoked SSO session) is
     * returned to the caller as a rejected promise instead of triggering the
     * global refresh-then-redirect-to-/login flow. Used by the OAuth
     * authorization and logout pages, which need to stay put and show their
     * own UI (a login form, an "already signed out" message) rather than be
     * yanked to /login and lose the client_id/redirect_uri/state in the URL.
     */
    skipAuthRedirect?: boolean;
  }
}
