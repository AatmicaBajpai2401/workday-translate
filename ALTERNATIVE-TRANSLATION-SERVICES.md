# Alternative Translation Services (Without AWS Account)

If you want to implement document translation without creating an AWS account, here are several alternatives you can use with Workday Orchestration.

---

## 🔄 Quick Answer

**Unfortunately, to use AWS Translate API specifically, you MUST have an AWS account.** However, there are several alternatives:

1. **Free/Freemium Options** - Google Translate API, LibreTranslate
2. **Microsoft Azure Translator** - Similar to AWS but different provider
3. **Open Source Solutions** - Self-hosted translation services
4. **Third-party APIs** - RapidAPI marketplace services

---

## 📊 Comparison Table

| Service | Free Tier | Account Required | Best For |
|---------|-----------|------------------|----------|
| **AWS Translate** | 2M chars/month (12 months) | Yes (AWS) | Production, Enterprise |
| **Google Cloud Translation** | $10 credit | Yes (Google Cloud) | Production, Enterprise |
| **Microsoft Azure Translator** | 2M chars/month | Yes (Azure) | Production, Enterprise |
| **LibreTranslate** | Unlimited (self-hosted) | No (if self-hosted) | Privacy-focused, Free |
| **DeepL API** | 500k chars/month | Yes (DeepL) | High quality translations |
| **RapidAPI Services** | Varies | Yes (RapidAPI) | Quick setup, Testing |

---

## 1️⃣ Google Cloud Translation API

### Overview
Similar to AWS Translate, but uses Google Cloud Platform.

### Pros
- High quality translations
- Supports 100+ languages
- Document translation available
- $300 free credit for new accounts

### Cons
- Still requires account creation (Google Cloud)
- Paid service after free tier

### Setup

**API Endpoint:**
```
https://translation.googleapis.com/v3/projects/{project-id}/locations/{location}:translateDocument
```

**Request Format:**
```json
{
  "documentInputConfig": {
    "content": "<BASE64_DOCUMENT>",
    "mimeType": "text/plain"
  },
  "sourceLanguageCode": "en",
  "targetLanguageCode": "es"
}
```

**Authentication:** OAuth 2.0 or API Key

**Workday Configuration:**
- Integration System Type: REST API
- Authentication: OAuth 2.0 or API Key
- Similar setup to AWS but different endpoint

---

## 2️⃣ Microsoft Azure Translator

### Overview
Microsoft's translation service, part of Azure Cognitive Services.

### Pros
- 2 million characters free per month
- Supports 90+ languages
- Document translation available
- Good for Microsoft-centric organizations

### Cons
- Requires Azure account
- Paid after free tier

### Setup

**API Endpoint:**
```
https://<region>.api.cognitive.microsofttranslator.com/translate?api-version=3.0
```

**Request Format:**
```json
[
  {
    "Text": "<YOUR_TEXT>"
  }
]
```

**Authentication:** Subscription Key

**Workday Configuration:**
- Integration System Type: REST API
- Authentication: API Key (Subscription Key)
- Header: `Ocp-Apim-Subscription-Key: <your-key>`

---

## 3️⃣ LibreTranslate (Open Source - FREE)

### Overview
**This is your best option for NO account requirement!**

LibreTranslate is a free, open-source translation API that you can:
- Use their public API (limited)
- Self-host (unlimited, completely free)
- No account required for self-hosted version

### Pros
- ✅ **Completely FREE**
- ✅ **No account required** (if self-hosted)
- ✅ Open source
- ✅ Privacy-focused (data stays on your server)
- ✅ Supports 30+ languages
- ✅ Can handle documents

### Cons
- Lower quality than commercial services
- Requires technical setup for self-hosting
- Public API has rate limits

### Setup Options

#### Option A: Use Public API (Limited)

**API Endpoint:**
```
https://libretranslate.com/translate
```

**Request Format:**
```json
{
  "q": "<TEXT_TO_TRANSLATE>",
  "source": "en",
  "target": "es",
  "format": "text"
}
```

**No Authentication Required!**

#### Option B: Self-Host (Recommended)

