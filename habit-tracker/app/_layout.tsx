import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";


function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();
  const segments = useSegments();

  useEffect(() => {

    const isInAuthGroup = segments[0] === "auth";

    if (!user && !isInAuthGroup && !isLoadingUser) {
      // Triggers navigation to AuthScreen
      // If AuthScreen is defined in app/auth.tsx, it is likely being resolved automatically by Expo Router based on the file structure.
      router.replace("/auth");
    } else if (user && isInAuthGroup && !isLoadingUser) {
      router.replace("/");
    }

  }, [user, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <SafeAreaProvider>
          <RouteGuard>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </RouteGuard>
        </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>

  );
}
