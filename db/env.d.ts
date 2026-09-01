declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    FILES: R2Bucket;
    ORS_API_KEY?: string;
    CHATGPT_CONNECTOR_SECRET?: string;
  }
}
