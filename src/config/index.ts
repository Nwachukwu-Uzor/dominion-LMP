const environment = import.meta.env.VITE_ENVIRONMENT || "TEST";

const urls: Record<string, string> = {
  LIVE: import.meta.env.VITE_BASE_URL_LIVE ?? "",
  TEST: import.meta.env.VITE_BASE_URL_TEST ?? "",
  DEVELOPMENT: import.meta.env.VITE_BASE_URL_DEVELOPMENT ?? "",
};

export const baseUrl = urls[environment];
