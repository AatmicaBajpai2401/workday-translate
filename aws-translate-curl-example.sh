#!/bin/bash

# AWS Translate Document API - cURL Example
# This script demonstrates how to call AWS Translate API with proper authentication

# Configuration
AWS_REGION="us-east-1"
AWS_SERVICE="translate"
AWS_ENDPOINT="https://translate.us-east-1.amazonaws.com/"
AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"

# Request parameters
SOURCE_LANGUAGE="en"
TARGET_LANGUAGE="es"
CONTENT_TYPE="text/plain"

# Sample base64 encoded document (Hello World! This is a test document.)
DOCUMENT_BASE64="SGVsbG8gV29ybGQhIFRoaXMgaXMgYSB0ZXN0IGRvY3VtZW50Lg=="

# Create request body
REQUEST_BODY=$(cat <<EOF
{
  "Document": {
    "Content": "${DOCUMENT_BASE64}",
    "ContentType": "${CONTENT_TYPE}"
  },
  "SourceLanguageCode": "${SOURCE_LANGUAGE}",
  "TargetLanguageCode": "${TARGET_LANGUAGE}"
}
EOF
)

# Get current timestamp
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
DATE_STAMP=$(date -u +"%Y%m%d")

# Create canonical request (AWS Signature V4)
# Note: In production, use AWS SDK or proper signing library
# This is a simplified example

echo "Request Body:"
echo "$REQUEST_BODY"
echo ""
echo "Making API call to AWS Translate..."
echo ""

# Using AWS CLI (recommended approach)
# Make sure AWS CLI is configured with credentials
aws translate translate-document \
  --region us-east-1 \
  --source-language-code "$SOURCE_LANGUAGE" \
  --target-language-code "$TARGET_LANGUAGE" \
  --document "Content=${DOCUMENT_BASE64},ContentType=${CONTENT_TYPE}" \
  --output json

# Alternative: Using cURL with pre-signed request
# Note: AWS Signature V4 signing is complex. Use AWS SDK in production.
# This example shows the structure but requires proper signing implementation

# curl -X POST "$AWS_ENDPOINT" \
#   -H "Content-Type: application/x-amz-json-1.1" \
#   -H "X-Amz-Target: AWSShineFrontendService_20170701.TranslateDocument" \
#   -H "X-Amz-Date: $TIMESTAMP" \
#   -H "Authorization: AWS4-HMAC-SHA256 Credential=..." \
#   -d "$REQUEST_BODY"

echo ""
echo "Note: For production use, implement proper AWS Signature V4 signing"
echo "or use AWS SDK/CLI for authentication"

# Made with Bob
