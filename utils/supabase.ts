import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

const isConfigured = supabaseUrl && supabaseAnonKey;

if (!isConfigured) {
  console.warn(
    "Supabase credentials not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
  );
}

// Use dummy values if not configured to prevent client creation errors
// The app will work in offline mode without Supabase
const clientUrl = isConfigured ? supabaseUrl : "https://placeholder.supabase.co";
const clientKey = isConfigured ? supabaseAnonKey : "placeholder-anon-key";

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export { isConfigured as isSupabaseConfigured };
