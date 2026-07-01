# Google Cloud Translation API - Complete Integration Guide for Workday

Complete guide to implement document translation using Google Cloud Translation API with Workday Orchestration.

---

## 🚀 Quick Start (Google Cloud activates instantly!)

Unlike AWS (24 hours), Google Cloud account is **activated immediately** after signup.

**Total Setup Time:** ~30 minutes

---

## 📋 Part 1: Google Cloud Setup (10 minutes)

### Step 1: Create Google Cloud Account

1. **Go to:** https://cloud.google.com/
2. **Click:** "Get started for free"
3. **Sign in** with your Google account (Gmail)
4. **Enter billing information** (required but you get $300 free credit)
5. **Complete verification** - Account is active immediately!

**Benefits:**
- ✅ $300 free credit (90 days)
- ✅ Instant activation (no waiting!)
- ✅ Covers ~15 million characters of translation

### Step 2: Create Project

1. **Go to:** https://console.cloud.google.com/
2. **Click** project dropdown → "New Project"
3. **Project name:** `workday-translate`
4. **Click:** "Create"
5. **Select** your new project

### Step 3: Enable Translation API

1. **Search:** "Translation API" in console
2. **Click:** "Cloud Translation API"
3. **Click:** "Enable"
4. **Wait** 1-2 minutes for activation

### Step 4: Get API Key (Simplest Method)

1. **Go to:** APIs & Services → Credentials
2. **Click:** "Create Credentials" → "API Key"
3. **Copy** your API key (looks like: `AIzaSyDaGmWKa4JsXZ...`)
4. **Click:** "Restrict Key"
5. **Under "API restrictions":**
   - Select "Restrict key"
   - Choose "Cloud Translation API"
6. **Click:** "Save"

**Your API Key:**
```
AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe
```

**⚠️ Save this key securely!**

---

## 📡 Part 2: Google Cloud Translation API Details

### API Endpoints

**For Document Translation (Recommended):**
```
https://translation.googleapis.com/v3/projects/{PROJECT_ID}/locations/us-central1:translateDocument
```

**For Text Translation (Alternative):**
```
https://translation.googleapis.com/language/translate/v2
```

### Authentication

**Method 1: API Key (Simplest)**
- Add to URL: `?key=YOUR_API_KEY`
- Or in header: `X-Goog-Api-Key: YOUR_API_KEY`

**Method 2: OAuth 2.0 (More Secure)**
- Use service account
- Get access token
- Add header: `Authorization: Bearer ACCESS_TOKEN`

### Document Translation Request Format

```json
{
  "documentInputConfig": {
    "content": "BASE64_ENCODED_DOCUMENT",
    "mimeType": "text/plain"
  },
  "sourceLanguageCode": "en",
  "targetLanguageCode": "es"
}
```

### Response Format

```json
{
  "documentTranslation": {
    "byteStreamOutputs": [
      "BASE64_ENCODED_TRANSLATED_DOCUMENT"
    ],
    "mimeType": "text/plain"
  },
  "glossaryDocumentTranslation": null,
  "model": ""
}
```

### Supported MIME Types

| File Type | MIME Type |
|-----------|-----------|
| Text (.txt) | `text/plain` |
| HTML (.html) | `text/html` |
| Word (.docx) | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |

### Language Codes

Same as AWS:
- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `ja` - Japanese
- `zh` - Chinese
- `ar` - Arabic
- `hi` - Hindi

---

## 🔧 Part 3: Workday Orchestration Configuration

### Step 1: Create Integration System in Workday

1. **Search:** "Create Integration System"
2. **Select:** "REST API" (not AWS)
3. **Configure:**
   - **Name:** `Google Cloud Translation`
   - **Type:** REST API
   - **Base URL:** `https://translation.googleapis.com`

### Step 2: Store API Key in Workday

1. **Search:** "Create Credential"
2. **Select:** "API Key"
3. **Configure:**
   - **Name:** `Google_Translation_API_Key`
   - **API Key:** [Your API key from Step 4 above]
4. **Save**

### Step 3: Create Orchestration Integration

1. **Search:** "Create Integration"
2. **Select:** "Orchestration Integration"
3. **Name:** `Google Translate Document Integration`

### Step 4: Define Variables

Create these input/output variables:

| Variable Name | Type | Direction | Required |
|--------------|------|-----------|----------|
| `documentBase64` | String | Input | Yes |
| `inputLanguage` | String | Input | Yes |
| `outputLanguage` | String | Input | Yes |
| `fileExtension` | String | Input | Yes |
| `projectId` | String | Input | Yes |
| `translatedDocumentBase64` | String | Output | No |

### Step 5: Build Orchestration Flow

#### Step 5.1: Determine Content Type

**Step Name:** `Determine Content Type`  
**Type:** Transformation

