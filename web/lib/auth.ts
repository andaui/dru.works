// Use Web Crypto API for Edge runtime compatibility (middleware runs in Edge)
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.SITE_PASSWORD || 'fallback-secret-change-in-production';
const TOKEN_EXPIRY_DAYS = 30;
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * TOKEN_EXPIRY_DAYS;

/**
 * Generate random bytes using Web Crypto API
 */
function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Convert Uint8Array to hex string
 */
function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create HMAC signature using Web Crypto API
 */
async function createHMAC(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  // Import key for HMAC
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // Sign the message
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  
  // Convert to hex
  return uint8ArrayToHex(new Uint8Array(signature));
}

/**
 * Generate a secure session token
 * Returns a token that includes: randomToken:timestamp:signature
 */
export async function generateSessionToken(): Promise<string> {
  const tokenBytes = randomBytes(32);
  const token = uint8ArrayToHex(tokenBytes);
  const timestamp = Date.now().toString();
  const data = `${token}:${timestamp}`;
  
  // Create HMAC signature
  const signature = await createHMAC(data, AUTH_SECRET);
  
  return `${data}:${signature}`;
}

/**
 * Verify a session token
 * Returns true if token is valid and not expired
 */
export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const parts = token.split(':');
    if (parts.length !== 3) {
      return false;
    }
    
    const [randomToken, timestamp, signature] = parts;
    const data = `${randomToken}:${timestamp}`;
    
    // Verify signature
    const expectedSignature = await createHMAC(data, AUTH_SECRET);
    
    // Constant-time comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) {
      return false;
    }
    
    let isValid = true;
    for (let i = 0; i < signature.length; i++) {
      if (signature[i] !== expectedSignature[i]) {
        isValid = false;
      }
    }
    
    if (!isValid) {
      return false;
    }
    
    // Check expiration (30 days)
    const tokenTime = parseInt(timestamp, 10);
    const now = Date.now();
    const age = now - tokenTime;
    const maxAge = TOKEN_EXPIRY_SECONDS * 1000;
    
    return age < maxAge;
  } catch {
    return false;
  }
}

