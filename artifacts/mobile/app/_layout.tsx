import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import Head from "expo-router/head";
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
      <Head>
        <title>CuraVicino — Assistenza Anziani e Servizi a Domicilio</title>
        <meta
          name="description"
          content="CuraVicino mette in contatto famiglie italiane con professionisti verificati per assistenza anziani, consegne a domicilio e servizi domestici. Prenota online in pochi minuti."
        />
        <meta name="theme-color" content="#009246" />
        <meta property="og:title" content="CuraVicino" />
        <meta
          property="og:description"
          content="Assistenza anziani, consegne e servizi domestici con professionisti verificati in Italia."
        />
        <meta property="og:type" content="website" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <LanguageProvider>
            <AuthProvider>
              <BookingProvider>
                <RealtimeProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="auth/welcome" />
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
