const environment = import.meta.env.VITE_ENVIRONMENT || "TEST";

const urls: Record<string, string> = {
  PRODUCTION: import.meta.env.VITE_BASE_URL_PRODUCTION ?? "",
  TEST: import.meta.env.VITE_BASE_URL_TEST ?? "",
  DEVELOPMENT: import.meta.env.VITE_BASE_URL_DEVELOPMENT ?? "",
};

export const baseUrl = urls[environment];