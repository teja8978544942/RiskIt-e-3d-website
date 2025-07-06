'use server';

import { z } from 'zod';

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

    // In a real application, you would save this data to a database.
    console.log('Feedback submitted:', validatedFields.data);

    return {
      message: 'Thank you for your feedback!',
      type: 'success',
    };
  } catch (e) {
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

    // In a real application, you would add this email to your mailing list.
    console.log('Newsletter subscription:', validatedFields.data.email);

    return {
      message: 'Thanks for subscribing!',
      type: 'success',
    };
  } catch (e) {
    return {
      message: 'An unexpected error occurred. Please try again.',
      type: 'error',
    };
  }
}
