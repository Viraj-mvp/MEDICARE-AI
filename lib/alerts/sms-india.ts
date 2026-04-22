// lib/alerts/sms-india.ts
// C4 — Validate & normalise to exactly 10-digit Indian mobile number
function validateAndNormalizePhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, ''); // strip all non-digits
    // Strip leading country code (91 or 0)
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        cleaned = cleaned.slice(2);
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
        cleaned = cleaned.slice(1);
    }
    // Indian mobile numbers start with 6-9 and are exactly 10 digits
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
        throw new Error(`Invalid Indian mobile number: "${phone}" (cleaned: "${cleaned}")`);
    }
    return cleaned;
}

export async function sendIndianSMS(phone: string, message: string) {
  let cleanPhone: string;
  try {
      cleanPhone = validateAndNormalizePhone(phone);
  } catch (err) {
      console.warn('[Fast2SMS]', (err as Error).message);
      return;
  }

  try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',          // transactional route
          message,
          language: 'english',
          flash: 0,
          numbers: cleanPhone, // Indian number without +91
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!data.return) {
          console.error('[Fast2SMS] API Error:', data.message);
      }
  } catch (error: any) {
      if (error.name === 'AbortError') {
          console.error('[Fast2SMS] Request timed out');
      } else {
          console.error('[Fast2SMS] Network Error:', error);
      }
  }
}
