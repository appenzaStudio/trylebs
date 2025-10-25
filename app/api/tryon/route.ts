import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@gradio/client';

export const maxDuration = 120; // Maximum duration for serverless function (increased from 60s)

interface GradioResponse {
  data: unknown;
}

// Retry helper function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms delay...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const personImage = formData.get('person') as File;
    const clothingImage = formData.get('clothing') as File;

    if (!personImage || !clothingImage) {
      return NextResponse.json(
        { error: 'Both person and clothing images are required' },
        { status: 400 }
      );
    }

    // Convert files to the format expected by Gradio
    const personBuffer = await personImage.arrayBuffer();
    const clothingBuffer = await clothingImage.arrayBuffer();

    const personBlob = new Blob([personBuffer], { type: personImage.type });
    const clothingBlob = new Blob([clothingBuffer], { type: clothingImage.type });

    console.log(`Processing try-on request - Person: ${personImage.size} bytes, Clothing: ${clothingImage.size} bytes`);

    // Initialize Gradio client with retry logic
    const client = await retryWithBackoff(
      async () => {
        console.log('Connecting to Kolors Virtual Try-On service...');
        return await Client.connect("Kwai-Kolors/Kolors-Virtual-Try-On");
      },
      3,
      2000
    );

    // Call the predict method with the images and retry logic
    const result = await retryWithBackoff(
      async () => {
        console.log('Sending images to AI model for processing...');
        return await client.predict("/tryon", {
          person_img: personBlob,
          garment_img: clothingBlob,
        }) as GradioResponse;
      },
      2,
      3000
    );

    // Extract the result image URL
    if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
      const resultImageUrl = result.data[0];

      // Fetch the result image and convert to base64 with retry
      const imageResponse = await retryWithBackoff(
        async () => {
          console.log('Fetching generated image...');
          return await fetch(resultImageUrl as string);
        },
        3,
        1000
      );

      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const mimeType = imageResponse.headers.get('content-type') || 'image/png';

      const processingTime = Date.now() - startTime;
      console.log(`Try-on completed successfully in ${processingTime}ms`);

      return NextResponse.json({
        success: true,
        image: `data:${mimeType};base64,${base64Image}`,
        processingTime,
      });
    }

    return NextResponse.json(
      {
        error: 'No result generated',
        message: 'The AI service did not return a valid image. Please try again.'
      },
      { status: 500 }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`Virtual try-on error after ${processingTime}ms:`, error);

    // Provide more specific error messages
    let errorMessage = 'Failed to process virtual try-on. Please try again.';
    let errorType = 'unknown';

    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        errorMessage = 'The AI service is taking longer than expected. Please try again with a smaller image or wait a moment.';
        errorType = 'timeout';
      } else if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Unable to connect to the AI service. It may be temporarily unavailable.';
        errorType = 'connection';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Failed to retrieve the generated image. Please try again.';
        errorType = 'fetch';
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        errorType,
        details: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
      },
      { status: 500 }
    );
  }
}
