document.addEventListener('DOMContentLoaded', () => {
  const certificateForm = document.getElementById('certificate-form');
  const certificateIdInput = document.getElementById('certificateId');
  const fullNameInput = document.getElementById('fullName');
  const courseNameInput = document.getElementById('courseName');
  const completionDateInput = document.getElementById('completionDate');
  const issuerInput = document.getElementById('issuer');
  const autoIdBtn = document.getElementById('auto-id');
  const generateBtn = document.getElementById('generate-btn');
  const copyUrlBtn = document.getElementById('copy-url');
  const downloadQrBtn = document.getElementById('download-qr');
  const clearFormBtn = document.getElementById('clear-form');
  const verificationUrlEl = document.getElementById('verification-url');
  const payloadPreview = document.getElementById('payload-preview');
  const qrContainer = document.getElementById('qrcode');
  const csvUploadInput = document.getElementById('csv-upload');
  const processCsvBtn = document.getElementById('process-csv');
  const downloadBatchBtn = document.getElementById('download-batch');
  const batchResults = document.getElementById('batch-results');
  const batchResultsBody = batchResults.querySelector('tbody');
  const batchError = document.getElementById('batch-error');
  const batchProgress = document.getElementById('batch-progress');
  const batchStatus = document.getElementById('batch-status');
  const yearEl = document.getElementById('year');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  let config;
  let qrCode;
  let latestBase64;
  let zipArchive;

  CryptoUtils.loadConfig()
    .then((cfg) => {
      config = cfg;
      issuerInput.value = cfg.ISSUER;
      certificateIdInput.value = `${cfg.CERTIFICATE_PREFIX}${new Date()
        .getTime()
        .toString(36)
        .toUpperCase()}`;
    })
    .catch((error) => {
      alert('Unable to load config.json. Check console for details.');
      console.error(error);
    });

  autoIdBtn.addEventListener('click', () => {
    certificateIdInput.value = CryptoUtils.generateCertificateId(config?.CERTIFICATE_PREFIX || 'CERT-');
  });

  certificateForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!config) {
      alert('Configuration not loaded yet.');
      return;
    }

    const certificate = {
      certificateId: certificateIdInput.value.trim(),
      fullName: fullNameInput.value.trim(),
      courseName: courseNameInput.value.trim(),
      completionDate: completionDateInput.value,
      issuer: issuerInput.value.trim() || config.ISSUER,
    };

    try {
      const { base64, jsonString } = CryptoUtils.encodeCertificate(certificate, config.SECRET_KEY);
      latestBase64 = base64;
      const verificationUrl = `${CryptoUtils.trimBaseUrl(config.BASE_URL)}/verify.html?data=${base64}`;

      verificationUrlEl.textContent = verificationUrl;
      payloadPreview.textContent = jsonString;
      copyUrlBtn.disabled = false;
      downloadQrBtn.disabled = false;

      renderQrCode(verificationUrl);
    } catch (error) {
      alert(error.message);
    }
  });

  copyUrlBtn.addEventListener('click', async () => {
    if (!latestBase64 || copyUrlBtn.disabled) return;
    try {
      await navigator.clipboard.writeText(verificationUrlEl.textContent);
      copyUrlBtn.textContent = 'Copied!';
      setTimeout(() => (copyUrlBtn.textContent = 'Copy URL'), 1500);
    } catch (error) {
      alert('Clipboard permissions denied.');
    }
  });

  clearFormBtn.addEventListener('click', () => {
    certificateForm.reset();
    issuerInput.value = config?.ISSUER || '';
    verificationUrlEl.textContent = 'Create a certificate to generate the link.';
    payloadPreview.textContent = '{ }';
    qrContainer.innerHTML = '';
    copyUrlBtn.disabled = true;
    downloadQrBtn.disabled = true;
    latestBase64 = undefined;
  });

  downloadQrBtn.addEventListener('click', () => {
    if (!qrCode || downloadQrBtn.disabled) return;
    const canvas = qrContainer.querySelector('canvas');
    if (!canvas) {
      alert('QR code not available yet.');
      return;
    }
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${certificateIdInput.value || 'certificate'}.png`;
    link.click();
  });

  function renderQrCode(text) {
    qrContainer.innerHTML = '';
    qrCode = new QRCode(qrContainer, {
      text,
      width: 210,
      height: 210,
      colorDark: '#1e293b',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
    });
  }

  processCsvBtn.addEventListener('click', async () => {
    if (!csvUploadInput.files.length) {
      alert('Select a CSV file first.');
      return;
    }

    const file = csvUploadInput.files[0];
    const text = await file.text();
    const rows = text.trim().split(/\r?\n/);
    const headers = rows.shift().split(',').map((h) => h.trim());

    const requiredHeaders = ['fullName', 'courseName', 'completionDate'];
    const missing = requiredHeaders.filter((h) => !headers.includes(h));
    if (missing.length) {
      showBatchError(`Missing columns: ${missing.join(', ')}`);
      return;
    }

    batchResultsBody.innerHTML = '';
    batchResults.style.display = 'none';
    batchError.style.display = 'none';
    batchProgress.style.display = 'flex';
    batchStatus.textContent = 'Initializing…';

    zipArchive = new JSZip();

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (!row.trim()) continue;
      const values = row.split(',').map((value) => value.trim());
      const record = Object.fromEntries(headers.map((header, index) => [header, values[index]]));

      const certificate = {
        certificateId: CryptoUtils.generateCertificateId(
          config?.CERTIFICATE_PREFIX || 'CERT-',
          Date.now() + i,
        ),
        fullName: record.fullName,
        courseName: record.courseName,
        completionDate: record.completionDate,
        issuer: config?.ISSUER || record.issuer || 'Certificate Issuer',
      };

      try {
        const { base64 } = CryptoUtils.encodeCertificate(certificate, config.SECRET_KEY);
        const verificationUrl = `${CryptoUtils.trimBaseUrl(config.BASE_URL)}/verify.html?data=${base64}`;
        const qrCanvas = await createQrCanvas(verificationUrl);
        const pngData = qrCanvas.toDataURL('image/png').split(',')[1];
        zipArchive.file(`${certificate.certificateId}.png`, pngData, { base64: true });

        appendBatchRow({ ...certificate, status: 'Ready', verificationUrl });
        batchStatus.textContent = `Processed ${i + 1} / ${rows.length}`;
      } catch (error) {
        appendBatchRow({ ...certificate, status: 'Error: ' + error.message });
      }
    }

    batchProgress.style.display = 'none';
    batchResults.style.display = 'block';
    downloadBatchBtn.disabled = false;
  });

  async function createQrCanvas(text) {
    return new Promise((resolve, reject) => {
      const tempDiv = document.createElement('div');
      const qrTemp = new QRCode(tempDiv, {
        text,
        width: 210,
        height: 210,
        colorDark: '#1e293b',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M,
      });
      setTimeout(() => {
        const canvas = tempDiv.querySelector('canvas');
        if (canvas) {
          resolve(canvas);
        } else {
          reject(new Error('QR rendering failed.'));
        }
        tempDiv.remove();
        qrTemp.clear();
      }, 50);
    });
  }

  function appendBatchRow({ certificateId, fullName, courseName, completionDate, status }) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${batchResultsBody.children.length + 1}</td>
      <td>${certificateId}</td>
      <td>${fullName}</td>
      <td>${courseName}</td>
      <td>${completionDate}</td>
      <td>${status}</td>
    `;
    batchResultsBody.appendChild(row);
  }

  downloadBatchBtn.addEventListener('click', async () => {
    if (!zipArchive) return;
    const content = await zipArchive.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `qr-codes-${Date.now()}.zip`;
    link.click();
  });

  function showBatchError(message) {
    batchError.style.display = 'block';
    batchError.textContent = message;
  }
});
