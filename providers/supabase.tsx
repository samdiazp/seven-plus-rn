import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { Session, User, createClient } from "@supabase/supabase-js";
import React from "react";

type SupabaseContextProps = {
  getGoogleOAuthUrl: () => Promise<string | null>;
  setOAuthSession: (tokens: {
    access_token: string;
    refresh_token: string;
  }) => Promise<void>;
  loggedIn: boolean;
  user: Session["user"] | null;
  logOut: () => Promise<void>;
};

export const SupabaseContext = React.createContext<SupabaseContextProps>(null);

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    const data = JSON.parse(value);
    const { access_token, refresh_token } = data;
    SecureStore.setItemAsync(
      key,
      JSON.stringify({
        access_token,
        refresh_token,
        user: {
          metadata: data.user.user_metadata,
          email: data.user.email,
        },
      })
    );
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const SupabaseProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState(null);

  const supabase = createClient(
    "https://dwdrlvcrbjiztewygivw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3ZHJsdmNyYmppenRld3lnaXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM3ODY4MDQsImV4cCI6MjAwOTM2MjgwNH0.PlunkbbY-mZ30TTj54nzDdF53tWzuZY_yNnqQHPwG7c",
    {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );
  const getGoogleOAuthUrl = async (): Promise<string | null> => {
    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "sevenplusrn://(home)",
      },
    });

    return result.data.url;
  };

  const setOAuthSession = async (tokens: {
    access_token: string;
    refresh_token: string;
  }) => {
    const { data, error } = await supabase.auth.setSession({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    if (error) throw error;

    setLoggedIn(data.session !== null);
  };

  const logOut = async () => {
    const { error } = await supabase.auth.signOut();
    console.log("ERROR", error);
    if (error) throw error;

    setUser(null);
  };

  React.useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" || session?.user) {
          setUser(session?.user ?? null);
        }
      }
    );
  }, []);

  return (
    <SupabaseContext.Provider
      value={{
        getGoogleOAuthUrl,
        setOAuthSession,
        loggedIn,
        user,
        logOut,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};
