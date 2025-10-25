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
  const requestId = Math.random().toString(36).substring(7);

  console.log(`[${requestId}] ========== NEW TRY-ON REQUEST ==========`);
  console.log(`[${requestId}] Start time: ${new Date(startTime).toISOString()}`);

  try {
    console.log(`[${requestId}] Step 1: Parsing form data...`);
    const formData = await request.formData();
    const personImage = formData.get('person') as File;
    const clothingImage = formData.get('clothing') as File;

    if (!personImage || !clothingImage) {
      console.error(`[${requestId}] ERROR: Missing images - Person: ${!!personImage}, Clothing: ${!!clothingImage}`);
      return NextResponse.json(
        { error: 'Both person and clothing images are required' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Step 2: Images received`);
    console.log(`[${requestId}]   - Person image: ${personImage.name} (${personImage.size} bytes, ${personImage.type})`);
    console.log(`[${requestId}]   - Clothing image: ${clothingImage.name} (${clothingImage.size} bytes, ${clothingImage.type})`);

    // Convert files to the format expected by Gradio
    console.log(`[${requestId}] Step 3: Converting images to ArrayBuffer...`);
    const personBuffer = await personImage.arrayBuffer();
    const clothingBuffer = await clothingImage.arrayBuffer();

    console.log(`[${requestId}] Step 4: Creating Blobs...`);
    const personBlob = new Blob([personBuffer], { type: personImage.type });
    const clothingBlob = new Blob([clothingBuffer], { type: clothingImage.type });
    console.log(`[${requestId}]   - Person blob: ${personBlob.size} bytes`);
    console.log(`[${requestId}]   - Clothing blob: ${clothingBlob.size} bytes`);

    // Initialize Gradio client with retry logic
    console.log(`[${requestId}] Step 5: Connecting to Gradio service...`);
    const connectStart = Date.now();
    const client = await retryWithBackoff(
      async () => {
        console.log(`[${requestId}]   - Attempting Gradio connection to Kwai-Kolors/Kolors-Virtual-Try-On...`);
        const c = await Client.connect("Kwai-Kolors/Kolors-Virtual-Try-On");
        console.log(`[${requestId}]   - Successfully connected to Gradio`);
        return c;
      },
      3,
      2000
    );
    const connectDuration = Date.now() - connectStart;
    console.log(`[${requestId}] Step 5 completed in ${connectDuration}ms`);

    // Call the predict method with the images and retry logic
    console.log(`[${requestId}] Step 6: Sending images to AI model for processing...`);
    const predictStart = Date.now();
    const result = await retryWithBackoff(
      async () => {
        console.log(`[${requestId}]   - Calling tryon function with all parameters...`);
        // The Kolors Virtual Try-On expects 4 parameters:
        // 1. person_img (image)
        // 2. garment_img (image)
        // 3. seed (number, 0-999999)
        // 4. randomize_seed (boolean)
        const res = await client.predict("/tryon", [
          personBlob,      // Parameter 1: person_img
          clothingBlob,    // Parameter 2: garment_img
          42,              // Parameter 3: seed (fixed seed for consistency)
          false            // Parameter 4: randomize_seed (false to use fixed seed)
        ]) as GradioResponse;
        console.log(`[${requestId}]   - Prediction completed successfully`);
        console.log(`[${requestId}]   - Response data structure:`, JSON.stringify(res, null, 2));
        return res;
      },
      2,
      3000
    );
    const predictDuration = Date.now() - predictStart;
    console.log(`[${requestId}] Step 6 completed in ${predictDuration}ms`);

    // Extract the result image URL
    console.log(`[${requestId}] Step 7: Extracting result image URL...`);
    if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
      const resultImageUrl = result.data[0];
      console.log(`[${requestId}]   - Result URL: ${resultImageUrl}`);

      // Fetch the result image and convert to base64 with retry
      console.log(`[${requestId}] Step 8: Fetching generated image...`);
      const fetchStart = Date.now();
      const imageResponse = await retryWithBackoff(
        async () => {
          console.log(`[${requestId}]   - Downloading image from: ${resultImageUrl}`);
          const resp = await fetch(resultImageUrl as string);
          console.log(`[${requestId}]   - Image fetch status: ${resp.status}`);
          return resp;
        },
        3,
        1000
      );
      const fetchDuration = Date.now() - fetchStart;
      console.log(`[${requestId}] Step 8 completed in ${fetchDuration}ms`);

      console.log(`[${requestId}] Step 9: Converting to base64...`);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const mimeType = imageResponse.headers.get('content-type') || 'image/png';
      console.log(`[${requestId}]   - Image size: ${imageBuffer.byteLength} bytes`);
      console.log(`[${requestId}]   - MIME type: ${mimeType}`);

      const processingTime = Date.now() - startTime;
      console.log(`[${requestId}] ========== SUCCESS ==========`);
      console.log(`[${requestId}] Total processing time: ${processingTime}ms`);
      console.log(`[${requestId}]   - Connect: ${connectDuration}ms`);
      console.log(`[${requestId}]   - Predict: ${predictDuration}ms`);
      console.log(`[${requestId}]   - Fetch: ${fetchDuration}ms`);

      return NextResponse.json({
        success: true,
        image: `data:${mimeType};base64,${base64Image}`,
        processingTime,
      });
    }

    console.error(`[${requestId}] ========== FAILURE: No result data ==========`);
    console.error(`[${requestId}] Result object:`, JSON.stringify(result, null, 2));
    return NextResponse.json(
      {
        error: 'No result generated',
        message: 'The AI service did not return a valid image. Please try again.'
      },
      { status: 500 }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] ========== ERROR ==========`);
    console.error(`[${requestId}] Total time before error: ${processingTime}ms`);
    console.error(`[${requestId}] Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
    console.error(`[${requestId}] Error message: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`[${requestId}] Stack trace:`, error instanceof Error ? error.stack : 'No stack trace');

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
