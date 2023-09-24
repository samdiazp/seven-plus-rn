import React, { useEffect } from "react";
import { createURL, useURL } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Button, Text, View } from "../components/Themed";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSpabase } from "../hooks/useSupabase";

WebBrowser.maybeCompleteAuthSession();

function Login() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const redirectUrl = createURL("/(home)");
  const linkUrl = useURL();
  const { setOAuthSession, loggedIn, getGoogleOAuthUrl } = useSpabase();
  React.useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  useEffect(() => {
    if (linkUrl) {
      const data = extractParamsFromUrl(linkUrl);

      if (!data.access_token || !data.refresh_token) return;

      setOAuthSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
    }
  }, [linkUrl]);

  const onSignInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const url = await getGoogleOAuthUrl();
      if (!url) return;

      const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl, {
        showInRecents: true,
      });

      if (result.type === WebBrowser.WebBrowserResultType.CANCEL) {
        setError(new Error("User cancelled the auth"));
      }
    } catch (error) {
      // Handle error here
      console.log(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const extractParamsFromUrl = (url: string) => {
    const params = new URLSearchParams(url.split("#")[1]);
    const data = {
      access_token: params.get("access_token"),
      expires_in: parseInt(params.get("expires_in") || "0"),
      refresh_token: params.get("refresh_token"),
      token_type: params.get("token_type"),
      provider_token: params.get("provider_token"),
    };

    return data;
  };

  return (
    <View style={styles.container}>
      <Text>Login</Text>
      <Button onPress={() => router.replace("/")}>
        <Text>Go to home screen!</Text>
      </Button>
      <Button disabled={loading} onPress={() => onSignInWithGoogle()}>
        <Text>{loading ? "Loading..." : "Sign in with Google"}</Text>
      </Button>
      {error && <Text>{error.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    flexDirection: "column",
  },
});

export default Login;
