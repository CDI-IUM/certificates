## QR Code Generation

The generator page will handle QR code creation automatically. You'll need to use a JavaScript QR code library.

### Recommended Library
Use **qrcode.js** from CDN:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
```

### Generation Process:
1. User fills in certificate form
2. Click "Generate Certificate"
3. Form data → JSON
4. JSON → Encrypted with secret key
5. Encrypted data → Base64
6. Base64 → QR code
7. Display QR code on page
8. Download as PNG
9. Copy URL to clipboard

### Example Code:
```javascript
// After encoding
const verificationUrl = `https://your-repo.github.io/verify?data=${base64Data}`;

// Generate QR code
const qrContainer = document.getElementById('qrcode');
qrContainer# Certificate Verification System - Developer Instructions

## Overview
Build a certificate verification system that uses base64-encoded certificate data in QR codes. The system should be hosted on GitHub Pages and work for any course dynamically.

---

## Technical Requirements

### Technology Stack
- Clean HTML5
- Vanilla JavaScript (ES6+)
- CSS3 for styling
- No external dependencies for core functionality
- GitHub Pages hosting

### How It Works
1. Each certificate has a QR code containing base64-encoded JSON data
2. User scans QR code or visits verification URL
3. Page decodes the base64 data and displays certificate details
4. No database needed - all data is in the QR code itself

---

## Implementation Details

### URL Structure
```
https://your-repo.github.io/verify?data=[BASE64_ENCRYPTED_JSON]
```

### Config.json Format
```json
{
  "SECRET_KEY": "YOUR_SUPER_SECRET_KEY_CHANGE_THIS_IMMEDIATELY_XYZ123",
  "BASE_URL": "https://yourusername.github.io/certificates",
  "ISSUER": "Your Organization Name",
  "CERTIFICATE_PREFIX": "CERT-2024-"
}
```

**CRITICAL:** The SECRET_KEY must be changed before deployment! This is what encrypts/decrypts your certificates.

### Base64 Data Format
The QR code will contain a URL parameter `data` with base64-encoded JSON. The JSON structure is:

```json
{
  "certificateId": "CERT-2024-001",
  "fullName": "John Doe",
  "courseName": "Advanced Web Development",
  "completionDate": "2024-11-15",
  "issuer": "Your Organization Name"
}
```

### Decoding Process
```javascript
// Load config.json first
let config;
fetch('./config.json')
  .then(response => response.json())
  .then(data => {
    config = data;
  });

// XOR cipher function
function xorCipher(str, key) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

// Get encrypted data from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const encryptedData = urlParams.get('data');

// Decode base64
const decodedBase64 = atob(encryptedData);

// Decrypt with secret key from config.json
const decryptedJson = xorCipher(decodedBase64, config.SECRET_KEY);

// Parse JSON
const certificate = JSON.parse(decryptedJson);
```

### Encoding Process (for generation page)
```javascript
// Load config.json first
let config;
fetch('./config.json')
  .then(response => response.json())
  .then(data => {
    config = data;
  });

// Certificate data
const certData = {
  certificateId: "CERT-2024-001",
  fullName: "John Doe",
  courseName: "Advanced Web Development",
  completionDate: "2024-11-15",
  issuer: config.ISSUER
};

// Convert to JSON string
const jsonString = JSON.stringify(certData);

// Encrypt with secret key from config.json
const encrypted = xorCipher(jsonString, config.SECRET_KEY);

// Encode to base64
const base64Data = btoa(encrypted);

// Create verification URL using BASE_URL from config.json
const verificationUrl = `${config.BASE_URL}/verify?data=${base64Data}`;
```

---

## Required Files

### 1. `config.json`
- **SECRET_KEY**: Encryption/decryption key (MUST BE CHANGED!)
- **BASE_URL**: Your GitHub Pages URL
- **ISSUER**: Default organization name
- **CERTIFICATE_PREFIX**: Prefix for certificate IDs (e.g., "CERT-2024-")

### 2. `index.html`
- Landing page with instructions
- Link to verification page and generator page

### 3. `verify.html`
- Main verification page
- Reads `data` parameter from URL
- Loads config.json to get SECRET_KEY
- Decodes base64 JSON with secret key
- Displays certificate information
- Shows validation status
- Mobile responsive

