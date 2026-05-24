import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { RealtimeProvider } from "@/context/RealtimeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <LanguageProvider>
            <AuthProvider>
              <BookingProvider>
                <RealtimeProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="auth/login" />
                    <Stack.Screen name="auth/register-type" />
                    <Stack.Screen name="auth/customer-register" />
                    <Stack.Screen name="auth/provider-register" />
                    <Stack.Screen name="services/[category]" />
                    <Stack.Screen
                      name="provider/[id]"
                      options={{
                        animation: "slide_from_right",
                      }}
                    />
                    <Stack.Screen name="booking/[id]" />
                    <Stack.Screen name="tracking/[id]" />
                    <Stack.Screen name="support" />
                    <Stack.Screen name="complaints" />
                    <Stack.Screen name="terms" />
                    <Stack.Screen name="qr-code" />
                  </Stack>
                </RealtimeProvider>
              </BookingProvider>
            </AuthProvider>
          </LanguageProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
