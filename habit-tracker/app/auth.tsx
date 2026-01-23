import { KeyboardAvoidingView, Platform, View, StyleSheet } from "react-native";
import { Button, Text, TextInput } from 'react-native-paper';
import { useState } from "react";

export default function AuthScreen() {

  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);

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
          style={styles.input} />

        <TextInput
        label="Password"
        autoCapitalize="none"
        keyboardType="email-address"
        mode="outlined"
        style={styles.input} />

        <Button style={styles.button} mode="contained">{isSignedUp ? "Sign Up" : "Sign In"}</Button>

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
  }
});