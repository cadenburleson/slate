import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// Where Supabase should send the user after they click the email
// confirmation link. On web we read window.location at call time so the
// same code works in dev (localhost), preview, and production deploys
// without rebuilding.
function getEmailRedirectTo(): string | undefined {
  if (Platform.OS !== "web") return undefined;
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/callback`;
}

// OAuth redirect target. Web uses the absolute /callback URL; native uses
// the slate:// deep link (scheme set in app.json) so the system browser
// hands control back to the app when Supabase finishes the OAuth dance.
function getOAuthRedirectTo(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.origin}/callback`;
  }
  return Linking.createURL("callback");
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async function signUp(email: string, password: string) {
    const emailRedirectTo = getEmailRedirectTo();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: emailRedirectTo ? { emailRedirectTo } : undefined,
    });
    if (error) throw error;
  }

  async function signInWithGoogle() {
    const redirectTo = getOAuthRedirectTo();

    if (Platform.OS === "web") {
      // On web, Supabase navigates the page to Google for us and then
      // back to /callback. detectSessionInUrl on the client picks up
      // the resulting tokens automatically.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
      return;
    }

    // On native, we open the OAuth URL in the system browser via
    // WebBrowser.openAuthSessionAsync, wait for the slate://callback
    // redirect, then exchange the returned code for a session manually
    // (detectSessionInUrl is web-only).
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data?.url) throw new Error("Could not generate Google OAuth URL");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success") return; // user cancelled

    const { params, errorCode } = Linking.parse(result.url);
    if (errorCode) throw new Error(errorCode);
    const code = params?.code;
    if (typeof code !== "string") return;

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
