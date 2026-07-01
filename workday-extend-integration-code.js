/**
 * Workday Extend App - AWS Translate Integration
 * This code shows how to prepare and send document data from Extend app to orchestration
 */

// Sample Extend App Handler
async function translateDocument(documentFile, inputLanguage, outputLanguage) {
  try {
    // Step 1: Validate that one language is English
    if (inputLanguage !== 'en' && outputLanguage !== 'en') {
      throw new Error('One of the languages must be English');
    }

    // Step 2: Get file extension
    const fileName = documentFile.name;
    const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    
    // Validate file type
    const supportedExtensions = ['.txt', '.html', '.docx'];
    if (!supportedExtensions.includes(fileExtension)) {
      throw new Error(`Unsupported file type. Supported types: ${supportedExtensions.join(', ')}`);
    }

    // Step 3: Read file and convert to base64
    const fileContent = await readFileAsArrayBuffer(documentFile);
    const documentBase64 = arrayBufferToBase64(fileContent);

    // Step 4: Validate file size (10MB limit for synchronous translation)
    const fileSizeInMB = documentFile.size / (1024 * 1024);
    if (fileSizeInMB > 10) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Step 5: Prepare payload for orchestration
    const payload = {
      documentBase64: documentBase64,
      inputLanguage: inputLanguage,
      outputLanguage: outputLanguage,
      fileExtension: fileExtension,
      fileName: fileName,
      fileSize: documentFile.size
    };

    // Step 6: Call Workday Orchestration
    const response = await callOrchestration(payload);

    // Step 7: Process response
    if (response.success) {
      // Decode the translated document
      const translatedContent = base64ToArrayBuffer(response.translatedDocument);
      
      // Create downloadable file
      const translatedFileName = `translated_${fileName}`;
      downloadFile(translatedContent, translatedFileName, response.contentType);
      
      return {
        success: true,
        message: 'Document translated successfully',
        fileName: translatedFileName
      };
    } else {
      throw new Error(response.error || 'Translation failed');
    }

  } catch (error) {
    console.error('Translation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Helper function to read file as ArrayBuffer
 */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Helper function to convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper function to convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Call Workday Orchestration
 */
async function callOrchestration(payload) {
  // Replace with your actual orchestration endpoint
  const orchestrationEndpoint = 'https://your-workday-instance.workday.com/ccx/api/orchestration/v1/your-tenant/translate-document';
  
  const response = await fetch(orchestrationEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getAuthToken() // Implement your auth token retrieval
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Orchestration call failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Download translated file
 */
function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Get authentication token (implement based on your setup)
 */
function getAuthToken() {
  // Implement your authentication logic here
  // This could be from session storage, OAuth flow, etc.
  return sessionStorage.getItem('workday_auth_token');
}

/**
 * Language code mapping for display
 */
const LANGUAGE_NAMES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ja': 'Japanese',
  'zh': 'Chinese (Simplified)',
  'ar': 'Arabic',
  'hi': 'Hindi'
};

/**
 * Get supported language pairs (one must be English)
 */
function getSupportedLanguagePairs() {
  const languages = Object.keys(LANGUAGE_NAMES);
  const pairs = [];
  
  languages.forEach(lang => {
    if (lang !== 'en') {
      // English to other language
      pairs.push({
        source: 'en',
        target: lang,
        display: `${LANGUAGE_NAMES['en']} → ${LANGUAGE_NAMES[lang]}`
      });
      // Other language to English
      pairs.push({
        source: lang,
        target: 'en',
        display: `${LANGUAGE_NAMES[lang]} → ${LANGUAGE_NAMES['en']}`
      });
    }
  });
  
  return pairs;
}

/**
 * Example usage in Extend App UI
 */
function initializeTranslateApp() {
  // Populate input language dropdown
  const inputSelect = document.getElementById('inputLanguage');
  const outputSelect = document.getElementById('outputLanguage');
  
  Object.entries(LANGUAGE_NAMES).forEach(([code, name]) => {
    const option1 = new Option(name, code);
    const option2 = new Option(name, code);
    inputSelect.add(option1);
    outputSelect.add(option2);
  });

  // Add change listeners to ensure one language is English
  inputSelect.addEventListener('change', validateLanguageSelection);
  outputSelect.addEventListener('change', validateLanguageSelection);

  // File upload handler
  document.getElementById('fileUpload').addEventListener('change', handleFileUpload);

  // Translate button handler
  document.getElementById('translateBtn').addEventListener('click', handleTranslate);
}

function validateLanguageSelection() {
  const inputLang = document.getElementById('inputLanguage').value;
  const outputLang = document.getElementById('outputLanguage').value;
  const translateBtn = document.getElementById('translateBtn');
  const warningMsg = document.getElementById('languageWarning');

  if (inputLang && outputLang) {
    if (inputLang !== 'en' && outputLang !== 'en') {
      warningMsg.textContent = 'One of the languages must be English';
      warningMsg.style.display = 'block';
      translateBtn.disabled = true;
    } else if (inputLang === outputLang) {
      warningMsg.textContent = 'Input and output languages must be different';
      warningMsg.style.display = 'block';
      translateBtn.disabled = true;
    } else {
      warningMsg.style.display = 'none';
      translateBtn.disabled = false;
    }
  }
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = `${(file.size / 1024).toFixed(2)} KB`;
  }
}

async function handleTranslate() {
  const fileInput = document.getElementById('fileUpload');
  const inputLang = document.getElementById('inputLanguage').value;
  const outputLang = document.getElementById('outputLanguage').value;

  if (!fileInput.files[0]) {
    alert('Please select a file to translate');
    return;
  }

  // Show loading indicator
  document.getElementById('loadingIndicator').style.display = 'block';
  document.getElementById('translateBtn').disabled = true;

  try {
    const result = await translateDocument(fileInput.files[0], inputLang, outputLang);
    
    if (result.success) {
      alert(`Translation successful! File: ${result.fileName}`);
    } else {
      alert(`Translation failed: ${result.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  } finally {
    // Hide loading indicator
    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('translateBtn').disabled = false;
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTranslateApp);
} else {
  initializeTranslateApp();
}

// Made with Bob
