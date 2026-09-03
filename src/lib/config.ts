type ServerConfig = {
  databaseUrl: string;
  cloudflareAccountId: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  r2BucketName: string;
  r2PublicUrl: string;
  resendApiKey: string;
  emailFrom: string;
  baseUrl: string;
  ticketSessionSecret: string;
};

const requiredVariables = [
  "DATABASE_URL",
  "CLOUDFLARE_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_URL",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_BASE_URL",
  "TICKET_SESSION_SECRET",
] as const;

function isLoopbackHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/[\[\]]/g, "");
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1"
  );
}

function validateHttpsUrl(value: string, variableName: string) {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${variableName} must be a valid HTTPS URL.`);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(`${variableName} must use HTTPS in production.`);
  }

  return parsed;
}

export function getServerConfig(): ServerConfig {
  const isProduction = process.env.NODE_ENV === "production";
  const values = Object.fromEntries(
    requiredVariables.map((name) => [name, process.env[name]?.trim() ?? ""])
  ) as Record<(typeof requiredVariables)[number], string>;

  if (isProduction) {
    const missing = requiredVariables.filter((name) => !values[name]);
    if (missing.length > 0) {
      throw new Error(
        `Production configuration is missing required variables: ${missing.join(", ")}`
      );
    }

    const baseUrl = validateHttpsUrl(
      values.NEXT_PUBLIC_BASE_URL,
      "NEXT_PUBLIC_BASE_URL"
    );
    if (isLoopbackHostname(baseUrl.hostname)) {
      throw new Error(
        "NEXT_PUBLIC_BASE_URL must not use localhost or a loopback address in production."
      );
    }

    validateHttpsUrl(values.R2_PUBLIC_URL, "R2_PUBLIC_URL");
  }

  return {
    databaseUrl: values.DATABASE_URL || "file:./dev.db",
    cloudflareAccountId: values.CLOUDFLARE_ACCOUNT_ID,
    r2AccessKeyId: values.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: values.R2_SECRET_ACCESS_KEY,
    r2BucketName: values.R2_BUCKET_NAME,
    r2PublicUrl: values.R2_PUBLIC_URL,
    resendApiKey: values.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM?.trim() || "onboarding@resend.dev",
    baseUrl: values.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    ticketSessionSecret: values.TICKET_SESSION_SECRET,
  };
}
