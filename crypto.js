(function () {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let configPromise;

  async function loadConfig() {
    if (!configPromise) {
      configPromise = fetch('./config.json?_=' + Date.now(), { cache: 'no-store' })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Unable to load config.json');
          }
          return response.json();
        });
    }
    return configPromise;
  }

  function xorCipher(payload, key) {
    if (!key) {
      throw new Error('Missing secret key');
    }
    let result = '';
    for (let i = 0; i < payload.length; i += 1) {
      const code = payload.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(code);
    }
    return result;
  }

  function toBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function fromBase64(base64) {
    try {
      return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
      throw new Error('Invalid base64 encoding');
    }
  }

  function normalizeCertData(certificate) {
    const required = ['certificateId', 'fullName', 'courseName', 'completionDate', 'issuer'];
    required.forEach((key) => {
      if (!certificate[key]) {
        throw new Error(`Missing required field: ${key}`);
      }
    });
    return {
      certificateId: String(certificate.certificateId).trim(),
      fullName: String(certificate.fullName).trim(),
      courseName: String(certificate.courseName).trim(),
      completionDate: String(certificate.completionDate).trim(),
      issuer: String(certificate.issuer).trim(),
    };
  }

  function encodeCertificate(certificate, secretKey) {
    const normalized = normalizeCertData(certificate);
    const jsonString = JSON.stringify(normalized);
    const encrypted = xorCipher(jsonString, secretKey);
    const base64 = toBase64(encrypted);
    return { base64, encrypted, jsonString };
  }

  function decodeCertificate(base64Data, secretKey) {
    if (!base64Data) {
      throw new Error('Missing data parameter');
    }
    const sanitized = base64Data.replace(/\s/g, '');
    const decryptedJson = xorCipher(fromBase64(sanitized), secretKey);
    try {
      const parsed = JSON.parse(decryptedJson);
      return normalizeCertData(parsed);
    } catch (error) {
      throw new Error('Certificate payload is invalid or has been tampered with.');
    }
  }

  function generateCertificateId(prefix = 'CERT-', sequence = Date.now()) {
    const suffix = sequence.toString(36).toUpperCase();
    return `${prefix}${suffix}`;
  }

  function trimBaseUrl(url) {
    return url.replace(/\/$/, '');
  }

  window.CryptoUtils = {
    loadConfig,
    xorCipher,
    encodeCertificate,
    decodeCertificate,
    generateCertificateId,
    trimBaseUrl,
  };
})();
