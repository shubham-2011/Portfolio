import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { saveContactToPostgres } from '@/lib/postgres';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required fields.' },
        { status: 400 }
      );
    }

    const contactPayload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };

    let savedToPostgres = false;
    let savedToMongo = false;

    // 1. Store into PostgreSQL (Neon Tech Database)
    try {
      await saveContactToPostgres(contactPayload);
      savedToPostgres = true;
    } catch (pgError) {
      console.error('PostgreSQL storage error:', pgError);
    }

    // 2. Store into MongoDB (if MONGODB_URI is provided)
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        await Contact.create(contactPayload);
        savedToMongo = true;
      } catch (mongoError) {
        console.error('MongoDB storage warning:', mongoError);
      }
    }

    // 3. Deliver email notification to shubhammisra800@gmail.com via FormSubmit
    let emailDelivered = false;
    try {
      const emailResponse = await fetch(
        'https://formsubmit.co/ajax/shubhammisra800@gmail.com',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: contactPayload.name,
            email: contactPayload.email,
            phone: contactPayload.phone,
            subject: contactPayload.subject,
            _subject: `New Portfolio Message from ${contactPayload.name}: ${contactPayload.subject}`,
            message: contactPayload.message,
            _replyto: contactPayload.email,
            _template: 'table',
            _captcha: 'false',
          }),
        }
      );

      emailDelivered = emailResponse.ok;
    } catch (emailError) {
      console.error('Email dispatch warning:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been stored and delivered successfully.',
        savedToPostgres,
        savedToMongo,
        emailDelivered,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Contact API handler error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing contact submission.' },
      { status: 500 }
    );
  }
}
