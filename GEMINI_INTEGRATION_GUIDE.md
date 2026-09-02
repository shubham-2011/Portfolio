# Gemini AI Integration Guide

## Overview
Your portfolio chatbot now uses **Google Gemini 1.5 Flash** as the primary AI backend for answering questions about Shubham's projects, skills, and experience.

## How It Works

When a user sends a message to the chatbot:
1. **Greeting Detection** - If it's a greeting (hi, hello, how are you), respond directly
2. **Knowledge Base** - Check MongoDB/PostgreSQL for trained answers
3. **Gemini API** - If no match, use Gemini with portfolio context
4. **Fallback** - If Gemini fails, show contact information

## Setup

### API Key
Your Gemini API key is stored in `.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```
⚠️ **Never commit your actual API key to Git!** Keep it only in `.env.local`

### Get Your Own API Key
If you need to update or change the key:
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Update `.env.local` and `.env.example`

## Using the Gemini Module

### In Server-Side Code
```typescript
import { generateGeminiResponse, isGeminiAvailable } from '@/lib/gemini';

// Check if available
if (isGeminiAvailable()) {
  const result = await generateGeminiResponse("User question here");
  if (result.success) {
    console.log(result.answer);
  }
}
```

### Streaming Responses
```typescript
import { generateGeminiResponseStream } from '@/lib/gemini';

const stream = await generateGeminiResponseStream("User question");
for await (const chunk of stream.stream) {
  console.log(chunk.text());
}
```

## Portfolio Context
The Gemini module includes detailed context about:
- **About Shubham**: Full Stack Developer, Java, Spring Boot, React, Angular, PostgreSQL, AWS
- **Skills**: Frontend, Backend, Database, Cloud & Tools (20+ technologies)
- **Projects**: 5 production systems with architecture details
- **Experience**: APK Elite Services, SetTribe, Tipco Engineering
- **Education**: MSc (Indira), BSc, XII, X
- **Contact**: Email, WhatsApp, 0 days notice

## Customization

### Update Portfolio Context
Edit `/src/lib/gemini.ts` and modify the `PORTFOLIO_CONTEXT` variable to include:
- New projects or achievements
- Updated skills or technologies
- New contact methods
- Revised bio or experience

### Change Gemini Model
Current: `gemini-1.5-flash` (fast & cheap)

Other options:
- `gemini-1.5-pro` (more capable, slightly slower)
- `gemini-2.0-flash` (newer, faster)

Update in `/src/lib/gemini.ts`:
```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
```

## Testing

### Local Development
```bash
npm run dev
# Test chatbot at http://localhost:3000
```

### Production
```bash
npm run build
npm run start
# Deployed on Netlify
```

## API Costs

Google Gemini API is **free up to 15 requests/minute**. Pricing details:
- https://ai.google.dev/pricing

Monitor usage in:
- https://makersuite.google.com/app/apikey/quotas

## Troubleshooting

### "GEMINI_API_KEY environment variable is not set"
- Add `GEMINI_API_KEY` to `.env.local`
- Restart development server

### API returns empty response
- Check internet connection
- Verify API key is valid
- Check Google API quotas/limits
- Fallback to local RAG automatically

### Rate limiting
- Free tier: 15 requests/minute
- Wait a minute or upgrade to paid plan

## Performance Notes

- **Speed**: ~1-2 seconds per response (streaming enabled)
- **Accuracy**: Grounded in portfolio context
- **Reliability**: Fallback to contact info if API fails
- **Cost**: Free tier sufficient for portfolio chatbot

## Files Involved

- `/src/lib/gemini.ts` - Main module
- `/src/app/api/chat/route.ts` - Chat endpoint
- `/.env.local` - API key (not committed)
- `/.env.example` - Template (committed)
