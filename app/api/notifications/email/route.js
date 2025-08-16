import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { createTransport } from 'nodemailer';

export async function POST(request) {
  try {
    const { email, subject, content } = await request.json();

    // Verify authentication token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.split('Bearer ')[1];
    // Only initialize Firebase Admin if we're in a server environment
if (typeof window === 'undefined') {
  initializeFirebaseAdmin();
}
    const auth = getAuth();
    await auth.verifyIdToken(token);

    // Set up email transport
    const transport = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send email
    await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: content,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
