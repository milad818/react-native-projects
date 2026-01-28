import {Client, Account, Databases} from 'react-native-appwrite';




export const client = new Client().setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
                           .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
                           .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!);


// Specify what services to initialize in the project for appwrite
export const account = new Account(client);
export const database = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_DB_ID!
const HABITS_COLLECTION_ID = process.env.EXPO_PUBLIC_HABITS_COLLECTION_ID