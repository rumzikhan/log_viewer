import { fetchAndStreamNDJSON } from "../../shared/utils";

describe("fetchAndStreamNDJSON", () => {
  let buffer: React.RefObject<Array<any>>;
  let streamingIntervalRef: React.RefObject<NodeJS.Timeout | null>;
  let setStateCallback: jest.Mock;
  let mockFetch: jest.Mock;
  let mockTextEncoder: jest.Mock;
  let mockTextDecoder: jest.Mock;

  beforeEach(() => {
    buffer = { current: [] };
    streamingIntervalRef = { current: null };
    setStateCallback = jest.fn();
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    // Mock TextEncoder
    mockTextEncoder = jest.fn().mockImplementation(() => ({
      encode: jest.fn(
        (input: string) => new Uint8Array(Buffer.from(input, "utf-8"))
      ),
    }));
    global.TextEncoder = mockTextEncoder as any;

    // Mock TextDecoder
    mockTextDecoder = jest.fn().mockImplementation(() => ({
      decode: jest.fn((input: Uint8Array) =>
        Buffer.from(input).toString("utf-8")
      ),
    }));
    global.TextDecoder = mockTextDecoder as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch and process NDJSON data correctly", async () => {
    const mockResponse = {
      body: {
        getReader: () => ({
          read: jest
            .fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode(
                '{"key": "value1"}\n{"key": "value2"}\n'
              ),
            })
            .mockResolvedValueOnce({ done: true, value: null }),
        }),
      },
      ok: true,
    };
    mockFetch.mockResolvedValue(mockResponse);

    await fetchAndStreamNDJSON(
      "http://example.com",
      buffer,
      streamingIntervalRef,
      setStateCallback,
      100,
      1
    );

    expect(mockTextEncoder).toHaveBeenCalledTimes(1);
    expect(mockTextDecoder).toHaveBeenCalledTimes(1);

    expect(setStateCallback).toHaveBeenCalledTimes(2);
    expect(setStateCallback).toHaveBeenCalledWith(expect.any(Function));
    expect(buffer.current).toEqual([]);
    expect(streamingIntervalRef.current).toBeNull();
  });

  it("should handle fetch errors gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    await fetchAndStreamNDJSON(
      "http://example.com",
      buffer,
      streamingIntervalRef,
      setStateCallback
    );


    expect(mockTextEncoder).not.toHaveBeenCalled();
    expect(mockTextDecoder).not.toHaveBeenCalled();

    expect(setStateCallback).not.toHaveBeenCalled();
    expect(buffer.current).toEqual([]);
  });

  it("should handle invalid JSON gracefully", async () => {
    const mockResponse = {
      body: {
        getReader: () => ({
          read: jest
            .fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('{"key": "value1"}\nINVALID_JSON\n'),
            })
            .mockResolvedValueOnce({ done: true, value: null }),
        }),
      },
      ok: true,
    };
    mockFetch.mockResolvedValue(mockResponse);

    await fetchAndStreamNDJSON(
      "http://example.com",
      buffer,
      streamingIntervalRef,
      setStateCallback
    );


    expect(mockTextEncoder).toHaveBeenCalledTimes(1);
    expect(mockTextDecoder).toHaveBeenCalledTimes(1);

    expect(setStateCallback).toHaveBeenCalledTimes(1);
    expect(buffer.current).toEqual([]);
    expect(streamingIntervalRef.current).toBeNull();
  });
});