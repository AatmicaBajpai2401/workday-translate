# Workday Extend - AWS Translate Document Integration

Complete integration guide for translating documents (text, HTML, Word) using AWS Translate API from Workday Extend app via Workday Orchestration.

## 📋 Overview

This integration allows you to:
- Upload documents (`.txt`, `.html`, `.docx`) in Workday Extend app
- Select source and target languages (one must be English)
- Translate documents using AWS Translate Document API
- Download translated documents

## 🏗️ Architecture

```
Workday Extend App
    ↓ (Base64 encoded document + languages)
Workday Orchestration
    ↓ (REST API call with AWS Signature V4)
AWS Translate API (us-east-1)
    ↓ (Translated document in Base64)
Workday Orchestration
    ↓ (Response)
Workday Extend App
```

## 📁 Files Included

1. **workday-aws-translate-integration.md** - Complete integration guide with step-by-step instructions
2. **workday-orchestration-sample.json** - Sample orchestration configuration
3. **workday-extend-integration-code.js** - Frontend JavaScript code for Extend app
4. **aws-translate-curl-example.sh** - Example API call using cURL/AWS CLI
5. **README.md** - This file

## 🚀 Quick Start

### Prerequisites

- Workday tenant with Extend and Orchestration enabled
- AWS account with Translate API access
- AWS IAM user with `translate:TranslateDocument` permission
- AWS Access Key ID and Secret Access Key

### Step 1: Configure AWS Integration System

1. In Workday, navigate to **Create Integration System**
2. Select **Amazon Web Services**
3. Configure:
   - **Name:** AWS Translate Service
   - **Region:** us-east-1
   - **Access Key ID:** [Your AWS Access Key]
   - **Secret Access Key:** [Your AWS Secret Key]

### Step 2: Create Orchestration Integration

1. Create new orchestration integration
2. Use the configuration from `workday-orchestration-sample.json`
3. Configure REST API step:
   - **URL:** `https://translate.us-east-1.amazonaws.com/`
   - **Method:** POST
   - **Headers:**
     - `Content-Type: application/x-amz-json-1.1`
     - `X-Amz-Target: AWSShineFrontendService_20170701.TranslateDocument`
   - **Authentication:** AWS Signature V4 (reference your Integration System)

### Step 3: Deploy Extend App

1. Use the code from `workday-extend-integration-code.js`
2. Update the orchestration endpoint URL
3. Implement authentication token retrieval
4. Deploy to your Workday tenant

## 🔧 API Details

### Endpoint
```
https://translate.us-east-1.amazonaws.com/
```

### Request Format

```json
{
  "Document": {
    "Content": "<BASE64_ENCODED_DOCUMENT>",
    "ContentType": "<MIME_TYPE>"
  },
  "SourceLanguageCode": "<SOURCE_LANG>",
  "TargetLanguageCode": "<TARGET_LANG>"
}
```

### Response Format

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

## 📝 Supported File Types

| File Type | Extension | MIME Type |
|-----------|-----------|-----------|
| Text | `.txt` | `text/plain` |
| HTML | `.html` | `text/html` |
| Word | `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |

## 🌍 Supported Languages

Common language codes (one must be English):

- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `ja` - Japanese
- `zh` - Chinese (Simplified)
- `ar` - Arabic
- `hi` - Hindi

[Full list of supported languages](https://docs.aws.amazon.com/translate/latest/dg/what-is-languages.html)

## ⚙️ Configuration Parameters

### Orchestration Variables

```javascript
{
  "documentBase64": "string",      // Base64 encoded document
  "inputLanguage": "string",       // Source language code (e.g., "en")
  "outputLanguage": "string",      // Target language code (e.g., "es")
  "fileExtension": "string",       // File extension (.txt, .html, .docx)
  "documentContentType": "string"  // MIME type (auto-determined)
}
```

### AWS Authentication

- **Type:** AWS Signature Version 4
- **Service:** translate
- **Region:** us-east-1
- **Credentials:** From Integration System

## 🔒 Security Considerations

1. **AWS Credentials:** Store securely in Workday Integration System
2. **File Size Validation:** Enforce 10MB limit for synchronous translation
3. **File Type Validation:** Only allow supported file types
4. **Language Validation:** Ensure one language is English
5. **Error Handling:** Implement proper error handling and logging

## 📊 Limitations

- **Maximum file size:** 10MB (synchronous translation)
- **Supported formats:** Text, HTML, Word documents only
- **Language requirement:** One language must be English
- **Rate limits:** Subject to AWS Translate API rate limits

## 🐛 Troubleshooting

### Common Errors

1. **UnsupportedLanguagePairException**
   - Verify language codes are valid
   - Ensure one language is English

2. **InvalidRequestException**
   - Check base64 encoding is correct
   - Verify JSON structure matches API requirements

3. **TextSizeLimitExceededException**
   - File exceeds 10MB limit
   - Consider splitting document or using asynchronous API

4. **Authentication Errors**
   - Verify AWS credentials are correct
   - Check IAM permissions include `translate:TranslateDocument`
   - Ensure AWS Signature V4 is properly configured

### Debug Steps

1. Check Workday orchestration logs
2. Verify AWS CloudWatch logs for API calls
3. Test with small sample document first
4. Validate base64 encoding/decoding
5. Confirm language codes are correct

## 📚 Additional Resources

- [AWS Translate API Documentation](https://docs.aws.amazon.com/translate/latest/dg/API_TranslateDocument.html)
- [AWS Signature Version 4 Signing](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html)
- [Workday Orchestration Documentation](https://doc.workday.com/)
- [Workday Extend Documentation](https://doc.workday.com/extend)

## 🧪 Testing

### Test Checklist

- [ ] Upload text file (.txt)
- [ ] Upload HTML file (.html)
- [ ] Upload Word document (.docx)
- [ ] Test English → Spanish translation
- [ ] Test Spanish → English translation
- [ ] Test with maximum file size (10MB)
- [ ] Test error handling (invalid language codes)
- [ ] Test error handling (unsupported file type)
- [ ] Verify base64 encoding/decoding
- [ ] Confirm translated document downloads correctly

### Sample Test Document

Create a simple text file with this content:
```
Hello World! This is a test document for translation.
We are testing the AWS Translate integration with Workday.
```

Expected Spanish translation:
```
¡Hola Mundo! Este es un documento de prueba para traducción.
Estamos probando la integración de AWS Translate con Workday.
```

## 💡 Best Practices

1. **Error Handling:** Implement comprehensive error handling with user-friendly messages
2. **Logging:** Log all API calls and responses for debugging
3. **Validation:** Validate inputs before sending to AWS
4. **User Feedback:** Provide clear loading indicators and success/error messages
5. **File Size:** Check file size before processing
6. **Retry Logic:** Implement exponential backoff for transient errors
7. **Monitoring:** Set up monitoring for API usage and errors

## 🔄 Future Enhancements

- Support for asynchronous translation (files > 10MB)
- Batch translation of multiple documents
- Custom terminology support
- Translation memory integration
- Support for additional file formats (PDF, etc.)
- Language auto-detection

## 📞 Support

For issues or questions:
1. Review the troubleshooting section
2. Check AWS CloudWatch logs
3. Review Workday orchestration logs
4. Verify IAM permissions
5. Contact your Workday administrator

## 📄 License

This integration guide is provided as-is for educational and implementation purposes.

---

**Version:** 1.0  
**Last Updated:** July 2026  
**Author:** Integration Team
