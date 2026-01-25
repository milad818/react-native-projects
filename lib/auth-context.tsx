import React, { createContext, useContext, useEffect, useState } from "react";
import { Models, ID } from "react-native-appwrite";
import { account } from "./appwrite";


type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  isLoadingUser: boolean
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

// Create context to define the shared data store
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Define provide used for distributing information about authentication on the project
// Inline type definition for children is an alternative to 
// interface Props { children: React.ReactNode; } passing props to AuthProvider
export function AuthProvider({children}: {children: React.ReactNode}) {
  
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(false)

  // Call getUser function when AuthProvider renders
  useEffect(() => {
    getUser();
  }, [])

  // Check to see if there is a session for the user when AuthProvider is first rendered
  const getUser = async () => {
    try {
      const session = await account.get()
      setUser(session);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }

  const signUp = async (email: string, password:string) => {
    try {
      await account.create(ID.unique(), email, password);
      // Automatically sign in the user after they have sigend up
      await signIn(email, password);
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }

      return "An error occured during signup";
    }

  };

  const signIn = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const session = await account.get();
      setUser(session); // Update the user state after signing in
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }

      return "An error occured during sign in";
    }
  };

  const signOut = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
    } catch (error) {
      console.log(error);
    }
  }

  return (
  // The <AuthContext.Provider> tag is a React Context Provider that wraps its children components and makes the value it provides accessible to all of them.
  // return component tree in <AuthContext.Provider> and pass it a value
  // Therefore, you can access tha value inside any child component e.g., RouteGuard via useContext()
  <AuthContext.Provider
  value={{ user, isLoadingUser, signUp, signIn, signOut }}>
    {children}
  </AuthContext.Provider>);
}


// Custom hook to use the context being created by auth provider
// and return it everywhere we need, so we don't have to constantly be importing the AuthContext in every single file
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be inside of the AuthProvider");
  }

  return context;
}
