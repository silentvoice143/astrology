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

export function formatRelativeDate(isoString: string): string {
  const inputDate = new Date(isoString);
  const today = new Date();

  // Normalize both dates to midnight for accurate day difference
  const normalize = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const input = normalize(inputDate);
  const now = normalize(today);

  const diffMs = input.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays >= -6 && diffDays <= -2) {
    // For last 7 days (excluding today & yesterday), show weekday
    return inputDate.toLocaleDateString(undefined, {weekday: 'long'});
  }

  // For other dates, format as dd/mm/yyyy
  const dd = String(inputDate.getDate()).padStart(2, '0');
  const mm = String(inputDate.getMonth() + 1).padStart(2, '0'); // Months start at 0
  const yyyy = inputDate.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function getTimeOnly(
  isoString: string,
  use12Hour: boolean = false,
): string {
  const dateObj = new Date(isoString);
  return dateObj.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: use12Hour,
  });
}

export function getDateOnly(isoString: string): string {
  const datePart = isoString.split('T')[0]; // "yyyy-mm-dd"
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`; // "dd/mm/yyyy"
}
