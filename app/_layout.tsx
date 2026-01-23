import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";


function RouteGuard({children}: {children: React.ReactNode}) {
  const router = useRouter();
  const isAuth = false;

  useEffect(() => {
    if (!isAuth) {
      // Triggers navigation to AuthScreen
      // If AuthScreen is defined in app/auth.tsx, it is likely being resolved automatically by Expo Router based on the file structure.
      router.replace("/auth");
    }
  });

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <RouteGuard>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </RouteGuard>
  );
}
