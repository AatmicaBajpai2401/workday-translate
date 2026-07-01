# Google Translate v2 API - Base64 Handling Guide

## ❓ Question: Does v2 API Accept Base64?

**Answer: NO** - Google Translate v2 API does **NOT** accept base64 encoded text directly.

The v2 API expects **plain text** in the `q` parameter, not base64.

---

## 🔄 Complete Flow: Base64 → Translation → Base64

Since your Workday Extend app sends documents in base64, here's the complete flow:

```
Extend App (Base64)
    ↓
Workday Orchestration: DECODE base64 to text
    ↓
Google Translate v2 API: Translate plain text
    ↓
Workday Orchestration: ENCODE translated text to base64
    ↓
Return to Extend App (Base64)
```

---

## 📝 Step-by-Step Implementation

### Step 1: Receive Base64 from Extend App

Your Extend app sends:
```json
{
  "documentBase64": "SGVsbG8gV29ybGQhIFRoaXMgaXMgYSB0ZXN0Lg==",
  "inputLanguage": "en",
  "outputLanguage": "es",
  "fileExtension": ".txt"
}
```

### Step 2: Decode Base64 to Plain Text (in Workday)

**In Workday Orchestration, add a transformation step:**

```javascript
// Pseudo-code for Workday transformation
documentText = base64Decode(documentBase64)
// Result: "Hello World! This is a test."
```

**Workday Configuration:**
- **Step Name:** "Decode Base64 Document"
- **Step Type:** Transformation
- **Function:** Base64 Decode
- **Input Variable:** `documentBase64`
- **Output Variable:** `documentText`

### Step 3: Send Plain Text to Google Translate v2 API

**Request to Google:**
```json
{
  "q": "Hello World! This is a test.",
  "source": "en",
  "target": "es",
  "format": "text"
}
```