**Installation:**
```bash
# Using Docker (easiest)
docker run -ti --rm -p 5000:5000 libretranslate/libretranslate

# Or using pip
pip install libretranslate
libretranslate
```

**Your Own API Endpoint:**
```
http://your-server:5000/translate
```

### Workday Configuration for LibreTranslate

```json
{
  "url": "https://libretranslate.com/translate",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "q": "{{documentText}}",
    "source": "{{inputLanguage}}",
    "target": "{{outputLanguage}}",
    "format": "text"
  }
}
```

**Note:** LibreTranslate works best with text. For documents, you'll need to:
1. Extract text from document
2. Translate text
3. Recreate document with translated text

---

## 4️⃣ DeepL API

### Overview
Known for high-quality translations, especially for European languages.

### Pros
- Excellent translation quality
- 500,000 characters/month free
- Simple API
- Supports documents

### Cons
- Requires DeepL account
- Limited language support (30 languages)
- Paid after free tier

### Setup

**API Endpoint:**
```
https://api-free.deepl.com/v2/translate
```

**Request Format:**
```json
{
  "text": ["<TEXT_TO_TRANSLATE>"],
  "source_lang": "EN",
  "target_lang": "ES"
}
```

**Authentication:** API Key (in header)

---

## 5️⃣ RapidAPI Translation Services

### Overview
Marketplace with various translation APIs, some with free tiers.

### Popular Options on RapidAPI

1. **Google Translate (Unofficial)**
   - Free tier available
   - Easy setup
   - Good for testing

2. **Microsoft Translator Text**
   - Free tier available
   - Official Microsoft API

3. **MyMemory Translation**
   - 1000 words/day free
   - No account required for basic use

### Setup

**Example Endpoint:**
```
https://google-translate1.p.rapidapi.com/language/translate/v2
```

**Authentication:** RapidAPI Key

---

## 🎯 Recommended Solution for Your Use Case

### If You Want NO Account at All:

**Use LibreTranslate (Self-Hosted)**

**Pros:**
- ✅ Completely free
- ✅ No account needed
- ✅ Full control
- ✅ Privacy

**Setup Steps:**

1. **Host LibreTranslate on your server:**
```bash
docker run -d -p 5000:5000 libretranslate/libretranslate
```

2. **Update Workday Orchestration:**
```json
{
  "url": "http://your-server:5000/translate",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "q": "{{extractedText}}",
    "source": "{{inputLanguage}}",
    "target": "{{outputLanguage}}"
  }
}
```

3. **Handle Documents:**
   - Extract text from uploaded document
   - Send text to LibreTranslate
   - Recreate document with translated text

---

## 💰 Cost Comparison

### Free Tier Comparison

| Service | Free Amount | Duration | Account Required |
|---------|-------------|----------|------------------|
| AWS Translate | 2M chars/month | 12 months | Yes |
| Google Translate | $300 credit | 90 days | Yes |
| Azure Translator | 2M chars/month | Forever | Yes |
| LibreTranslate | Unlimited | Forever | No (self-hosted) |
| DeepL | 500k chars/month | Forever | Yes |

### After Free Tier

| Service | Cost per 1M Characters |
|---------|------------------------|
| AWS Translate | $15 |
| Google Translate | $20 |
| Azure Translator | $10 |
| LibreTranslate | $0 (self-hosted) |
| DeepL | $25 |

---

## 🔧 Implementation Guide: LibreTranslate with Workday

### Step 1: Set Up LibreTranslate

**Option A: Docker (Recommended)**
```bash
# Pull and run LibreTranslate
docker run -d \
  --name libretranslate \
  -p 5000:5000 \
  --restart unless-stopped \
  libretranslate/libretranslate
```

**Option B: Python**
```bash
pip install libretranslate
libretranslate --host 0.0.0.0 --port 5000
```

### Step 2: Test LibreTranslate

```bash
curl -X POST "http://localhost:5000/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "q": "Hello World",
    "source": "en",
    "target": "es"
  }'
```

Expected response:
```json
{
  "translatedText": "Hola Mundo"
}
```

### Step 3: Configure Workday Orchestration

