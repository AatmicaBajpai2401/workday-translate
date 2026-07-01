# Workday Orchestration - AWS Translate Document API Integration Guide

## Overview
This guide provides the complete setup for integrating AWS Translate Document API with Workday Orchestration to translate documents (text, HTML, Word) from one language to another.

## AWS Translate Document API Details

### API Endpoint
**Region:** us-east-1
**Service Endpoint:** `https://translate.us-east-1.amazonaws.com/`

### API Action
**Action:** `TranslateDocument`
**API Version:** `20170701`

---

## Workday Orchestration Configuration

### 1. Integration System Setup

#### Create AWS Integration System
1. Navigate to: **Create Integration System**
2. Select: **Amazon Web Services**
3. Configure:
   - **Integration System Name:** AWS Translate Service
   - **AWS Region:** us-east-1
   - **Access Key ID:** [Your AWS Access Key]
   - **Secret Access Key:** [Your AWS Secret Key]

### 2. REST API Integration Configuration

#### Integration Details
- **Integration Name:** Translate Document Integration
- **Integration Type:** REST API
- **HTTP Method:** POST
- **Endpoint URL:** `https://translate.us-east-1.amazonaws.com/`

#### Authentication
- **Authentication Type:** AWS Signature Version 4
- **Service Name:** translate
- **Region:** us-east-1
- **Access Key ID:** [Reference from Integration System]
- **Secret Access Key:** [Reference from Integration System]

---

## Request Configuration

### Required Headers

```
Content-Type: application/x-amz-json-1.1
X-Amz-Target: AWSShineFrontendService_20170701.TranslateDocument
```

### Request Body Structure (JSON)

```json
{
  "Document": {
    "Content": "<BASE64_ENCODED_DOCUMENT>",
    "ContentType": "<DOCUMENT_CONTENT_TYPE>"
  },
  "SourceLanguageCode": "<INPUT_LANGUAGE_CODE>",
  "TargetLanguageCode": "<OUTPUT_LANGUAGE_CODE>",
  "Settings": {
    "Formality": "FORMAL"
  }
}
```

### Content Type Mapping
- **Text files (.txt):** `text/plain`
- **HTML files (.html):** `text/html`
- **Word documents (.docx):** `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Language Codes (Common Examples)
- English: `en`
- Spanish: `es`
- French: `fr`
- German: `de`
- Italian: `it`
- Portuguese: `pt`
- Japanese: `ja`
- Chinese (Simplified): `zh`
- Arabic: `ar`
- Hindi: `hi`

---

## Workday Orchestration Integration Steps

### Step 1: Create Integration Variables

Create the following variables in your orchestration:

```
1. inputLanguage (String) - Source language code
2. outputLanguage (String) - Target language code
3. documentBase64 (String) - Base64 encoded document
4. documentContentType (String) - MIME type of document
5. translatedDocumentBase64 (String) - Response variable
```

### Step 2: Build Request Body

Use a **Create JSON** step to build the request:

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

### Step 3: Configure REST API Call

**REST API Configuration:**
- **URL:** `https://translate.us-east-1.amazonaws.com/`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/x-amz-json-1.1`
  - `X-Amz-Target: AWSShineFrontendService_20170701.TranslateDocument`
- **Body:** Use the JSON created in Step 2
- **Authentication:** AWS Signature V4 (configured in Integration System)

### Step 4: Parse Response

The AWS Translate API returns a response in this format:

```json
{
  "TranslatedDocument": {
    "Content": "<BASE64_ENCODED_TRANSLATED_DOCUMENT>"
  },
  "SourceLanguageCode": "en",
  "TargetLanguageCode": "es",
  "AppliedSettings": {
    "Formality": "FORMAL"
  }
}
```

Extract the translated document:
- **Path:** `TranslatedDocument.Content`
- **Store in:** `translatedDocumentBase64` variable

---

## Complete Orchestration Flow Example

```
1. Start
   ↓
2. Get Input Parameters
   - documentBase64 (from Extend app)
   - inputLanguage (from dropdown)
   - outputLanguage (from dropdown)
   - documentContentType (based on file extension)
   ↓
3. Validate Languages
   - Ensure one language is English
   - Validate language codes
   ↓
4. Create JSON Request Body
   - Build request structure
   ↓
5. Call AWS Translate API
   - POST to translate.us-east-1.amazonaws.com
   - Include AWS Signature V4 authentication
   ↓
6. Parse Response
   - Extract TranslatedDocument.Content
   ↓
7. Return Translated Document
   - Return base64 encoded translated document
   ↓
8. End
```

---

## Sample Request Payload

```json
{
  "Document": {
    "Content": "SGVsbG8gV29ybGQhIFRoaXMgaXMgYSB0ZXN0IGRvY3VtZW50Lg==",
    "ContentType": "text/plain"
  },
  "SourceLanguageCode": "en",
  "TargetLanguageCode": "es"
}
```

---

## Sample Response

```json
{
  "TranslatedDocument": {
    "Content": "wqFIb2xhIE11bmRvISBFc3RvIGVzIHVuIGRvY3VtZW50byBkZSBwcnVlYmEu"
  },
  "SourceLanguageCode": "en",
  "TargetLanguageCode": "es",
  "AppliedSettings": {
    "Formality": "FORMAL"
  }
}
```

---

## Error Handling

### Common Error Codes

1. **UnsupportedLanguagePairException**
   - One of the language codes is not supported
   - Verify language codes are valid

2. **InvalidRequestException**
   - Request format is incorrect
   - Check JSON structure and base64 encoding

3. **TextSizeLimitExceededException**
   - Document exceeds size limit (10MB for synchronous)
   - Consider splitting document or using asynchronous API

4. **InternalServerException**
   - AWS service error
   - Implement retry logic with exponential backoff

### Error Handling in Orchestration

Add error handling steps:
```
1. Try-Catch block around API call
2. Log error details
3. Return user-friendly error message
4. Implement retry logic for transient errors
```

---

## Testing Checklist

- [ ] Test with text file (.txt)
- [ ] Test with HTML file (.html)
- [ ] Test with Word document (.docx)
- [ ] Test English to Spanish translation
- [ ] Test Spanish to English translation
- [ ] Test with other language pairs
- [ ] Test error scenarios (invalid language codes)
- [ ] Test with maximum file size (10MB)
- [ ] Verify base64 encoding/decoding
- [ ] Test response parsing

---

## Important Notes

1. **File Size Limit:** Maximum 10MB for synchronous translation
2. **Supported Formats:** text/plain, text/html, application/vnd.openxmlformats-officedocument.wordprocessingml.document
3. **Language Requirement:** One language must be English (as per your requirement)
4. **Base64 Encoding:** Ensure proper encoding without line breaks
5. **Authentication:** AWS Signature V4 is required for all requests
6. **Rate Limits:** AWS Translate has rate limits; implement throttling if needed

---

## Additional Resources

- [AWS Translate API Documentation](https://docs.aws.amazon.com/translate/latest/dg/API_TranslateDocument.html)
- [AWS Signature Version 4 Signing Process](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html)
- [Supported Language Codes](https://docs.aws.amazon.com/translate/latest/dg/what-is-languages.html)

---

## Support

For issues or questions:
1. Check AWS CloudWatch logs for API errors
2. Verify AWS credentials and permissions
3. Ensure IAM role has `translate:TranslateDocument` permission
4. Review Workday orchestration logs for integration errors