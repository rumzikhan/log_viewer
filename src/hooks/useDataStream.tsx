import { useEffect, useRef, useState } from "react";
import { fetchAndStreamNDJSON } from "../shared/utils";

// Custom hook to fetch and stream NDJSON data
export function useDataStream<T>(
  url: string,
  streamingDelay: number = 1000,
  immediatelyLoadNumItems: number = 20
) {
  const [data, setData] = useState<Array<T>>([]);
  const dataBuffer = useRef<Array<T>>([]);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchAndStreamNDJSON(
      url,
      dataBuffer,
      streamingIntervalRef,
      setData,
      streamingDelay,
      immediatelyLoadNumItems
    );
  }, [immediatelyLoadNumItems, streamingDelay, url]);

  return { data };
}
