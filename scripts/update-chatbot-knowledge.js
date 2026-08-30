const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const envPath = path.join(__dirname, '..', '.env.local');
  let connectionString = process.env.POSTGRES_URL;

  if (!connectionString && fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      if (line.startsWith('POSTGRES_URL=')) {
        connectionString = line.substring('POSTGRES_URL='.length).trim().replace(/^["']|["']$/g, '');
        break;
      }
    }
  }

  if (!connectionString) {
    console.error('POSTGRES_URL not found');
    return;
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const expAnswer = `Shubham Kumar has extensive full-stack engineering experience across the following companies and roles:

1. **APK Elite Services** — Freelance Full Stack Software Developer (2024 - Present)
   • Engineered scalable Spring Boot microservices, high-speed PostgreSQL databases, and modern Angular and React frontends.
   • Handled end-to-end SDLC, REST API security, and client production deployments.

2. **Tipco Engineering** — Website Developer (Jul 2026 - Aug 2026)
   • Engineered scalable microservices and intuitive user interfaces.
   • Collaborated actively with cross-functional agile teams and optimized production database performance.

3. **SetTribe** — Full Stack Developer Intern (Feb 2024 - Nov 2024)
   • Contributed to customer-facing web applications and engineered reusable UI components.
   • Developed and consumed RESTful APIs and collaborated in agile sprint cycles.`;

  await pool.query('UPDATE portfolio_chatbot_knowledge SET answer = $1 WHERE id = 1;', [expAnswer]);
  console.log('Updated experience Q&A in PostgreSQL!');

  const contactQ = "What is Shubham's contact number / phone / email / WhatsApp?";
  const contactA = `You can contact Shubham Kumar directly:

• **Phone / WhatsApp**: [+91 9322887529](tel:+919322887529)
• **Email**: [shubhammisra800@gmail.com](mailto:shubhammisra800@gmail.com)
• **Location**: Pune, Maharashtra, India
• **LinkedIn**: [linkedin.com/in/shubham-kumar-48b57023b](https://www.linkedin.com/in/shubham-kumar-48b57023b/)
• **Availability**: Immediately Available (0 Days Notice for Full-Time & Freelance opportunities)`;

  const contactKws = [
    'contact', 'contect', 'cntact', 'kontact',
    'phone', 'fone', 'number', 'num', 'mobile', 'mobil', 'mob',
    'call', 'email', 'mail', 'whatsapp', 'watsapp', 'reach', 'hire', 'talk'
  ];

  await pool.query(
    'INSERT INTO portfolio_chatbot_knowledge (question, answer, category, keywords) VALUES ($1, $2, $3, $4);',
    [contactQ, contactA, 'Contact', contactKws]
  );
  console.log('Inserted contact Q&A in PostgreSQL!');

  await pool.end();
}

run().catch(console.error);
