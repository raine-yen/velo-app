import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  init: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
};

async function setSessionFromUrl(url: string): Promise<string | null> {
  const parsed = Linking.parse(url);
  const fragment = url.split('#')[1] ?? '';
  const fragParams = Object.fromEntries(new URLSearchParams(fragment));
  const errorDescription = (parsed.queryParams?.error_description as string) ?? fragParams.error_description;
  if (errorDescription) return errorDescription;

  // PKCE flow returns a code; implicit flow returns tokens directly
  const code = parsed.queryParams?.code as string | undefined;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return error?.message ?? null;
  }

  const access_token = (parsed.queryParams?.access_token as string) ?? fragParams.access_token;
  const refresh_token = (parsed.queryParams?.refresh_token as string) ?? fragParams.refresh_token;
  if (!access_token) return 'No access token in callback URL';
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  return error?.message ?? null;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,

  init: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, user: data.session?.user ?? null, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message ?? null;
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  },

  signInWithGoogle: async () => {
    const redirectTo = Linking.createURL('/auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) return error.message;
    if (!data.url) return 'No OAuth URL returned';

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success' && result.url) {
      return await setSessionFromUrl(result.url);
    }
    if (result.type === 'cancel' || result.type === 'dismiss') return null;
    return 'Sign in cancelled';
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
