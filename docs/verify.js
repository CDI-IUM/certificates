const registryUrl = './data.json';

document.addEventListener('DOMContentLoaded', () => {
  const lookupForm = document.getElementById('lookup-form');
  const inputEl = document.getElementById('certificate-id');
  const statusText = document.getElementById('status-text');
  const recordCard = document.getElementById('record-card');
  const errorCard = document.getElementById('error-card');
  const errorText = document.getElementById('error-text');
  const copyLinkBtn = document.getElementById('copy-link');
  const printBtn = document.getElementById('print-btn');

  const fieldTitle = document.getElementById('record-title');
  const fieldCertId = document.getElementById('field-cert-id');
  const fieldName = document.getElementById('field-name');
  const fieldCourse = document.getElementById('field-course');
  const fieldDate = document.getElementById('field-date');
  const fieldIssuer = document.getElementById('field-issuer');

  let registry = [];
  let activeRecord;

  lookupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const raw = inputEl.value.trim();
    await verifyId(raw);
  });

  copyLinkBtn?.addEventListener('click', async () => {
    if (!activeRecord) return;
    const url = new URL(window.location.href);
    url.searchParams.set('id', activeRecord.id || activeRecord.certificateId);
    try {
      await navigator.clipboard.writeText(url.toString());
      copyLinkBtn.textContent = 'Copied';
      setTimeout(() => {
        copyLinkBtn.textContent = 'Copy link';
      }, 1200);
    } catch (error) {
      alert('Copy not available on this device.');
    }
  });

  printBtn?.addEventListener('click', () => window.print());

  initFromQuery();

  async function initFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      inputEl.value = id;
      await verifyId(id);
    }
  }

  async function loadRegistry() {
    if (registry.length) return registry;
    const response = await fetch(`${registryUrl}?_=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Unable to load registry data');
    }
    registry = await response.json();
    return registry;
  }

  async function verifyId(value) {
    hide(recordCard);
    hide(errorCard);

    if (!value) {
      setStatus('Enter a certificate ID.');
      return;
    }

    setStatus('Checking registry…');

    try {
      const items = await loadRegistry();
      const match = items.find((item) => {
        const search = value.toLowerCase();
        return [item.id, item.certificateId]
          .filter(Boolean)
          .some((candidate) => candidate.trim().toLowerCase() === search);
      });

      if (match) {
        activeRecord = match;
        renderRecord(match);
        setStatus('Record found.');
      } else {
        activeRecord = undefined;
        showError('No matching certificate in the registry.');
      }
    } catch (error) {
      activeRecord = undefined;
      showError(error.message);
    }
  }

  function renderRecord(record) {
    fieldTitle.textContent = record.fullName;
    fieldCertId.textContent = record.certificateId || '—';
    fieldName.textContent = record.fullName || '—';
    fieldCourse.textContent = record.courseName || '—';
    fieldDate.textContent = formatDate(record.completionDate);
    fieldIssuer.textContent = record.issuer || '—';

    show(recordCard);
  }

  function showError(message) {
    errorText.textContent = message;
    show(errorCard);
    setStatus('No record found.');
  }

  function setStatus(text) {
    statusText.textContent = text;
  }

  function show(node) {
    node.classList.remove('hidden');
  }

  function hide(node) {
    node.classList.add('hidden');
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }
});
