import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import LogoutButton from "../../components/LogoutButton";
import React from "react";

export default function HomeLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          drawerStatusBarAnimation: "slide",
          headerRight: () => <LogoutButton />,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Tiendas Registradas",
            title: "Tiendas Registradas",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