### 4. `generate.html`
- Certificate generation form
- Loads config.json to get SECRET_KEY
- Input fields for all certificate data
- Encrypts JSON with secret key to base64
- Generates verification URL
- Creates QR code
- Download QR code as image
- Copy URL to clipboard

### 5. `styles.css`
- Clean, professional styling
- Responsive design
- Print-friendly layout

### 6. `verify.js`
- Loads config.json
- Base64 decoding logic with secret key from config
- JSON parsing
- Error handling
- Display certificate details

### 7. `generate.js`
- Loads config.json
- Form handling
- JSON creation from form data
- Base64 encoding with secret key from config
- QR code generation
- URL generation
- Download functionality

### 8. `crypto.js`
- Shared encryption/decryption functions
- XOR cipher implementation
- Base64 encoding/decoding with encryption
- Reads secret key from config.json

---

## Features to Implement

### Verification Page Should:
- ✅ Decode base64 data from URL parameter
- ✅ Decrypt data using secret key (XOR cipher)
- ✅ Parse JSON certificate data
- ✅ Display all certificate fields clearly:
  - Certificate ID
  - Full Name
  - Course Name
  - Completion Date
  - Issuer
- ✅ Show "Valid Certificate" status if data decodes successfully
- ✅ Show error message if data is invalid or tampered with
- ✅ Handle missing or malformed data gracefully
- ✅ Be mobile responsive
- ✅ Include print functionality
- ✅ Work offline (static page)

### Generator Page Should:
- ✅ Form with fields for:
  - Certificate ID (auto-generate option)
  - Full Name (required)
  - Course Name (required)
  - Completion Date (date picker)
  - Issuer (pre-filled, editable)
- ✅ Validate all form inputs
- ✅ Generate JSON from form data
- ✅ Encrypt JSON with secret key
- ✅ Encode to base64
- ✅ Generate QR code image
- ✅ Display verification URL
- ✅ Copy URL to clipboard button
- ✅ Download QR code as PNG
- ✅ Preview certificate data
- ✅ Batch generation option (CSV upload for 300 participants)
- ✅ Clear form button
- ✅ Generate multiple certificates sequentially

### Error Handling
- Invalid base64 data
- Malformed JSON
- Missing required fields
- Tampered certificates
- Incorrect decryption (wrong secret key or corrupted data)
- Form validation errors
- QR code generation failures

---

## Design Guidelines

### Layout
- Clean, professional appearance
- Certificate information in a card/box layout
- Clear visual hierarchy
- Readable fonts (minimum 16px body text)
- High contrast for accessibility

### Color Scheme
- Use neutral, professional colors
- Green indicator for "Valid Certificate"
- Red indicator for "Invalid Certificate"
- Ensure WCAG AA compliance

### Mobile Responsiveness
- Works on screens from 320px to 1920px
- Touch-friendly buttons
- Readable text on small screens
- No horizontal scrolling

---

## QR Code Generation

You'll need to generate QR codes that contain:
```
https://your-repo.github.io/verify?data=[BASE64_ENCODED_JSON]
```

### Example Process:
1. Take certificate data (JSON)
2. Convert JSON to string
3. Encode string to base64
4. Create URL with base64 data
5. Generate QR code from URL

### Example Code (for reference):
```javascript
// Certificate data
const certData = {
  certificateId: "CERT-2024-001",
  fullName: "John Doe",
  courseName: "Advanced Web Development",
  completionDate: "2024-11-15",
  issuer: "Your Organization"
};

// Encode to base64
const jsonString = JSON.stringify(certData);
const base64Data = btoa(jsonString);

// Create verification URL
const verificationUrl = `https://your-repo.github.io/verify?data=${base64Data}`;

// Generate QR code from this URL
```

---

## Deployment Instructions

### GitHub Pages Setup
1. Create new GitHub repository
2. Upload all files (index.html, verify.html, styles.css, verify.js)
3. Go to repository Settings → Pages
4. Select branch (usually `main`)
5. Save and wait for deployment
6. Access at: `https://[username].github.io/[repo-name]`

---

## Security Considerations

