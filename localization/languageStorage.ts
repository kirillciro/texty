import * as SecureStore from "expo-secure-store";

const LANGUAGE_KEY = "APP_LANGUAGE";

export const saveLanguage = async (lang: string) => {
  await SecureStore.setItemAsync(LANGUAGE_KEY, lang);
};

export const loadLanguage = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(LANGUAGE_KEY);
};