```
IF fileExtension = '.txt' THEN
    documentContentType = 'text/plain'
ELSE IF fileExtension = '.html' THEN
    documentContentType = 'text/html'
ELSE IF fileExtension = '.docx' THEN
    documentContentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
ELSE
    THROW ERROR 'Unsupported file type'
END IF
```

#### Step 5.2: Build Request JSON

**Step Name:** `Build Google Request Body`  
**Type:** Create JSON

```json
{
  "documentInputConfig": {
    "content": "{{documentBase64}}",
    "mimeType": "{{documentContentType}}"
  },
  "sourceLanguageCode": "{{inputLanguage}}",
  "targetLanguageCode": "{{outputLanguage}}"
}
```

#### Step 5.3: Call Google Translation API

**Step Name:** `Call Google Translate API`  
**Type:** REST API

**Configuration:**
- **URL:** `https://translation.googleapis.com/v3/projects/{{projectId}}/locations/us-central1:translateDocument?key={{apiKey}}`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
- **Body:** Output from Step 5.2
- **Authentication:** API Key (from credentials)

**Alternative URL (without API key in URL):**
- **URL:** `https://translation.googleapis.com/v3/projects/{{projectId}}/locations/us-central1:translateDocument`
- **Headers:**
  - `Content-Type: application/json`
  - `X-Goog-Api-Key: {{apiKey}}`

#### Step 5.4: Parse Response

**Step Name:** `Extract Translated Document`  
**Type:** Parse JSON

- **Input:** API response
- **JSON Path:** `$.documentTranslation.byteStreamOutputs[0]`
- **Output:** `translatedDocumentBase64`

---

## 📝 Part 4: Complete Orchestration JSON

```json
{
  "orchestration": {
    "name": "Google Translate Document Integration",
    "steps": [
      {
        "step": 1,
        "name": "Receive Input",
        "type": "input",
        "variables": {
          "documentBase64": "string",
          "inputLanguage": "string",
          "outputLanguage": "string",
          "fileExtension": "string",
          "projectId": "string"
        }
      },
      {
        "step": 2,
        "name": "Validate Languages",
        "type": "validation",
        "rule": "inputLanguage == 'en' OR outputLanguage == 'en'"
      },
      {
        "step": 3,
        "name": "Determine Content Type",
        "type": "transformation",
        "logic": "Map file extension to MIME type"
      },
      {
        "step": 4,
        "name": "Build Request JSON",
        "type": "create_json",
        "structure": {
          "documentInputConfig": {
            "content": "{{documentBase64}}",
            "mimeType": "{{documentContentType}}"
          },
          "sourceLanguageCode": "{{inputLanguage}}",
          "targetLanguageCode": "{{outputLanguage}}"
        }
      },
      {
        "step": 5,
        "name": "Call Google Translate API",
        "type": "rest_api",
        "config": {
          "url": "https://translation.googleapis.com/v3/projects/{{projectId}}/locations/us-central1:translateDocument",
          "method": "POST",
          "headers": {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": "{{apiKey}}"
          },
          "body": "{{requestJson}}"
        }
      },
      {
        "step": 6,
        "name": "Parse Response",
        "type": "parse_json",
        "path": "$.documentTranslation.byteStreamOutputs[0]",
        "output": "translatedDocumentBase64"
      },
      {
        "step": 7,
        "name": "Return Result",
        "type": "output",
        "return": {
          "success": true,
          "translatedDocument": "{{translatedDocumentBase64}}"
        }
      }
    ]
  }
}
```

---

## 💻 Part 5: Extend App Integration Code

Update your Extend app to use Google Cloud:

```javascript
/**
 * Google Cloud Translation Integration
 */

async function translateDocument(documentFile, inputLanguage, outputLanguage) {
  try {
    // Validate languages
    if (inputLanguage !== 'en' && outputLanguage !== 'en') {
      throw new Error('One language must be English');
    }

    // Get file details
    const fileName = documentFile.name;
    const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    
    // Validate file type
    const supportedExtensions = ['.txt', '.html', '.docx'];
    if (!supportedExtensions.includes(fileExtension)) {
      throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    // Convert to base64
    const fileContent = await readFileAsArrayBuffer(documentFile);
    const documentBase64 = arrayBufferToBase64(fileContent);

    // Validate file size (10MB limit)
    if (documentFile.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Prepare payload for Workday orchestration
    const payload = {
      documentBase64: documentBase64,
      inputLanguage: inputLanguage,
      outputLanguage: outputLanguage,
      fileExtension: fileExtension,
      projectId: 'workday-translate', // Your Google Cloud project ID
      fileName: fileName
    };

    // Call Workday Orchestration
    const orchestrationEndpoint = 'https://your-tenant.workday.com/ccx/api/orchestration/v1/your-tenant/google-translate-document';
    
    const response = await fetch(orchestrationEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAuthToken()
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      // Decode translated document
      const translatedContent = base64ToArrayBuffer(result.translatedDocument);
      
      // Download file
      const translatedFileName = `translated_${fileName}`;
      downloadFile(translatedContent, translatedFileName, getContentType(fileExtension));
      
      return {
        success: true,
        message: 'Document translated successfully',
        fileName: translatedFileName
      };
    } else {
      throw new Error(result.error || 'Translation failed');
    }

  } catch (error) {
    console.error('Translation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to get content type
function getContentType(extension) {
  const contentTypes = {
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return contentTypes[extension] || 'application/octet-stream';
}

// Helper functions (same as AWS version)
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

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

function getAuthToken() {
  return sessionStorage.getItem('workday_auth_token');
}
```

