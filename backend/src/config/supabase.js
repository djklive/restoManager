import { createClient } from "@supabase/supabase-js";
import { AppError } from "../utils/AppError.js";

export const getSupabaseConfig = () => {
  const {
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    SUPABASE_BUCKET_NAME = "restomanager",
  } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new AppError(
      500,
      "INTERNAL_ERROR",
      "Configuration Supabase incomplète (SUPABASE_URL / SUPABASE_SERVICE_KEY)"
    );
  }

  return {
    url: SUPABASE_URL,
    serviceKey: SUPABASE_SERVICE_KEY,
    bucketName: SUPABASE_BUCKET_NAME,
  };
};

export const getSupabaseAdmin = () => {
  const { url, serviceKey } = getSupabaseConfig();
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
