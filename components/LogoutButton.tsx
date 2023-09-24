import React from "react";
import { Button, Text } from "./Themed";
import { useRouter } from "expo-router";
import { useSpabase } from "../hooks/useSupabase";
import { Image } from "react-native";

const LogoutButton = () => {
  const router = useRouter();
  const { logOut, user } = useSpabase();
  const handlePress = (): void => {
    router.replace("/login");
  };
  if (user) {
    return (
      <Button onPress={logOut}>
        <Image
          source={{ uri: user.user_metadata.avatar_url }}
          height={30}
          width={30}
          style={{ borderRadius: 50, marginRight: 10 }}
        />
      </Button>
    );
  }
  return (
    <Button onPress={handlePress}>
      <Text>Login</Text>
    </Button>
  );
};

export default LogoutButton;
