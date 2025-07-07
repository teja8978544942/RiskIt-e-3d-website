
'use server';

import { z } from 'zod';
import { Resend } from 'resend';

const toEmail = process.env.FORM_TO_EMAIL;
// This address must be a verified domain in your Resend account.
// For testing, you can use 'onboarding@resend.dev' but this is rate-limited.
const fromEmail = 'onboarding@resend.dev'; 

// Define the schema for the feedback form
const feedbackSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

// Define the schema for the newsletter form
const newsletterSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

interface FormState {
  message: string;
  type: 'success' | 'error' | null;
}

export async function submitFeedback(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || !toEmail) {
    console.error('Missing environment variables for Resend.');
    return {
      message: 'Server configuration error. Cannot send feedback.',
      type: 'error',
    };
  }
  
  try {
    const validatedFields = feedbackSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    });

    if (!validatedFields.success) {
      return {
        message: validatedFields.error.errors.map((e) => e.message).join(' '),
        type: 'error',
      };
    }

    const { name, email, message } = validatedFields.data;

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: 'New Website Feedback Submission',
      html: `
        <h2>New Feedback Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return {
      message: 'Thank you for your afeedback!',
      type: 'success',
    };
  } catch (e) {
    console.error(e);
    return {
      message: 'An unexpected error occurred. Please try again.',
      type: 'error',
    };
  }
}

export async function subscribeToNewsletter(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || !toEmail) {
    console.error('Missing environment variables for Resend.');
    return {
      message: 'Server configuration error. Cannot subscribe.',
      type: 'error',
    };
  }

  try {
    const validatedFields = newsletterSchema.safeParse({
      email: formData.get('email'),
    });

    if (!validatedFields.success) {
      return {
        message: validatedFields.error.errors.map((e) => e.message).join(' '),
        type: 'error',
      };
    }

    const { email } = validatedFields.data;

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: 'New Newsletter Subscription',
      html: `
        <h2>New Subscriber</h2>
        <p>The email address <strong>${email}</strong> has signed up for the newsletter.</p>
      `,
    });

    return {
      message: 'Thanks for subscribing!',
      type: 'success',
    };
  } catch (e) {
    console.error(e);
    return {
      message: 'An unexpected error occurred. Please try again.',
      type: 'error',
    };
  }
}
