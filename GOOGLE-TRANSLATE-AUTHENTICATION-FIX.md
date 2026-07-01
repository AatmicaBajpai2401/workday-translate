# Google Cloud Translation API - Authentication Fix

You're getting a "CREDENTIALS_MISSING" error because the v3 API requires OAuth 2.0 authentication, not just an API key.

---

## 🔧 Solution: Use v2 API (Simpler - Works with API Key)

The **v2 API** supports API key authentication and works for text translation. For documents, we'll extract text, translate, and recreate the document.

---

## ✅ Updated Solution - Using v2 API

### API Endpoint (v2 - Works with API Key!)

```
https://translation.googleapis.com/language/translate/v2?key=YOUR_API_KEY
```

### Request Format (v2)

```json
{
  "q": "Text to translate",
  "source": "en",
  "target": "es",
  "format": "text"
}
```

### Response Format (v2)

```json
{
  "data": {
    "translations": [
      {
        "translatedText": "Texto traducido",
        "detectedSourceLanguage": "en"
      }
    ]
  }
}
```

---

## 📝 Updated Workday Orchestration Configuration

### Step 1: Extract Text from Document

Since v2 API only handles text, we need to extract text from the document first.

**For .txt files:**
- Decode base64 → Get text → Translate

**For .html files:**
- Decode base64 → Parse HTML → Extract text → Translate → Rebuild HTML

**For .docx files:**
- Decode base64 → Extract text → Translate → Create new .txt file

### Step 2: Updated Orchestration Flow

```json
{
  "orchestration": {
    "name": "Google Translate v2 Integration",
    "steps": [
      {
        "step": 1,
        "name": "Receive Input",
        "variables": {
          "documentBase64": "string",
          "inputLanguage": "string",
          "outputLanguage": "string",
          "fileExtension": "string"
        }
      },
      {
        "step": 2,
        "name": "Decode Document",
        "type": "transformation",
        "action": "base64_decode",
        "input": "documentBase64",
        "output": "documentText"
      },
      {
        "step": 3,
        "name": "Build Request",
        "type": "create_json",
        "structure": {
          "q": "{{documentText}}",
          "source": "{{inputLanguage}}",
          "target": "{{outputLanguage}}",
          "format": "text"
        }
      },
      {
        "step": 4,
        "name": "Call Google Translate v2 API",
        "type": "rest_api",
        "config": {
          "url": "https://translation.googleapis.com/language/translate/v2?key={{apiKey}}",
          "method": "POST",
          "headers": {
            "Content-Type": "application/json"
          },
          "body": "{{requestJson}}"
        }
      },
      {
        "step": 5,
        "name": "Extract Translation",
        "type": "parse_json",
        "path": "$.data.translations[0].translatedText",
        "output": "translatedText"
      },
      {
        "step": 6,
        "name": "Encode Result",
        "type": "transformation",
        "action": "base64_encode",
        "input": "translatedText",
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

## 🧪 Test with cURL (v2 API)

```bash
# Replace YOUR_API_KEY with your actual API key
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "q": "Hello World",
    "source": "en",
    "target": "es",
    "format": "text"
  }' \
  "https://translation.googleapis.com/language/translate/v2?key=YOUR_API_KEY"
```

Expected response:
```json
{
  "data": {
    "translations": [
      {
        "translatedText": "Hola Mundo"
      }
    ]
  }
}
```

---

## 🔐 Alternative: Use OAuth 2.0 for v3 API (More Complex)

If you want to use v3 API with document support, you need OAuth 2.0:

### Step 1: Create Service Account

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click "Create Service Account"
3. Name: `workday-translate-service`
4. Grant role: "Cloud Translation API User"
5. Click "Create Key" → JSON
6. Download the JSON file

### Step 2: Get Access Token

The service account JSON contains credentials to get an access token:

```bash
# Using gcloud CLI
gcloud auth activate-service-account --key-file=service-account.json
ACCESS_TOKEN=$(gcloud auth print-access-token)

# Test with access token
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentInputConfig": {
      "content": "SGVsbG8gV29ybGQ=",
      "mimeType": "text/plain"
    },
    "sourceLanguageCode": "en",
    "targetLanguageCode": "es"
  }' \
  "https://translation.googleapis.com/v3/projects/YOUR_PROJECT_ID/locations/us-central1:translateDocument"
