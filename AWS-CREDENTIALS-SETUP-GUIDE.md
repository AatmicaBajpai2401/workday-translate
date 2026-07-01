# AWS Credentials Setup Guide for Workday Integration

This guide walks you through creating AWS credentials (Access Key ID and Secret Access Key) needed for the Workday-AWS Translate integration.

## 📋 Prerequisites

- AWS Account (if you don't have one, create at https://aws.amazon.com/)
- Administrative access to AWS Console
- Basic understanding of AWS IAM (Identity and Access Management)

---

## 🔐 Step-by-Step: Creating AWS Credentials

### Step 1: Sign in to AWS Console

1. Go to https://console.aws.amazon.com/
2. Sign in with your AWS account credentials
3. Ensure you're in the correct AWS region (we'll use **us-east-1** for this integration)

### Step 2: Navigate to IAM Service

1. In the AWS Console search bar, type **IAM**
2. Click on **IAM** (Identity and Access Management)
3. You'll be taken to the IAM Dashboard

### Step 3: Create an IAM User for Workday Integration

1. In the left sidebar, click **Users**
2. Click the **Create user** button (or **Add users**)
3. Configure user details:
   - **User name:** `workday-translate-integration` (or any name you prefer)
   - **Access type:** Select **Programmatic access** (this generates Access Key ID and Secret Access Key)
   - Click **Next**

### Step 4: Set Permissions for the User

You have two options:

#### Option A: Attach Existing Policy (Recommended for Production)

1. Select **Attach policies directly**
2. Search for **TranslateFullAccess** in the policy search box
3. Check the box next to **TranslateFullAccess**
4. Click **Next**

#### Option B: Create Custom Policy (More Secure - Recommended)

1. Select **Attach policies directly**
2. Click **Create policy**
3. Switch to the **JSON** tab
4. Paste this custom policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "WorkdayTranslateDocumentAccess",
            "Effect": "Allow",
            "Action": [
                "translate:TranslateDocument",
                "translate:TranslateText"
            ],
            "Resource": "*"
        }
    ]
}
```

5. Click **Next: Tags** (optional)
6. Click **Next: Review**
7. Name the policy: `WorkdayTranslatePolicy`
8. Add description: "Policy for Workday integration to use AWS Translate"
9. Click **Create policy**
10. Go back to the user creation tab and refresh the policy list
11. Search for `WorkdayTranslatePolicy` and select it
12. Click **Next**

### Step 5: Review and Create User

1. Review the user configuration
2. Click **Create user**

### Step 6: Save Your Credentials (CRITICAL!)

⚠️ **IMPORTANT:** This is the ONLY time you'll see the Secret Access Key!

1. You'll see a success screen with:
   - **Access key ID** (example: `AKIAIOSFODNN7EXAMPLE`)
   - **Secret access key** (example: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)

2. **SAVE THESE CREDENTIALS IMMEDIATELY:**
   - Click **Download .csv** button to save credentials file
   - Or copy both values to a secure password manager
   - Store them in a secure location (NOT in your code repository)

3. Click **Close**

---

## 🔑 Your AWS Credentials

After completing the above steps, you'll have:

```
AWS Access Key ID: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS Region: us-east-1
Service Name: translate
```

---

## 🔧 Configuring Credentials in Workday

### Method 1: Using Workday Integration System (Recommended)

1. **Log in to Workday**
2. **Search for:** "Create Integration System"
3. **Select:** "Amazon Web Services"
4. **Fill in the details:**
   - **Integration System Name:** `AWS Translate Service`
   - **AWS Region:** `us-east-1`
   - **Access Key ID:** [Paste your Access Key ID]
   - **Secret Access Key:** [Paste your Secret Access Key]
5. **Click:** "OK" to save

### Method 2: Using Workday Credentials Store

1. **Search for:** "Create Credential"
2. **Select:** "AWS Credentials"
3. **Fill in:**
   - **Credential Name:** `AWS_Translate_Credentials`
   - **Access Key ID:** [Your Access Key ID]
   - **Secret Access Key:** [Your Secret Access Key]
4. **Save**

---

## 🧪 Testing Your Credentials

### Test 1: Using AWS CLI

If you have AWS CLI installed:

```bash
# Configure AWS CLI with your credentials
aws configure

# Enter when prompted:
# AWS Access Key ID: [Your Access Key ID]
# AWS Secret Access Key: [Your Secret Access Key]
# Default region name: us-east-1
# Default output format: json

# Test the credentials
aws translate translate-text \
    --region us-east-1 \
    --source-language-code "en" \
    --target-language-code "es" \
    --text "Hello, World!"
