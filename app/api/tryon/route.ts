import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // Maximum duration for serverless function (increased from 60s)

// Use Replicate API instead of Gradio - it's more reliable
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';

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

    // Convert images to base64 for API submission
    console.log(`[${requestId}] Step 3: Converting images to base64...`);
    const personBuffer = await personImage.arrayBuffer();
    const clothingBuffer = await clothingImage.arrayBuffer();

    const personBase64 = `data:${personImage.type};base64,${Buffer.from(personBuffer).toString('base64')}`;
    const clothingBase64 = `data:${clothingImage.type};base64,${Buffer.from(clothingBuffer).toString('base64')}`;

    console.log(`[${requestId}] Step 4: Calling Replicate API...`);
    console.log(`[${requestId}]   - Using model: yisol/kolors-virtual-try-on`);

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'yisol/kolors-virtual-try-on:latest',
        input: {
          garm_img: clothingBase64,
          human_img: personBase64,
          garment_des: 'clothing',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] ERROR: Replicate API error:`, errorText);

      // Fallback error message
      return NextResponse.json(
        {
          error: 'The AI virtual try-on service is currently unavailable. This feature requires a Replicate API token. Please contact support.',
          errorType: 'service_unavailable',
          details: 'Replicate API configuration required',
          processingTime: Date.now() - startTime,
        },
        { status: 503 }
      );
    }

    const prediction = await response.json();
    console.log(`[${requestId}]   - Prediction created:`, prediction.id);

    // Poll for result
    console.log(`[${requestId}] Step 5: Waiting for result...`);
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60;

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;

      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        },
      });

      result = await pollResponse.json();
      console.log(`[${requestId}]   - Poll attempt ${attempts}/${maxAttempts}: ${result.status}`);
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Processing failed');
    }

    if (result.status !== 'succeeded' || !result.output) {
      throw new Error('Processing timeout or no output');
    }

    console.log(`[${requestId}] Step 6: Downloading result...`);
    const resultImageUrl = Array.isArray(result.output) ? result.output[0] : result.output;

    const imageResponse = await fetch(resultImageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/png';

    const processingTime = Date.now() - startTime;
    console.log(`[${requestId}] ========== SUCCESS ==========`);
    console.log(`[${requestId}] Total processing time: ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      image: `data:${mimeType};base64,${base64Image}`,
      processingTime,
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] ========== ERROR ==========`);
    console.error(`[${requestId}] Total time before error: ${processingTime}ms`);
    console.error(`[${requestId}] Error:`, error);

    return NextResponse.json(
      {
        error: 'Failed to process virtual try-on. The service may be temporarily unavailable.',
        errorType: 'unknown',
        details: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
      },
      { status: 500 }
    );
  }
}
