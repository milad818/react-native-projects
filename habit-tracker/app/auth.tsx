import { KeyboardAvoidingView, Platform, View, StyleSheet } from "react-native";
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";



export default function AuthScreen() {

  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>("");

  const theme = useTheme();
  const router = useRouter();

  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please fill in all the fields.")
      return;
    }

    if(password.length < 6) {
      setError("Passwords must be at least 6 characters long.");
      return;
    }

    setError(null);

    if (isSignedUp) {
      const error = await signUp(email, password);
      if (error) {
        setError(error);
        return;
      }
    } else {
      const error = await signIn(email, password);
      if (error) {
        setError(error);
        return;
      } 

      router.replace("/");

    }
  }
  
  const handleSwitchMode = () => {
    setIsSignedUp((prev) => !prev);
  }

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}
              variant="headlineMedium">{isSignedUp ? "Create Account" : "Welcome Back!"}</Text>

        <TextInput
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="example@gmail.com"
          mode="outlined"
          style={styles.input}
          onChangeText={setEmail} />

        <TextInput
          label="Password"
          autoCapitalize="none"
          mode="outlined"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword} />

        {error && <Text style={{ color: theme.colors.error, alignSelf: "center", width: "90%" }}>{error}</Text>}

        <Button style={styles.button} 
                mode="contained"
                onPress={handleAuth}>
          { isSignedUp ? "Sign Up" : "Sign In"}</Button>

        <Button mode="text"
                onPress={handleSwitchMode}
                style={styles.switchModeButton}>
          { isSignedUp
            ? "Do you already have an account? Sign In"
            : "Don't have an account? Sign Up"}</Button>
      </View>

    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },

  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },

  title: {
    textAlign: "center",
    // fontSize: 16,
    // fontWeight: "bold",
    marginBottom: 30
  },

  input: {
    margin: 8,
    width: '90%',
    alignSelf: 'center'
  },

  button: {
    marginTop: 8,
    width: '50%',
    alignSelf: 'center'
  },

  switchModeButton: {
    marginTop: 16
  },

});