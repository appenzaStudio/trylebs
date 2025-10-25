import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@gradio/client';

export const maxDuration = 60; // Maximum duration for serverless function

export async function POST(request: NextRequest) {
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

    // Initialize Gradio client
    const client = await Client.connect("Kwai-Kolors/Kolors-Virtual-Try-On");

    // Call the predict method with the images
    const result = await client.predict("/tryon", {
      person_img: personBlob,
      garment_img: clothingBlob,
    });

    // Extract the result image URL
    if (result && result.data && result.data.length > 0) {
      const resultImageUrl = result.data[0];

      // Fetch the result image and convert to base64
      const imageResponse = await fetch(resultImageUrl as string);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const mimeType = imageResponse.headers.get('content-type') || 'image/png';

      return NextResponse.json({
        success: true,
        image: `data:${mimeType};base64,${base64Image}`,
      });
    }

    return NextResponse.json(
      { error: 'No result generated' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Virtual try-on error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process virtual try-on. The service might be temporarily unavailable.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
