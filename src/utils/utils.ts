export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]; // create a copy to avoid mutating the original
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]; // swap elements
  }
  return result;
}

export function decodeMessageBody(message: any): string {
  if (message.isBinaryBody && message._binaryBody) {
    const byteArray = Object.values(message._binaryBody) as number[];
    const uint8Arr = new Uint8Array(byteArray);
    return new TextDecoder('utf-8').decode(uint8Arr);
  } else if (typeof message.body === 'string') {
    return message.body;
  } else {
    console.warn('Unknown message format:', message);
    return '';
  }
}
