# Workday Configuration Guide - AWS Translate Integration

Complete step-by-step guide to configure AWS Translate integration in Workday Orchestration.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 1: Configure AWS Integration System](#part-1-configure-aws-integration-system)
3. [Part 2: Create Orchestration Integration](#part-2-create-orchestration-integration)
4. [Part 3: Configure REST API Step](#part-3-configure-rest-api-step)
5. [Part 4: Test the Integration](#part-4-test-the-integration)
6. [Part 5: Connect to Extend App](#part-5-connect-to-extend-app)

---

## Prerequisites

Before starting, ensure you have:

- ✅ AWS Access Key ID and Secret Access Key (see AWS-CREDENTIALS-SETUP-GUIDE.md)
- ✅ Workday tenant with Orchestration enabled
- ✅ Workday Extend app already created
- ✅ Administrative access to Workday
- ✅ Base64 encoded document from Extend app

---

## Part 1: Configure AWS Integration System

This creates the connection between Workday and AWS.

### Step 1.1: Access Integration System Setup

1. **Log in to Workday**
2. In the search bar, type: **"Create Integration System"**
3. Click on **"Create Integration System"** task

### Step 1.2: Select Integration Type

1. In the "Integration System Type" dropdown, select: **"Amazon Web Services"**
2. Click **OK**

### Step 1.3: Configure Integration System Details

Fill in the following fields:

| Field | Value | Notes |
|-------|-------|-------|
| **Integration System Name** | `AWS Translate Service` | You can use any name |
| **Integration System ID** | Auto-generated | Leave as is |
| **AWS Region** | `us-east-1` | Must match your AWS setup |
| **Access Key ID** | `[Your AWS Access Key]` | From AWS IAM (see credentials guide) |
| **Secret Access Key** | `[Your AWS Secret Key]` | From AWS IAM (see credentials guide) |

### Step 1.4: Save Integration System

1. Review all fields
2. Click **OK** to save
3. You'll see a confirmation message
4. **Note down the Integration System ID** - you'll need it later

### Step 1.5: Verify Integration System

1. Search for: **"View Integration System"**
2. Find your **"AWS Translate Service"** integration
3. Verify all details are correct

---

## Part 2: Create Orchestration Integration

### Step 2.1: Start New Integration

1. Search for: **"Create Integration"**
2. Click **"Create Integration"**
3. Select **"Orchestration Integration"**

### Step 2.2: Configure Integration Basics

| Field | Value |
|-------|-------|
| **Integration Name** | `Translate Document Integration` |
| **Description** | `Translates documents using AWS Translate API` |
| **Integration Type** | `Orchestration` |

### Step 2.3: Define Integration Variables

Create the following input variables:

#### Variable 1: Document Base64
- **Name:** `documentBase64`
- **Type:** `String`
- **Direction:** `Input`
- **Required:** `Yes`
- **Description:** `Base64 encoded document from Extend app`

#### Variable 2: Input Language
- **Name:** `inputLanguage`
- **Type:** `String`
- **Direction:** `Input`
- **Required:** `Yes`
- **Description:** `Source language code (e.g., en, es, fr)`

#### Variable 3: Output Language
- **Name:** `outputLanguage`
- **Type:** `String`
- **Direction:** `Input`
- **Required:** `Yes`
- **Description:** `Target language code (e.g., en, es, fr)`

#### Variable 4: File Extension
- **Name:** `fileExtension`
- **Type:** `String`
- **Direction:** `Input`
- **Required:** `Yes`
- **Description:** `File extension (.txt, .html, .docx)`

#### Variable 5: Translated Document (Output)
- **Name:** `translatedDocumentBase64`
- **Type:** `String`
- **Direction:** `Output`
- **Required:** `No`
- **Description:** `Base64 encoded translated document`

### Step 2.4: Save Integration

1. Click **OK** to save
2. Note the Integration ID

---

## Part 3: Configure REST API Step

This is the core step that calls AWS Translate API.

### Step 3.1: Add Orchestration Step

1. Open your integration
2. Click **"Add Step"**
3. Select **"REST API"** step type

### Step 3.2: Configure REST API Basics

| Field | Value |
|-------|-------|
| **Step Name** | `Call AWS Translate API` |
| **Description** | `Send document to AWS Translate for translation` |

### Step 3.3: Configure HTTP Request

#### URL Configuration
- **URL:** `https://translate.us-east-1.amazonaws.com/`
- **HTTP Method:** `POST`

#### Headers Configuration

Add these headers:

**Header 1:**
- **Name:** `Content-Type`
- **Value:** `application/x-amz-json-1.1`

**Header 2:**
- **Name:** `X-Amz-Target`
- **Value:** `AWSShineFrontendService_20170701.TranslateDocument`

### Step 3.4: Configure Authentication

This is CRITICAL for AWS API calls.

1. **Authentication Type:** Select `AWS Signature Version 4`
2. **Integration System:** Select `AWS Translate Service` (created in Part 1)
3. **Service Name:** `translate`
4. **Region:** `us-east-1`

### Step 3.5: Build Request Body

You need to create a JSON request body. Use the **"Create JSON"** step before the REST API call.

#### Add "Create JSON" Step

1. Add step before REST API call
2. Step type: **"Create JSON"**
3. Step name: `Build AWS Request Body`

#### JSON Structure

Use this structure (Workday will have a JSON builder):

```json
{
  "Document": {
    "Content": "{{documentBase64}}",
    "ContentType": "{{documentContentType}}"
  },
  "SourceLanguageCode": "{{inputLanguage}}",
  "TargetLanguageCode": "{{outputLanguage}}"
}
```

#### Map Variables

- `{{documentBase64}}` → Variable: `documentBase64`
- `{{documentContentType}}` → Variable: `documentContentType` (from transformation step)
- `{{inputLanguage}}` → Variable: `inputLanguage`
- `{{outputLanguage}}` → Variable: `outputLanguage`

### Step 3.6: Add Content Type Transformation Step

Before building JSON, add a transformation step to determine content type:

1. **Step Name:** `Determine Content Type`
2. **Step Type:** `Transformation` or `Conditional`

#### Transformation Logic

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

### Step 3.7: Configure REST API Request Body

In the REST API step:
- **Request Body:** Select the JSON output from "Build AWS Request Body" step
- **Content Type:** Already set in headers

### Step 3.8: Configure Response Handling

1. **Response Variable:** Create new variable `apiResponse`
2. **Response Type:** `JSON`

### Step 3.9: Parse Response

Add a **"Parse JSON"** step after REST API call:

1. **Step Name:** `Extract Translated Document`
2. **Input:** `apiResponse` variable
3. **JSON Path:** `$.TranslatedDocument.Content`
4. **Output Variable:** `translatedDocumentBase64`

---

## Part 4: Test the Integration

### Step 4.1: Create Test Data

Create a simple test file:

**test.txt:**
```
Hello World! This is a test document.
```

Convert to Base64:
```
SGVsbG8gV29ybGQhIFRoaXMgaXMgYSB0ZXN0IGRvY3VtZW50Lg==
```

### Step 4.2: Test Integration

1. In your integration, click **"Test"**
2. Provide test inputs:
   - `documentBase64`: `SGVsbG8gV29ybGQhIFRoaXMgaXMgYSB0ZXN0IGRvY3VtZW50Lg==`
   - `inputLanguage`: `en`
   - `outputLanguage`: `es`
   - `fileExtension`: `.txt`

3. Click **"Run Test"**

### Step 4.3: Verify Results

Expected output:
- `translatedDocumentBase64`: Base64 encoded Spanish translation
- Decode to verify: "¡Hola Mundo! Este es un documento de prueba."

### Step 4.4: Check Logs

1. View orchestration logs
2. Check for any errors
3. Verify API call was successful

---

## Part 5: Connect to Extend App

### Step 5.1: Get Integration Endpoint

1. Open your integration
2. Go to **"Integration Attributes"**
3. Copy the **"REST Endpoint URL"**
   - Format: `https://[tenant].workday.com/ccx/api/orchestration/v1/[tenant]/[integration-name]`

### Step 5.2: Configure Extend App

In your Extend app code, update the orchestration endpoint:

```javascript
const orchestrationEndpoint = 'https://your-tenant.workday.com/ccx/api/orchestration/v1/your-tenant/translate-document';
```

### Step 5.3: Set Up Authentication

Configure authentication in Extend app:

```javascript
const response = await fetch(orchestrationEndpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getAuthToken()
  },
  body: JSON.stringify(payload)
});
```

### Step 5.4: Test End-to-End

1. Upload a document in Extend app
2. Select input language (e.g., English)
3. Select output language (e.g., Spanish)
4. Click translate
5. Verify translated document downloads

---

## 🔧 Complete Orchestration Flow

Here's the complete step sequence:

```
1. START
   ↓
2. RECEIVE INPUT
   - documentBase64
   - inputLanguage
   - outputLanguage
   - fileExtension
   ↓
3. VALIDATE LANGUAGES
   - Check one language is English
   - Check languages are different
   ↓
4. DETERMINE CONTENT TYPE
   - Map file extension to MIME type
   ↓
5. BUILD JSON REQUEST
   - Create AWS Translate request body
   ↓
6. CALL AWS TRANSLATE API
   - POST to translate.us-east-1.amazonaws.com
   - AWS Signature V4 authentication
   ↓
7. PARSE RESPONSE
   - Extract TranslatedDocument.Content
   ↓
8. RETURN RESULT
   - Return translatedDocumentBase64
   ↓
9. END
```

---

## 🐛 Troubleshooting

### Issue: "Integration System Not Found"

**Solution:**
1. Verify Integration System is created
2. Check Integration System name matches exactly
3. Ensure Integration System is active

### Issue: "Authentication Failed"

**Solution:**
1. Verify AWS credentials are correct
2. Check Access Key ID has no extra spaces
3. Verify Secret Access Key is correct
4. Ensure region is `us-east-1`
5. Check IAM permissions include `translate:TranslateDocument`

### Issue: "Invalid Request"

**Solution:**
1. Verify JSON structure matches AWS API requirements
2. Check base64 encoding is correct (no line breaks)
3. Verify content type is correct for file type
4. Check language codes are valid

### Issue: "Orchestration Timeout"

**Solution:**
1. Check file size (must be < 10MB)
2. Increase timeout in REST API step
3. Verify AWS service is available

---

## 📊 Monitoring and Logging

### Enable Logging

1. In integration settings, enable **"Debug Logging"**
2. Set log level to **"Detailed"**

### View Logs

1. Search for: **"View Integration Logs"**
2. Filter by your integration name
3. Review request/response details

### Monitor API Usage

1. Check AWS CloudWatch for API calls
2. Monitor AWS Translate usage in AWS Console
3. Set up CloudWatch alarms for errors

---

## ✅ Configuration Checklist

Before going live, verify:

- [ ] AWS Integration System created and tested
- [ ] AWS credentials are correct and active
- [ ] IAM permissions include translate:TranslateDocument
- [ ] Orchestration integration created
- [ ] All input/output variables defined
- [ ] Content type transformation step configured
- [ ] JSON request builder step configured
- [ ] REST API step configured with correct URL
- [ ] Headers configured (Content-Type, X-Amz-Target)
- [ ] AWS Signature V4 authentication configured
- [ ] Response parsing step configured
- [ ] Integration tested with sample data
- [ ] Error handling implemented
- [ ] Logging enabled
- [ ] Extend app connected to orchestration
- [ ] End-to-end testing completed

---

## 📞 Support Resources

### Workday Resources
- **Workday Community:** https://community.workday.com/
- **Workday Documentation:** https://doc.workday.com/
- **Workday Support:** Contact your Workday administrator

### AWS Resources
- **AWS Translate Documentation:** https://docs.aws.amazon.com/translate/
- **AWS Support:** https://console.aws.amazon.com/support/

---

## 🔄 Next Steps

After configuration:

1. ✅ Test with various file types (.txt, .html, .docx)
2. ✅ Test with different language pairs
3. ✅ Implement error handling in Extend app
4. ✅ Set up monitoring and alerts
5. ✅ Document for your team
6. ✅ Train users on the new feature
7. ✅ Plan for credential rotation (every 90 days)

---

**Version:** 1.0  
**Last Updated:** July 2026