```

### Step 3: Workday OAuth Configuration

In Workday, you need to:

1. **Create OAuth Integration System**
2. **Configure Token Endpoint:** `https://oauth2.googleapis.com/token`
3. **Provide Service Account Credentials:**
   - Client Email (from JSON)
   - Private Key (from JSON)
4. **Set Scope:** `https://www.googleapis.com/auth/cloud-translation`

This is more complex and requires Workday to handle OAuth token refresh.

---

## 💡 Recommended Solution

### For Simplicity: Use v2 API

**Pros:**
- ✅ Works with simple API key
- ✅ No OAuth complexity
- ✅ Easy to implement in Workday
- ✅ Good translation quality

**Cons:**
- ⚠️ Text-only (no native document support)
- ⚠️ Need to extract/rebuild documents

**Best for:** Text files, simple HTML

### For Full Features: Use v3 API with OAuth

**Pros:**
- ✅ Native document support
- ✅ Preserves formatting
- ✅ Handles .docx directly

**Cons:**
- ⚠️ Requires OAuth 2.0 setup
- ⚠️ More complex configuration
- ⚠️ Need service account

**Best for:** Complex documents, production use

---

## 🚀 Quick Fix: Updated Workday Configuration for v2 API

### 1. Update REST API Step

**Old (v3 - doesn't work with API key):**
```
URL: https://translation.googleapis.com/v3/projects/{PROJECT_ID}/locations/us-central1:translateDocument
```

**New (v2 - works with API key):**
```
URL: https://translation.googleapis.com/language/translate/v2?key={{apiKey}}
```

### 2. Update Request Body

**Old (v3):**
```json
{
  "documentInputConfig": {
    "content": "BASE64",
    "mimeType": "text/plain"
  },
  "sourceLanguageCode": "en",
  "targetLanguageCode": "es"
}
```

**New (v2):**
```json
{
  "q": "TEXT_TO_TRANSLATE",
  "source": "en",
  "target": "es",
  "format": "text"
}
```

### 3. Update Response Parsing

**Old (v3):**
```
Path: $.documentTranslation.byteStreamOutputs[0]
```

**New (v2):**
```
Path: $.data.translations[0].translatedText
```

### 4. Add Text Extraction Step

Before calling the API, add a step to decode base64 and extract text:

```javascript
// In Workday transformation step
documentText = base64Decode(documentBase64)
```

### 5. Add Text Encoding Step

After getting translation, encode back to base64:

```javascript
// In Workday transformation step
translatedDocumentBase64 = base64Encode(translatedText)
```

---

## 📋 Complete Working Example (v2 API)

### Request

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "q": ["Hello World", "How are you?"],
    "source": "en",
    "target": "es"
  }' \
  "https://translation.googleapis.com/language/translate/v2?key=YOUR_API_KEY"
```

### Response

```json
{
  "data": {
    "translations": [
      {
        "translatedText": "Hola Mundo"
      },
      {
        "translatedText": "¿Cómo estás?"
      }
    ]
  }
}
```

---

## 🎯 Decision Matrix

| Requirement | Use v2 API | Use v3 API with OAuth |
|-------------|-----------|----------------------|
| Simple setup | ✅ Yes | ❌ No |
| API key only | ✅ Yes | ❌ No |
| Text files | ✅ Yes | ✅ Yes |
| HTML files | ⚠️ Manual | ✅ Native |
| Word docs | ⚠️ Text only | ✅ Native |
| Quick start | ✅ Yes | ❌ No |
| Production ready | ⚠️ Depends | ✅ Yes |

---

## 🔧 Implementation Steps (v2 API - Recommended)

1. **Keep your API key** (already created)
2. **Update Workday orchestration URL** to v2 endpoint
3. **Add base64 decode step** before API call
4. **Update request format** to v2 structure
5. **Update response parsing** to v2 format
6. **Add base64 encode step** after API call
7. **Test** with sample document

**Time to fix:** 15 minutes

---

## 📞 Need Help?

If you want to:
- **Use v2 API (simpler):** Follow the steps above
- **Use v3 API (full features):** I can help set up OAuth 2.0
- **Try a different service:** Consider AWS (once activated) or Azure

Let me know which approach you prefer!

---

**Bottom Line:** The error occurs because v3 API requires OAuth 2.0. Use v2 API with your existing API key for a quick fix, or set up OAuth 2.0 for full document support.