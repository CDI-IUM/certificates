document.addEventListener('DOMContentLoaded', () => {
  const issuerBadge = document.querySelector('[data-issuer]');
  const statusPill = document.getElementById('status-pill');
  const statusMessage = document.getElementById('status-message');
  const errorCard = document.getElementById('error-card');
  const errorMessage = document.getElementById('error-message');
  const certificateCard = document.getElementById('certificate-card');
  const certificateDetails = document.getElementById('certificate-details');
  const copyLinkBtn = document.getElementById('copy-link');
  const printButtons = [
    document.getElementById('print-btn'),
    document.getElementById('print-btn-secondary'),
  ].filter(Boolean);

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  copyLinkBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyLinkBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyLinkBtn.textContent = '🔗 Copy Link';
      }, 1500);
    } catch (error) {
      alert('Unable to copy link on this device.');
    }
  });

  printButtons.forEach((btn) =>
    btn.addEventListener('click', () => {
      window.print();
    }),
  );

  CryptoUtils.loadConfig()
    .then((config) => {
      if (issuerBadge) {
        issuerBadge.textContent = config.ISSUER;
      }
      attemptVerification(config);
    })
    .catch((error) => {
      showError('Configuration error: ' + error.message);
      setStatus('Configuration error', 'Fix config.json before verifying certificates.', false);
    });

  function attemptVerification(config) {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');

    if (!data) {
      setStatus(
        'Waiting for data…',
        'Provide a ?data= parameter or scan a QR code to begin verification.',
        false,
      );
      return;
    }

    try {
      const certificate = CryptoUtils.decodeCertificate(data, config.SECRET_KEY);
      renderCertificate(certificate);
      setStatus(
        'Certificate verified',
        `This certificate is valid and issued by ${certificate.issuer}.`,
        true,
      );
    } catch (error) {
      showError(error.message);
      setStatus('Verification failed', 'See error details below.', false);
    }
  }

  function renderCertificate(certificate) {
    errorCard.style.display = 'none';
    certificateCard.style.display = 'block';

    const fields = [
      { label: 'Certificate ID', value: certificate.certificateId },
      { label: 'Full Name', value: certificate.fullName },
      { label: 'Course Name', value: certificate.courseName },
      {
        label: 'Completion Date',
        value: new Date(certificate.completionDate).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      },
      { label: 'Issuer', value: certificate.issuer },
    ];

    certificateDetails.innerHTML = fields
      .map(
        ({ label, value }) => `
        <div class="certificate-field">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `,
      )
      .join('');
  }

  function setStatus(title, message, isValid) {
    statusPill.textContent = title;
    statusPill.className = `status-pill ${isValid ? 'status-valid' : 'status-invalid'}`;
    statusMessage.textContent = message;
  }

  function showError(message) {
    errorCard.style.display = 'block';
    errorMessage.textContent = message;
    certificateCard.style.display = 'none';
  }
});