---

## 🧪 Part 6: Testing

### Test 1: Quick API Test (No Workday)

```bash
# Replace YOUR_API_KEY and YOUR_PROJECT_ID
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "documentInputConfig": {
      "content": "SGVsbG8gV29ybGQ=",
      "mimeType": "text/plain"
    },
    "sourceLanguageCode": "en",
    "targetLanguageCode": "es"
  }' \
  "https://translation.googleapis.com/v3/projects/YOUR_PROJECT_ID/locations/us-central1:translateDocument?key=YOUR_API_KEY"
```

Expected response:
```json
{
  "documentTranslation": {
    "byteStreamOutputs": ["SG9sYSBNdW5kbw=="],
    "mimeType": "text/plain"
  }
}
```

### Test 2: Test in Workday Orchestration

1. Open your orchestration
2. Click "Test"
3. Provide inputs:
   - `documentBase64`: `SGVsbG8gV29ybGQ=` (Hello World)
   - `inputLanguage`: `en`
   - `outputLanguage`: `es`
   - `fileExtension`: `.txt`
   - `projectId`: `workday-translate`
4. Run test
5. Verify output contains Spanish translation

### Test 3: End-to-End Test

1. Upload a test.txt file in Extend app
2. Select English → Spanish
3. Click Translate
4. Verify translated file downloads

---

## 🔍 Key Differences: Google vs AWS

| Feature | Google Cloud | AWS |
|---------|-------------|-----|
| **Account Activation** | ✅ Instant | ⚠️ 24 hours |
| **Free Credit** | $300 (90 days) | 2M chars (12 months) |
| **API Endpoint** | translation.googleapis.com | translate.us-east-1.amazonaws.com |
| **Authentication** | API Key or OAuth | AWS Signature V4 |
| **Request Format** | documentInputConfig | Document |
| **Response Format** | byteStreamOutputs | TranslatedDocument.Content |
| **Pricing** | $20/1M chars | $15/1M chars |
| **Setup Complexity** | ⭐⭐ Easier | ⭐⭐⭐ More complex |

---

## 💰 Pricing

### Free Tier
- **$300 credit** for 90 days
- Covers ~15 million characters

### After Free Tier
- **$20 per 1 million characters**
- First 500,000 characters/month free

### Cost Examples
- 1M characters/month: $10 (500k free + 500k paid)
- 5M characters/month: $90
- 10M characters/month: $190

---

## 🐛 Troubleshooting

### Error: "API key not valid"

**Solution:**
1. Verify API key is correct
2. Check API restrictions allow Translation API
3. Regenerate key if needed

### Error: "Project not found"

**Solution:**
1. Verify project ID is correct
2. Check project is active
3. Ensure API is enabled for project

### Error: "Quota exceeded"

**Solution:**
1. Check usage in Google Cloud Console
2. Verify billing is enabled
3. Request quota increase if needed

### Error: "Invalid document format"

**Solution:**
1. Verify base64 encoding is correct
2. Check MIME type matches file type
3. Ensure file size < 10MB

---

## ✅ Setup Checklist

- [ ] Created Google Cloud account (instant activation!)
- [ ] Created project: `workday-translate`
- [ ] Enabled Cloud Translation API
- [ ] Created and saved API key
- [ ] Restricted API key to Translation API only
- [ ] Stored API key in Workday credentials
- [ ] Created Workday orchestration integration
- [ ] Configured all orchestration steps
- [ ] Tested with sample document
- [ ] Updated Extend app code
- [ ] Tested end-to-end integration
- [ ] Set up billing alerts
- [ ] Documented project ID and API key location

---

## 📞 Support

- **Google Cloud Console:** https://console.cloud.google.com/
- **Translation API Docs:** https://cloud.google.com/translate/docs
- **Pricing:** https://cloud.google.com/translate/pricing
- **Support:** https://cloud.google.com/support

---

## 🎯 Summary

**Google Cloud Translation API is perfect for your use case because:**

1. ✅ **Instant activation** (no 24-hour wait like AWS)
2. ✅ **$300 free credit** to get started
3. ✅ **Simpler authentication** (just API key)
4. ✅ **Native document support** (.txt, .html, .docx)
5. ✅ **High quality** translations
6. ✅ **Easy Workday integration**

**You can start using it TODAY!**

---

**Version:** 1.0  
**Last Updated:** July 2026