**Integration System:**
- Type: REST API
- URL: `http://your-server:5000`
- Authentication: None (or API key if you configure one)

**Orchestration Steps:**

1. **Extract Text from Document**
   - For .txt: Use as-is
   - For .html: Parse HTML
   - For .docx: Extract text content

2. **Call LibreTranslate API**
   - POST to `/translate`
   - Send extracted text

3. **Recreate Document**
   - Create new document with translated text
   - Maintain original format

### Step 4: Handle Document Formats

**For Text Files (.txt):**
```javascript
// Simple - translate entire content
const response = await fetch('http://your-server:5000/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    q: documentText,
    source: inputLanguage,
    target: outputLanguage
  })
});
```

**For HTML Files (.html):**
```javascript
// Preserve HTML structure, translate text nodes
// Use HTML parser to extract text
// Translate text
// Reconstruct HTML
```

**For Word Documents (.docx):**
```javascript
// Extract text from DOCX
// Translate text
// Create new DOCX with translated text
// Note: Formatting may be lost
```

---

## ⚠️ Important Considerations

### 1. Translation Quality

**Commercial Services (AWS, Google, Azure, DeepL):**
- ✅ High quality
- ✅ Context-aware
- ✅ Continuously improving

**Free/Open Source (LibreTranslate):**
- ⚠️ Lower quality
- ⚠️ Less context-aware
- ⚠️ May have errors

### 2. Document Handling

**AWS Translate:**
- ✅ Native document support
- ✅ Preserves formatting
- ✅ Handles .docx directly

**LibreTranslate:**
- ⚠️ Text-only
- ⚠️ Requires text extraction
- ⚠️ Formatting may be lost

### 3. Privacy & Security

**Cloud Services:**
- ⚠️ Data sent to third-party
- ⚠️ Subject to provider's terms

**Self-Hosted LibreTranslate:**
- ✅ Data stays on your server
- ✅ Full control
- ✅ GDPR compliant

---

## 🎓 Recommendation

### For Production Use:
**Create an AWS account** - It's the best option because:
- ✅ Native document support (.txt, .html, .docx)
- ✅ High quality translations
- ✅ Preserves document formatting
- ✅ 2 million characters free for 12 months
- ✅ Easy integration with Workday
- ✅ Reliable and scalable

**Cost:** After free tier, ~$15 per million characters
**Setup Time:** 30 minutes

### For Testing/Development:
**Use LibreTranslate** - Good for:
- ✅ Testing the integration
- ✅ Proof of concept
- ✅ Learning
- ✅ Privacy-sensitive data

**Cost:** Free
**Setup Time:** 1-2 hours (including server setup)

### For Budget-Conscious:
**Azure Translator** - Best value:
- ✅ 2 million characters free FOREVER
- ✅ Good quality
- ✅ Similar to AWS setup

---

## 📞 Next Steps

### If You Choose AWS (Recommended):
1. Create AWS account (free): https://aws.amazon.com/free/
2. Follow AWS-CREDENTIALS-SETUP-GUIDE.md
3. Follow WORKDAY-CONFIGURATION-GUIDE.md
4. Total time: ~1 hour

### If You Choose LibreTranslate:
1. Set up LibreTranslate server
2. Modify orchestration for text-only translation
3. Implement document text extraction
4. Total time: ~3-4 hours

### If You Choose Azure:
1. Create Azure account: https://azure.microsoft.com/free/
2. Create Translator resource
3. Get subscription key
4. Configure Workday (similar to AWS)
5. Total time: ~1 hour

---

## 🔗 Resources

- **LibreTranslate:** https://libretranslate.com/
- **LibreTranslate GitHub:** https://github.com/LibreTranslate/LibreTranslate
- **DeepL API:** https://www.deepl.com/pro-api
- **Azure Translator:** https://azure.microsoft.com/services/cognitive-services/translator/
- **Google Cloud Translation:** https://cloud.google.com/translate

---

**Bottom Line:** While you technically CAN avoid AWS by using alternatives, AWS Translate is specifically designed for document translation and offers the best experience for your use case. The free tier gives you 12 months to evaluate, and the cost after that is reasonable for production use.