### Data Integrity
- XOR cipher provides basic encryption (not military-grade, but prevents casual tampering)
- Secret key in config.json encrypts/decrypts all certificates
- **IMPORTANT:** Keep config.json secure and never commit SECRET_KEY to public repositories
- Change SECRET_KEY immediately after deployment
- Anyone with the SECRET_KEY can decrypt certificates

### Config.json Security
- Store config.json in the root of your repository
- Add config.json to .gitignore if using version control
- Use environment variables for production deployment
- Regenerate SECRET_KEY periodically for added security

### Privacy
- Data is encrypted but can be decrypted with the key
- Don't include highly sensitive information in certificates
- Once QR is scanned, anyone with the URL can verify (but not modify)

---

## Testing Checklist

- [ ] Verify page loads correctly
- [ ] Base64 decoding works
- [ ] JSON parsing handles all fields
- [ ] Certificate displays correctly
- [ ] Error handling works for invalid data
- [ ] Mobile responsive on multiple devices
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Print functionality works
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] Fast loading (under 2 seconds)

---

## Deliverables

1. **config.json** - Configuration file with SECRET_KEY and settings
2. **index.html** - Landing page
3. **verify.html** - Verification page
4. **generate.html** - Certificate generator page
5. **styles.css** - Stylesheet
6. **verify.js** - Verification logic
7. **generate.js** - Generation logic
8. **crypto.js** - Shared encryption functions
9. **README.md** - Setup and usage instructions
10. **Example QR codes** - 2-3 test certificates
11. **.gitignore** - To protect config.json if using Git

---

## Timeline
- **Setup & Structure:** 1 hour
- **Core Verification Logic:** 2 hours
- **Styling & Responsive Design:** 1-2 hours
- **Testing & Bug Fixes:** 1 hour
- **Documentation:** 30 minutes

**Total:** 4-6 hours

---

## JSON Format for Designer

When creating certificates, use this exact JSON structure:

```json
{
  "certificateId": "CERT-2024-001",
  "fullName": "John Doe",
  "courseName": "Advanced Web Development",
  "completionDate": "2024-11-15",
  "issuer": "Your Organization Name"
}
```

### Field Descriptions:
- **certificateId**: Unique identifier (string, required)
- **fullName**: Participant's complete name (string, required)
- **courseName**: Name of the course (string, required)
- **completionDate**: Date in YYYY-MM-DD format (string, required)
- **issuer**: Organization issuing certificate (string, required)

### Example for Multiple Certificates:

**Certificate 1:**
```json
{
  "certificateId": "CERT-2024-001",
  "fullName": "Jane Smith",
  "courseName": "Digital Marketing Fundamentals",
  "completionDate": "2024-11-20",
  "issuer": "Professional Development Institute"
}
```

**Certificate 2:**
```json
{
  "certificateId": "CERT-2024-002",
  "fullName": "Michael Johnson",
  "courseName": "Project Management Essentials",
  "completionDate": "2024-11-22",
  "issuer": "Professional Development Institute"
}
```

---

## Notes for Designer

### To Create QR Codes:
You have two options:

**Option 1: Use the Generator Page (Recommended)**
1. Go to `generate.html` on the deployed site
2. Fill in participant details
3. Click "Generate Certificate"
4. Download QR code as PNG
5. Place on certificate PDF
6. Repeat for all 300 participants

**Option 2: Batch Processing (For 300 certificates)**
The generator page should include CSV upload:
1. Create CSV with columns: fullName, courseName, completionDate
2. Upload to generator page
3. Bulk generate all QR codes
4. Download as ZIP file
5. Match QR codes to certificates by name/ID

### CSV Format for Batch Upload:
```csv
fullName,courseName,completionDate
John Doe,Advanced Web Development,2024-11-15
Jane Smith,Digital Marketing Fundamentals,2024-11-20
Michael Johnson,Project Management Essentials,2024-11-22
```

### Important Notes:
- **Do NOT share the SECRET_KEY** from config.json with anyone
- All QR codes are encrypted with the same key
- If key is compromised, you'll need to regenerate all certificates
- Keep config.json backup in secure location

---

## Support

For questions or issues during development:
- Test with sample data first
- Verify base64 encoding/decoding works
- Check browser console for JavaScript errors
- Ensure URL parameters are correctly formatted

---

**Document Version:** 1.0  
**Last Updated:** November 24, 2025