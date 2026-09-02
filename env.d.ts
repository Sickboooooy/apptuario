declare namespace Cloudflare {
  interface Env {
    FILES: R2Bucket;
    ORS_API_KEY?: string;
    CHATGPT_CONNECTOR_SECRET?: string;
    // Deployment lock (invariant 5): defaults to disabled when unset. Only
    // 'true' enables free-text capture of natural_person recipients; any
    // other value (including missing) keeps the synthetic-dataset-only
    // restriction active. See lib/recipient-capture-policy.ts.
    REAL_JUDICIAL_DATA?: string;
  }
}