```

Expected output:
```json
{
    "TranslatedText": "Hola, mundo!",
    "SourceLanguageCode": "en",
    "TargetLanguageCode": "es"
}
```

### Test 2: Using AWS Console

1. Go to AWS Translate Console: https://console.aws.amazon.com/translate/
2. Try the "Real-time translation" feature
3. If it works, your account has proper access

---

## 🔒 Security Best Practices

### 1. Rotate Credentials Regularly

- Rotate access keys every 90 days
- To rotate:
  1. Create new access key for the user
  2. Update Workday with new credentials
  3. Test the integration
  4. Delete old access key

### 2. Use Least Privilege Principle

- Only grant `translate:TranslateDocument` permission
- Don't use root account credentials
- Use the custom policy (Option B) instead of full access

### 3. Monitor Usage

1. Enable AWS CloudTrail for API call logging
2. Set up CloudWatch alarms for unusual activity
3. Review IAM Access Advisor regularly

### 4. Secure Storage

- Never commit credentials to Git/version control
- Use Workday's secure credential storage
- Don't share credentials via email or chat
- Use environment variables for local testing

### 5. Enable MFA (Multi-Factor Authentication)

1. Go to IAM → Users → [Your User]
2. Security credentials tab
3. Enable MFA device

---

## 🚨 What If You Lose Your Secret Access Key?

If you lose your Secret Access Key:

1. **You CANNOT retrieve it** - AWS doesn't store it
2. **Solution:** Create a new access key:
   - Go to IAM → Users → [Your User]
   - Security credentials tab
   - Click "Create access key"
   - Save the new credentials
   - Update Workday with new credentials
   - Delete the old access key

---

## 📊 IAM Policy Details

### Full Custom Policy for Production

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "TranslateDocumentAccess",
            "Effect": "Allow",
            "Action": [
                "translate:TranslateDocument",
                "translate:TranslateText"
            ],
            "Resource": "*"
        },
        {
            "Sid": "CloudWatchLogsAccess",
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-east-1:*:log-group:/aws/translate/*"
        }
    ]
}
```

### Policy Explanation

- **translate:TranslateDocument** - Allows document translation (required)
- **translate:TranslateText** - Allows text translation (optional, for testing)
- **logs:*** - Allows CloudWatch logging (optional, for monitoring)

---

## 🌍 Multi-Region Setup (Optional)

If you need to use multiple AWS regions:

### Create credentials for each region:

1. **us-east-1** (N. Virginia) - Primary
2. **eu-west-1** (Ireland) - Europe
3. **ap-southeast-1** (Singapore) - Asia

### In Workday:

Create separate Integration Systems for each region:
- `AWS_Translate_US_East`
- `AWS_Translate_EU_West`
- `AWS_Translate_AP_Southeast`

---

## 🔍 Troubleshooting

### Error: "Access Denied"

**Cause:** IAM user doesn't have required permissions

**Solution:**
1. Go to IAM → Users → [Your User] → Permissions
2. Verify `TranslateFullAccess` or custom policy is attached
3. Check policy has `translate:TranslateDocument` action

### Error: "Invalid Access Key ID"

**Cause:** Access Key ID is incorrect or deleted

**Solution:**
1. Verify you copied the entire Access Key ID
2. Check for extra spaces or characters
3. Create new access key if needed

### Error: "Signature Does Not Match"

**Cause:** Secret Access Key is incorrect or AWS Signature V4 signing issue

**Solution:**
1. Verify Secret Access Key is correct
2. Check Workday Integration System configuration
3. Ensure region is set to `us-east-1`
4. Verify service name is `translate`

---

## 📞 Getting Help

### AWS Support Resources

1. **AWS Documentation:** https://docs.aws.amazon.com/translate/
2. **AWS Support Center:** https://console.aws.amazon.com/support/
3. **AWS Forums:** https://forums.aws.amazon.com/
4. **AWS IAM Documentation:** https://docs.aws.amazon.com/IAM/

### Workday Support

1. **Workday Community:** https://community.workday.com/
2. **Workday Support Portal:** Contact your Workday administrator

---

## ✅ Checklist

Before proceeding with integration, ensure you have:

- [ ] Created AWS account
- [ ] Created IAM user with programmatic access
- [ ] Attached appropriate IAM policy (TranslateFullAccess or custom)
- [ ] Downloaded and securely stored Access Key ID
- [ ] Downloaded and securely stored Secret Access Key
- [ ] Noted the AWS region (us-east-1)
- [ ] Tested credentials using AWS CLI or Console
- [ ] Configured credentials in Workday Integration System
- [ ] Documented credentials location for your team
- [ ] Set up credential rotation schedule

---

## 📝 Quick Reference

```
Service: AWS Translate
Region: us-east-1
Endpoint: https://translate.us-east-1.amazonaws.com/
Authentication: AWS Signature Version 4
Required IAM Permission: translate:TranslateDocument

Workday Configuration:
- Integration System Type: Amazon Web Services
- Service Name: translate
- Region: us-east-1
- Access Key ID: [From IAM User]
- Secret Access Key: [From IAM User]
```

---

**Last Updated:** July 2026  
**Version:** 1.0