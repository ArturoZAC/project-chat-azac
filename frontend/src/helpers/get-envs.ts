type EnvsType = {
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_API_URL_BASE: string;
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: string;
};

export const getEnvs = (): EnvsType => {
  return {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
    NEXT_PUBLIC_API_URL_BASE: process.env.NEXT_PUBLIC_API_URL_BASE || "",
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
  };
};
