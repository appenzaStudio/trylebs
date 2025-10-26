import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // Maximum duration for serverless function (increased from 60s)

const GRADIO_API_URL = 'https://kwai-kolors-kolors-virtual-try-on.hf.space';

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

    // Step 1: Upload images to Gradio
    console.log(`[${requestId}] Step 3: Uploading images to Gradio...`);
    const uploadFormData = new FormData();
    uploadFormData.append('files', personImage);
    uploadFormData.append('files', clothingImage);

    const uploadResponse = await retryWithBackoff(
      async () => {
        console.log(`[${requestId}]   - Uploading to ${GRADIO_API_URL}/upload...`);
        const resp = await fetch(`${GRADIO_API_URL}/upload`, {
          method: 'POST',
          body: uploadFormData,
        });

        if (!resp.ok) {
          throw new Error(`Upload failed with status ${resp.status}`);
        }

        const data = await resp.json();
        console.log(`[${requestId}]   - Upload response:`, JSON.stringify(data, null, 2));
        return data as string[]; // Returns array of uploaded file paths
      },
      3,
      2000
    );

    if (!uploadResponse || uploadResponse.length < 2) {
      throw new Error('Failed to upload images');
    }

    const personImagePath = uploadResponse[0];
    const clothingImagePath = uploadResponse[1];
    console.log(`[${requestId}]   - Person image path: ${personImagePath}`);
    console.log(`[${requestId}]   - Clothing image path: ${clothingImagePath}`);

    // Step 2: Join the queue
    console.log(`[${requestId}] Step 4: Joining processing queue...`);
    const sessionHash = `session_${requestId}_${Date.now()}`;
    const fnIndex = 0; // The try-on function index

    const queueJoinResponse = await retryWithBackoff(
      async () => {
        console.log(`[${requestId}]   - Sending queue join request...`);

        // Try simple string paths first (simpler spaces expect this)
        const requestDataSimple = {
          data: [
            personImagePath,      // Just the path string
            clothingImagePath,    // Just the path string
            42,                   // Parameter 3: seed
            false                 // Parameter 4: randomize_seed
          ],
          event_data: null,
          fn_index: fnIndex,
          session_hash: sessionHash,
        };

        console.log(`[${requestId}]   - Request data (simple paths):`, JSON.stringify(requestDataSimple, null, 2));

        const resp = await fetch(`${GRADIO_API_URL}/queue/join?`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestDataSimple),
        });

        if (!resp.ok) {
          throw new Error(`Queue join failed with status ${resp.status}`);
        }

        const data = await resp.json();
        console.log(`[${requestId}]   - Queue join response:`, JSON.stringify(data, null, 2));
        return data;
      },
      2,
      3000
    );

    const eventId = queueJoinResponse.event_id;
    console.log(`[${requestId}]   - Joined queue with event_id: ${eventId}`);

    // Step 3: Poll the queue for results
    console.log(`[${requestId}] Step 5: Polling for processing results...`);
    const queueDataUrl = `${GRADIO_API_URL}/queue/data?session_hash=${sessionHash}`;
    console.log(`[${requestId}]   - Polling URL: ${queueDataUrl}`);

    const resultImageUrl = await new Promise<string>(async (resolve, reject) => {
      const maxAttempts = 60; // Poll for up to 60 attempts (60 seconds with 1 second intervals)
      let attempts = 0;

      const pollQueue = async () => {
        attempts++;

        if (attempts > maxAttempts) {
          reject(new Error('Queue processing timeout after 60 seconds'));
          return;
        }

        try {
          console.log(`[${requestId}]   - Poll attempt ${attempts}/${maxAttempts}...`);
          const response = await fetch(queueDataUrl, {
            headers: {
              'Accept': 'text/event-stream',
            },
          });

          if (!response.ok) {
            throw new Error(`Queue polling failed with status ${response.status}`);
          }

          const text = await response.text();
          console.log(`[${requestId}]   - Raw SSE response (first 500 chars):`, text.substring(0, 500));

          // Parse Server-Sent Events format manually
          const lines = text.split('\n');
          let hasCompletedMessage = false;

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6); // Remove 'data: ' prefix
              try {
                const message = JSON.parse(data);
                console.log(`[${requestId}]   - Queue message:`, message.msg, message.success !== undefined ? `(success: ${message.success})` : '');

                // Log all message types
                if (message.msg === 'heartbeat') {
                  continue; // Skip heartbeat messages
                }

                if (message.msg === 'process_completed') {
                  console.log(`[${requestId}]   - Full completion message:`, JSON.stringify(message, null, 2));

                  // Check for error in output
                  if (message.output && message.output.error) {
                    console.error(`[${requestId}]   - API Error:`, message.output.error);
                    reject(new Error(`API processing failed: ${message.output.error}`));
                    return;
                  }

                  if (message.success && message.output && message.output.data) {
                    console.log(`[${requestId}]   - Output data:`, JSON.stringify(message.output.data, null, 2));

                    // The data could be in different formats
                    const data = message.output.data;

                    // Try different data structures
                    if (Array.isArray(data) && data.length > 0) {
                      const resultData = data[0];

                      // Check if it's an object with url property
                      if (resultData && typeof resultData === 'object' && 'url' in resultData) {
                        console.log(`[${requestId}]   - Process completed! Result URL: ${resultData.url}`);
                        resolve(resultData.url);
                        return;
                      }

                      // Check if it's directly a URL string
                      if (typeof resultData === 'string') {
                        console.log(`[${requestId}]   - Process completed! Result URL: ${resultData}`);
                        resolve(resultData);
                        return;
                      }
                    }
                  }

                  console.error(`[${requestId}]   - Unexpected data format:`, JSON.stringify(message, null, 2));
                  reject(new Error('Processing completed but no result data'));
                  return;
                } else if (message.msg === 'estimation') {
                  console.log(`[${requestId}]   - Queue position: ${message.rank || 'unknown'} / ${message.queue_size || 'unknown'}`);
                } else if (message.msg === 'process_starts') {
                  console.log(`[${requestId}]   - Processing started...`);
                }
              } catch (err) {
                // Ignore parse errors for heartbeat messages
              }
            }
          }

          // Continue polling
          setTimeout(pollQueue, 1000);
        } catch (error) {
          console.error(`[${requestId}]   - Polling error:`, error);
          setTimeout(pollQueue, 1000);
        }
      };

      // Start polling
      pollQueue();
    });

    console.log(`[${requestId}] Step 6: Downloading result image...`);
    const fullImageUrl = resultImageUrl.startsWith('http') ? resultImageUrl : `${GRADIO_API_URL}${resultImageUrl}`;
    console.log(`[${requestId}]   - Full URL: ${fullImageUrl}`);

    const imageResponse = await retryWithBackoff(
      async () => {
        console.log(`[${requestId}]   - Fetching image...`);
        const resp = await fetch(fullImageUrl);
        if (!resp.ok) {
          throw new Error(`Image fetch failed with status ${resp.status}`);
        }
        return resp;
      },
      3,
      1000
    );

    console.log(`[${requestId}] Step 7: Converting to base64...`);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/png';
    console.log(`[${requestId}]   - Image size: ${imageBuffer.byteLength} bytes`);
    console.log(`[${requestId}]   - MIME type: ${mimeType}`);

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
      } else if (error.message.includes('fetch') || error.message.includes('upload')) {
        errorMessage = 'Failed to upload or retrieve images. Please try again.';
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
