/*
Optional FingerprintJS Pro server-side enrichment helper.
If you set FINGERPRINT_PRO_API_KEY and FINGERPRINT_PRO_REGION in .env, you can call
the pro API to enrich visitor data. This file uses axios to call the REST API.

Docs: https://dev.fingerprint.com/docs
*/
import axios from "axios";

export async function enrichFingerprint(visitorId) {
  const key = process.env.FINGERPRINT_PRO_API_KEY;
  const region = process.env.FINGERPRINT_PRO_REGION || "us";
  if (!key) return null;

  try {
    const url = `https://api.fp.${region}.fingerprint.com/visitor/${visitorId}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${key}` },
      timeout: 5000
    });
    return res.data;
  } catch (err) {
    console.warn("Fingerprint Pro enrichment failed:", err?.response?.data || err.message);
    return null;
  }
}
