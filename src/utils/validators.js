// /src/utils/validators.js
import { getStateByGSTCode } from '@/constants/indianStates';

// ── GSTIN ────────────────────────────────────────────────────────────────────

/**
 * GSTIN format: 2-digit state code + 10-char PAN + 1-digit entity number +
 *               'Z' (default) + 1 checksum character
 * Total: 15 characters
 *
 * Checksum algorithm per GST council spec.
 */
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const GSTIN_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function computeGSTINChecksum(gstin14) {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const val    = GSTIN_CHARS.indexOf(gstin14[i]);
    const factor = (i % 2 === 0) ? 1 : 2;
    const product = val * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }
  const remainder = sum % 36;
  return GSTIN_CHARS[(36 - remainder) % 36];
}

/**
 * Validate a GSTIN.
 * @param {string} gstin
 * @returns {{ isValid: boolean, message: string, stateCode: string|null }}
 */
export function validateGSTIN(gstin) {
  if (!gstin || typeof gstin !== 'string') {
    return { isValid: false, message: 'GSTIN is required', stateCode: null };
  }

  const g = gstin.trim().toUpperCase();

  if (g.length !== 15) {
    return { isValid: false, message: 'GSTIN must be exactly 15 characters', stateCode: null };
  }

  if (!GSTIN_REGEX.test(g)) {
    return {
      isValid  : false,
      message  : 'Invalid GSTIN format (expected: 22AAAAA0000A1Z5)',
      stateCode: null,
    };
  }

  const stateCode  = g.slice(0, 2);
  const stateEntry = getStateByGSTCode(stateCode);

  if (!stateEntry) {
    return {
      isValid  : false,
      message  : `Invalid state code "${stateCode}" in GSTIN`,
      stateCode: null,
    };
  }

  const expectedChecksum = computeGSTINChecksum(g.slice(0, 14));
  if (g[14] !== expectedChecksum) {
    return {
      isValid  : false,
      message  : 'GSTIN checksum is invalid',
      stateCode: stateCode,
    };
  }

  return {
    isValid  : true,
    message  : `Valid GSTIN — ${stateEntry.name}`,
    stateCode: stateCode,
    stateName: stateEntry.name,
  };
}

// ── PAN ──────────────────────────────────────────────────────────────────────

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

/**
 * PAN type map (4th character)
 * P = Individual, C = Company, H = HUF, F = Firm, A = AOP,
 * T = Trust, B = BOI, L = Local Authority, J = Artificial Juridical Person, G = Government
 */
const PAN_TYPE_MAP = {
  P: 'Individual', C: 'Company', H: 'HUF (Hindu Undivided Family)',
  F: 'Firm', A: 'Association of Persons', T: 'Trust',
  B: 'Body of Individuals', L: 'Local Authority',
  J: 'Artificial Juridical Person', G: 'Government',
};

/**
 * Validate a PAN number.
 * @param {string} pan
 * @returns {{ isValid: boolean, message: string, panType?: string }}
 */
export function validatePAN(pan) {
  if (!pan || typeof pan !== 'string') {
    return { isValid: false, message: 'PAN is required' };
  }

  const p = pan.trim().toUpperCase();

  if (p.length !== 10) {
    return { isValid: false, message: 'PAN must be exactly 10 characters' };
  }

  if (!PAN_REGEX.test(p)) {
    return { isValid: false, message: 'Invalid PAN format (expected: ABCDE1234F)' };
  }

  const typeChar = p[3];
  const panType  = PAN_TYPE_MAP[typeChar] || 'Unknown';

  return {
    isValid : true,
    message : `Valid PAN — ${panType}`,
    panType,
  };
}

// ── IFSC ─────────────────────────────────────────────────────────────────────

// 4 letters (bank code) + 0 (always) + 6 alphanumeric (branch)
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/**
 * Validate an IFSC code.
 * @param {string} ifsc
 * @returns {{ isValid: boolean, message: string, bankCode?: string }}
 */
export function validateIFSC(ifsc) {
  if (!ifsc || typeof ifsc !== 'string') {
    return { isValid: false, message: 'IFSC code is required' };
  }

  const code = ifsc.trim().toUpperCase();

  if (code.length !== 11) {
    return { isValid: false, message: 'IFSC must be exactly 11 characters' };
  }

  if (!IFSC_REGEX.test(code)) {
    return { isValid: false, message: 'Invalid IFSC format (expected: SBIN0001234)' };
  }

  return {
    isValid  : true,
    message  : 'Valid IFSC code',
    bankCode : code.slice(0, 4),
    branch   : code.slice(5),
  };
}

// ── Email ────────────────────────────────────────────────────────────────────

// RFC 5322-inspired, practical regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

/**
 * Validate an email address.
 * @param {string} email
 * @returns {{ isValid: boolean, message: string }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email is required' };
  }

  const e = email.trim();

  if (e.length > 254) {
    return { isValid: false, message: 'Email address is too long' };
  }

  if (!EMAIL_REGEX.test(e)) {
    return { isValid: false, message: 'Invalid email address format' };
  }

  return { isValid: true, message: 'Valid email address' };
}

// ── Phone ────────────────────────────────────────────────────────────────────

// Accepts +91 prefix optionally, then 10-digit Indian number starting with 6-9
const PHONE_REGEX = /^(\+91[\s\-]?)?[6-9]\d{9}$/;

/**
 * Validate an Indian mobile/phone number.
 * @param {string} phone
 * @returns {{ isValid: boolean, message: string }}
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, message: 'Phone number is required' };
  }

  const p = phone.trim().replace(/[\s\-()]/g, '');

  if (!PHONE_REGEX.test(p)) {
    return {
      isValid: false,
      message: 'Invalid phone number — must be a 10-digit Indian number (starting with 6-9)',
    };
  }

  return { isValid: true, message: 'Valid phone number' };
}

// ── PIN Code ──────────────────────────────────────────────────────────────────

// Indian PIN codes are exactly 6 digits, first digit 1-9
const PIN_REGEX = /^[1-9][0-9]{5}$/;

/**
 * Validate an Indian PIN code.
 * @param {string} pin
 * @returns {{ isValid: boolean, message: string }}
 */
export function validatePIN(pin) {
  if (!pin || typeof pin !== 'string') {
    return { isValid: false, message: 'PIN code is required' };
  }

  const p = pin.trim();

  if (p.length !== 6) {
    return { isValid: false, message: 'PIN code must be exactly 6 digits' };
  }

  if (!PIN_REGEX.test(p)) {
    return { isValid: false, message: 'Invalid PIN code — must be 6 digits starting with 1-9' };
  }

  return { isValid: true, message: 'Valid PIN code' };
}
