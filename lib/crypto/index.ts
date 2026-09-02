export { blindIndex, normalizeForIndex } from './blind-index';
export { fromBase64Url, toBase64Url } from './encoding';
export {
  decryptField,
  encryptField,
  FieldDecryptionError,
  type EncryptedField,
  type FieldAad,
} from './field';
export {
  DEK_ALGORITHM,
  DEK_USAGES,
  generateDataKey,
  generateHmacKey,
  generateKek,
  generateSalt,
  importHmacKey,
  KEK_ALGORITHM,
  KEK_USAGES,
} from './keys';
export { deriveRootKey, ROOT_KEY_PBKDF2_ITERATIONS } from './root-key';
export {
  rotateAccountKey,
  unwrapKey,
  wrapKey,
  type WrappedDekRecord,
} from './wrap';
