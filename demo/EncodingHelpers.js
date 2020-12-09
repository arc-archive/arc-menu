/* eslint-disable no-param-reassign */
import { EncryptionEventTypes } from "@advanced-rest-client/arc-events";
/** @typedef {import('@advanced-rest-client/arc-events').ArcDecryptEvent} ArcDecryptEvent */
/** @typedef {import('@advanced-rest-client/arc-events').ArcEncryptEvent} ArcEncryptEvent */

async function encodeAes(data, passphrase) {
  // see https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
  const pwUtf8 = new TextEncoder().encode(passphrase);
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const alg = { name: 'AES-GCM', iv };
  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);
  const ptUint8 = new TextEncoder().encode(data);
  const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);
  const ctArray = Array.from(new Uint8Array(ctBuffer));
  const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');
  const ctBase64 = btoa(ctStr);
  const ivHex = Array.from(iv).map(b => (`00${  b.toString(16)}`).slice(-2)).join('');
  return ivHex+ctBase64;
}

async function decodeAes(cipherText, passphrase) {
  if (passphrase === undefined) {
    // eslint-disable-next-line no-alert
    passphrase = prompt('File password');
    if (passphrase === null) {
      throw new Error('Password is required to open the file.');
    }
  }
  try {
    const pwUtf8 = new TextEncoder().encode(passphrase);
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
    const iv = cipherText.slice(0,24).match(/.{2}/g).map(byte => parseInt(byte, 16));
    const alg = { name: 'AES-GCM', iv: new Uint8Array(iv) };
    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);
    const ctStr = atob(cipherText.slice(24));
    const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)));
    const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8);
    const plaintext = new TextDecoder().decode(plainBuffer);
    return plaintext;
  } catch (_) {
    throw new Error('Invalid password.');
  }
}

async function encode(method, data, passphrase) {
  switch (method) {
    case 'aes': return encodeAes(data, passphrase);
    default: throw new Error(`Unknown encryption method`);
  }
}

async function decode(method, data, passphrase) {
  switch (method) {
    case 'aes': return decodeAes(data, passphrase);
    default: throw new Error(`Unknown decryption method`);
  }
}

/**
 * @param {ArcDecryptEvent} e
 */
function decodeHandler(e) {
  const { method, data, passphrase } = e;
  e.preventDefault();
  e.detail.result = decode(method, data, passphrase);
}

/**
 * @param {ArcEncryptEvent} e
 */
function encodeHandler(e) {
  const { method, data, passphrase } = e;
  e.preventDefault();
  e.detail.result = encode(method, data, passphrase);
}

export default function listen() {
  window.addEventListener(EncryptionEventTypes.decrypt, decodeHandler);
  window.addEventListener(EncryptionEventTypes.encrypt, encodeHandler);
}