**NOT this (base64 won't work):**
```json
{
  "q": "SGVsbG8gV29ybGQhIFRoaXMgaXMgYSB0ZXN0Lg==",  // ❌ WRONG
  "source": "en",
  "target": "es"
}
```

### Step 4: Receive Translation from Google

**Response from Google:**
```json
{
  "data": {
    "translations": [
      {
        "translatedText": "¡Hola Mundo! Esta es una prueba."
      }
    ]
  }
}
```

### Step 5: Encode Translated Text Back to Base64

**In Workday Orchestration, add another transformation step:**

```javascript
// Pseudo-code for Workday transformation
translatedDocumentBase64 = base64Encode(translatedText)
// Result: "wqFIb2xhIE11bmRvISBFc3RhIGVzIHVuYSBwcnVlYmEu"
```

**Workday Configuration:**
- **Step Name:** "Encode Translated Text"
- **Step Type:** Transformation
- **Function:** Base64 Encode
- **Input Variable:** `translatedText`
- **Output Variable:** `translatedDocumentBase64`

### Step 6: Return Base64 to Extend App

**Response to Extend App:**
```json
{
  "success": true,
  "translatedDocument": "wqFIb2xhIE11bmRvISBFc3RhIGVzIHVuYSBwcnVlYmEu"
}
```

---

## 🔧 Complete Workday Orchestration Configuration

### Variables

```javascript
// Input Variables
documentBase64: String (from Extend app)
inputLanguage: String (e.g., "en")
outputLanguage: String (e.g., "es")
fileExtension: String (e.g., ".txt")

// Internal Variables
documentText: String (decoded text)
translatedText: String (translated text)

// Output Variables
translatedDocumentBase64: String (encoded result)
```

### Orchestration Steps

```json
{
  "steps": [
    {
      "step": 1,
      "name": "Receive Input",
      "type": "input",
      "variables": ["documentBase64", "inputLanguage", "outputLanguage", "fileExtension"]
    },
    {
      "step": 2,
      "name": "Decode Base64 to Text",
      "type": "transformation",
      "function": "base64_decode",
      "input": "documentBase64",
      "output": "documentText"
    },
    {
      "step": 3,
      "name": "Build Google API Request",
      "type": "create_json",
      "structure": {
        "q": "{{documentText}}",
        "source": "{{inputLanguage}}",
        "target": "{{outputLanguage}}",
        "format": "text"
      },
      "output": "requestBody"
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
        "body": "{{requestBody}}"
      },
      "output": "apiResponse"
    },
    {
      "step": 5,
      "name": "Extract Translated Text",
      "type": "parse_json",
      "path": "$.data.translations[0].translatedText",
      "input": "apiResponse",
      "output": "translatedText"
    },
    {
      "step": 6,
      "name": "Encode Translated Text to Base64",
      "type": "transformation",
      "function": "base64_encode",
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
```

---

## 🧪 Testing Examples

### Example 1: Simple Text

**Input (Base64):**
```
SGVsbG8gV29ybGQ=
```

**Decoded Text:**
```
Hello World
```

**Send to Google v2 API:**
```json
{
  "q": "Hello World",
  "source": "en",
  "target": "es"
}
```

**Google Response:**
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

**Encode Result:**
```
SG9sYSBNdW5kbw==
```

**Return to Extend App:**
```json
{
  "success": true,
  "translatedDocument": "SG9sYSBNdW5kbw=="
}
```

### Example 2: Longer Text

**Input (Base64):**
```
SGVsbG8gV29ybGQhIFRoaXMgaXMgYSB0ZXN0IGRvY3VtZW50IGZvciB0cmFuc2xhdGlvbi4=
```

**Decoded Text:**
```
Hello World! This is a test document for translation.
```

**Send to Google:**
```json
{
  "q": "Hello World! This is a test document for translation.",
  "source": "en",
  "target": "es"
}
```

**Google Response:**
```json
{
  "data": {
    "translations": [
      {
        "translatedText": "¡Hola Mundo! Este es un documento de prueba para traducción."
      }
    ]
  }
}
```

**Encode and Return:**
```json
{
  "success": true,
  "translatedDocument": "wqFIb2xhIE11bmRvISBFc3RlIGVzIHVuIGRvY3VtZW50byBkZSBwcnVlYmEgcGFyYSB0cmFkdWNjacOzbi4="
}
```

---

## 💻 Workday Transformation Functions

### Base64 Decode Function

In Workday, you can use:

**Option 1: Built-in Function**
```
Function: base64Decode()
Input: documentBase64
Output: documentText
```

**Option 2: Custom Script (if needed)**
```javascript
// JavaScript in Workday
var decodedText = atob(documentBase64);
return decodedText;
```

### Base64 Encode Function

**Option 1: Built-in Function**
```
Function: base64Encode()
Input: translatedText
Output: translatedDocumentBase64
```

**Option 2: Custom Script (if needed)**
```javascript
// JavaScript in Workday
var encodedText = btoa(translatedText);
return encodedText;
```

---

## 🔍 Common Issues and Solutions

### Issue 1: "Invalid characters in base64"

**Cause:** Trying to send base64 directly to Google API

**Solution:** Decode base64 to text first

```javascript
// ❌ WRONG
{
  "q": "SGVsbG8gV29ybGQ="  // Base64
}

// ✅ CORRECT
{
  "q": "Hello World"  // Plain text
}
```

### Issue 2: "Translation looks garbled"

**Cause:** Forgot to decode base64 before sending

**Solution:** Add decode step in orchestration

### Issue 3: "Extend app can't read response"

**Cause:** Forgot to encode result back to base64

**Solution:** Add encode step before returning

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Workday Extend App                                          │
│                                                             │
│ User uploads: test.txt                                      │
│ Content: "Hello World"                                      │
│                                                             │
│ Converts to Base64: "SGVsbG8gV29ybGQ="                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Workday Orchestration - Step 1: Receive                    │
│                                                             │
│ documentBase64 = "SGVsbG8gV29ybGQ="                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Workday Orchestration - Step 2: Decode                     │
│                                                             │
│ documentText = base64Decode("SGVsbG8gV29ybGQ=")            │
│ Result: "Hello World"                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Workday Orchestration - Step 3: Build Request              │
│                                                             │
│ {                                                           │
│   "q": "Hello World",  ← Plain text, NOT base64           │
│   "source": "en",                                           │
│   "target": "es"                                            │
│ }                                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Google Translate v2 API                                     │
│                                                             │
│ Receives: "Hello World" (plain text)                        │
│ Translates to: "Hola Mundo"                                │
│ Returns: {"data":{"translations":[...]}}                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Workday Orchestration - Step 5: Extract                    │
│                                                             │
│ translatedText = "Hola Mundo"                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Workday Orchestration - Step 6: Encode                     │
│                                                             │
│ translatedDocumentBase64 = base64Encode("Hola Mundo")      │
│ Result: "SG9sYSBNdW5kbw=="                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Workday Orchestration - Step 7: Return                     │
│                                                             │
│ {                                                           │
│   "success": true,                                          │
│   "translatedDocument": "SG9sYSBNdW5kbw=="                 │
│ }                                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Workday Extend App                                          │
│                                                             │
│ Receives: "SG9sYSBNdW5kbw=="                               │
│ Decodes to: "Hola Mundo"                                   │
│ Downloads as: translated_test.txt                           │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Summary

**Key Points:**

1. ❌ **Google v2 API does NOT accept base64** - it needs plain text
2. ✅ **You must DECODE base64 to text** before sending to Google
3. ✅ **You must ENCODE the translation back to base64** before returning
4. ✅ **Workday orchestration handles both conversions**
5. ✅ **Extend app sends/receives base64** (no changes needed there)

**The Flow:**
```
Base64 → Decode → Plain Text → Google API → Translated Text → Encode → Base64
```

---

**Version:** 1.0  
**Last Updated:** July 2026