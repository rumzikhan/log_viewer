/**
 * Used in the fetchAndStreamNDJSON function to flush the buffer and update the state
 * 
 * @param buffer {React.RefObject<Array<T>>} - Buffer that keeps a list of items to be processed
 * @param setStateCallback {React.Dispatch<React.SetStateAction<Array<T>>} - State update callback
 */
function _flushBuffer<T>(
  buffer: React.RefObject<Array<T>>,
  setStateCallback: React.Dispatch<React.SetStateAction<Array<T>>>
) {
  setStateCallback((prevArr) => [...prevArr, ...buffer.current]);
  buffer.current = [];
}

/**
 * This function does the following:
 * 1. Fetches an NDJSON file from a URL
 * 2. Streams the NDJSON file and processes it line by line using the response body reader
 * 3. Decodes the data in chunks and processes the data
 * 4. Immediately loads the first immediatelyLoadNumItems items and then batches the rest
 * 5. Batches the data processing on the streamingDelay frequency
 * 6. Cleans up the interval after the stream is done
 * 7. Manually flushes the buffer one last time to ensure all data is processed
 * 
 * @param url {string}
 *  - URL to fetch the NDJSON file
 * @param buffer {React.RefObject<Array<T>>} 
 *  - Buffer that keeps a list of items to be processed
 * @param streamingIntervalRef {React.RefObject<NodeJS.Timeout | null>} 
 *  - Ref to the streaming interval, used to keep track of if there is a running interval
 *    for processing the buffer and for cleaning up the interval after the stream is done
 * @param setStateCallback {React.Dispatch<React.SetStateAction<Array<T>>} 
 *  - State update callback of handling streamed data processing
 * @param streamingDelay {number} 
 *  - Delay in milliseconds to batch update the state. The higher the delay, the less
 *    state updates and better performance, but the longer it takes to see the data
 * @param immediatelyLoadNumItems {number} 
 *  - Number of items to immediately load, the rest will be batch updated based on the
 *    streamingDelay. This is a UX improvement to prioritize TTFB & rendering performance
 * @returns {Promise<void>} 
 *  - Promise that resolves when the stream is done processing. Nothing is returned.
 */
export async function fetchAndStreamNDJSON<T>(
  url: string,
  buffer: React.RefObject<Array<T>>,
  streamingIntervalRef: React.RefObject<NodeJS.Timeout | null>,
  setStateCallback: React.Dispatch<React.SetStateAction<Array<T>>>,
  streamingDelay: number = 100,
  immediatelyLoadNumItems: number = 20
): Promise<void> {
  // Fetch the NDJSON file from the input URL
  let response: Response;
  try {
    response = await fetch(url);
  } catch (e) {
    console.error("Failed to fetch the NDJSON file:", e);
    return;
  }

  // Error handle the response
  if (!response?.ok) {
    console.error("Failed to fetch the NDJSON file:", response.statusText);
    return;
  }

  // Get the reader from the response body, we use the reader to perform streaming
  const reader = response.body?.getReader();

  // Error handle the reader
  if (!reader) {
    console.error("Failed to get a reader from the response body.");
    return;
  }

  // The stream will send data over encoved in Uint8Array, we need to decode it
  const textDecoder = new TextDecoder();

  // Buffer will hold chunk data being processed, but also hold carryover data that
  // wasn't completely processed in the last chunk
  let decoderBuffer = "";

  // As a UX improvement, we will only show the first immediatelyLoadNumItems logs immediately
  // and then batch update the state every second after that to prioritize
  // TTFB & rendering performance
  let itemCount = 0;

  // Process the reader stream until the done flag is set to true
  while (true) {
    try {
      const { done, value } = await reader.read();

      // If the stream is done, break out of the loop
      if (done) break;

      // Convert the Uint8Array value into a string
      const chunk = textDecoder.decode(value, { stream: true });

      // Append to buffer for processing
      decoderBuffer += chunk;

      // Process each line in the buffer
      let lines = decoderBuffer.split("\n");

      // The last line in the buffer may be incomplete, so we pop it off
      // and save it for the next chunk. If the last line was complete then the end of
      // lines will be an empty string
      decoderBuffer = lines.pop() || "";


      for (const line of lines) {
        if (line.trim()) {
          try {
            const json = JSON.parse(line);
            if (itemCount < immediatelyLoadNumItems) {
              setStateCallback((prevArr) => [...prevArr, json]);
              itemCount++;
            } else {
              buffer.current.push(json);
            }
          } catch (err) {
            console.error("Invalid JSON:", line);
          }
        }
      }

      // Create an interval to process the buffer based on the input streamingDelay
      // This performance improvement reduces the number of state updates and
      // improves overall UX. We create the interval in the while loop while processing
      // the stream to ensure the interval is only created when streaming is active
      // We cleanup the interval after the stream is done
      if (!streamingIntervalRef.current) {
        streamingIntervalRef.current = setInterval(
          () => _flushBuffer(buffer, setStateCallback),
          streamingDelay
        );
      }
    } catch (e) {
      console.error("Failed to read the stream:", e);
      break;
    }
  }

  // Process any remaining data in the decoderBuffer and add it to the buffer for processing
  if (decoderBuffer.trim()) {
    try {
      const json = JSON.parse(decoderBuffer);
      buffer.current.push(json);
    } catch (err) {
      console.error("Invalid JSON:", decoderBuffer);
    }
  }

  // Clear the interval now that the stream is complete
  if (streamingIntervalRef.current) {
    clearInterval(streamingIntervalRef.current);
    streamingIntervalRef.current = null;
  }

  // Manually flush the buffer one last time to ensure all data is processed
  if (buffer.current.length) {
    _flushBuffer(buffer, setStateCallback);
  }
}