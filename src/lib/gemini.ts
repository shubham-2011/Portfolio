import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('GEMINI_API_KEY environment variable is not set');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Portfolio context for Gemini to ground its responses
const PORTFOLIO_CONTEXT = `You are an AI assistant for Shubham Kumar's developer portfolio. 
You have detailed knowledge about:

ABOUT SHUBHAM:
- Full Stack Software Developer specialized in Java, Spring Boot, React, Angular, PostgreSQL, and AWS Cloud
- Available for opportunities with 0 days notice period
- Location: Pune, India
- Email: shubhammisra800@gmail.com
- WhatsApp: +91 9322887529

EDUCATION:
- MSc Computer Science at Indira University, Pune (2025 - Present)
- Bachelor's Degree in Computer Science, Pune (2020 - 2023, 60%)
- Senior Secondary (XII) at PC College, Bihar (2017 - 2020, 60%)
- Higher Secondary (X) at Saraswati Vidya Mandir, Bihar (CGPA: 7.0)

TECHNICAL SKILLS:
Frontend: Angular 18, React 19, JavaScript, HTML5, CSS3, TypeScript, Next.js, Tailwind CSS
Backend: Java, Spring Boot, ASP.NET Core, Python, C/C++, PHP, Node.js
Database: PostgreSQL, MySQL, MongoDB, Oracle
Cloud & Tools: AWS, Docker, Linux, Android Studio, Git, Kafka, Redis

PROJECTS:
1. Movie Booking & Revenue Management System - Angular 18, ASP.NET Core with SQL Server
2. Product Management System - Spring Boot, Java 17, PostgreSQL with FIFO Stock Logic
3. APK Elite Services - Full-Stack Freelance Platform with SEO and Server-Side Rendering
4. Cloud-Native Microservices E-Commerce Gateway - Kafka, Docker, Next.js, Microservices
5. Real-Time Collaborative Code & Chat Engine - React 19, WebSockets, Redis for real-time sync

WORK EXPERIENCE:
- Full Stack Developer at APK Elite Services (Freelance)
- Website Developer at Tipco Engineering (Jul 2026 - Aug 2026)
- Full Stack Developer Intern at SetTribe (Feb 2024 - Nov 2024)

CONTACT:
- Email: shubhammisra800@gmail.com
- WhatsApp: +91 9322887529
- LinkedIn: linkedin.com/in/shubham-kumar
- GitHub: github.com/shubham-2011
- 0 Days Notice - Immediately Available
- Willing to relocate

When answering questions:
1. Be helpful and friendly
2. Provide accurate information from the portfolio
3. If asked about capabilities, explain them clearly
4. If asked for contact information, provide all available channels
5. Be professional but conversational
6. If you don't know something about Shubham, say so instead of guessing`;

export interface GeminiResponse {
  answer: string;
  success: boolean;
  error?: string;
}

/**
 * Generate a response using Gemini API with portfolio context
 */
export async function generateGeminiResponse(userMessage: string): Promise<GeminiResponse> {
  try {
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini API not configured',
        answer: '',
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const fullPrompt = `${PORTFOLIO_CONTEXT}

User Query: ${userMessage}

Please provide a helpful, friendly response about Shubham's portfolio or experience. 
Keep responses concise (2-3 paragraphs max) unless asked for detailed information.
Use markdown formatting for better readability.`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    return {
      success: true,
      answer: text,
    };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate response',
      answer: '',
    };
  }
}

/**
 * Generate streaming response from Gemini API
 */
export async function generateGeminiResponseStream(userMessage: string) {
  try {
    if (!genAI) {
      throw new Error('Gemini API not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const fullPrompt = `${PORTFOLIO_CONTEXT}

User Query: ${userMessage}

Please provide a helpful, friendly response about Shubham's portfolio or experience. 
Keep responses concise (2-3 paragraphs max) unless asked for detailed information.
Use markdown formatting for better readability.`;

    const stream = await model.generateContentStream(fullPrompt);

    return stream;
  } catch (error: any) {
    console.error('Gemini Stream API error:', error);
    throw error;
  }
}

/**
 * Check if Gemini API is available
 */
export function isGeminiAvailable(): boolean {
  return !!API_KEY && !!genAI;
}
