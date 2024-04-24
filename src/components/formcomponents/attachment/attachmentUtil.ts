export function convertMBToBytes(mb: number): number {
  if (typeof mb !== 'number' || isNaN(mb)) {
    throw new Error('Input must be a valid number.');
  }
  if (mb < 0) {
    throw new Error('Input cannot be a negative number.');
  }
  if (!isFinite(mb)) {
    throw new Error('Input must be a finite number.');
  }
  return Math.round(mb * 1024 * 1024);
}

export function convertBytesToMBString(bytes: number, precision: number = 0): string {
  if (typeof bytes !== 'number' || isNaN(bytes)) {
    throw new Error('Input must be a valid number.');
  }
  if (bytes < 0) {
    throw new Error('Input cannot be a negative number.');
  }
  if (!isFinite(bytes)) {
    throw new Error('Input must be a finite number.');
  }
  return (bytes / 1024 / 1024).toFixed(precision);
}

export function convertBytesToMB(bytes: number): number {
  if (typeof bytes !== 'number' || isNaN(bytes)) {
    throw new Error('Input must be a valid number.');
  }
  if (bytes < 0) {
    throw new Error('Input cannot be a negative number.');
  }
  if (!isFinite(bytes)) {
    throw new Error('Input must be a finite number.');
  }
  return bytes / 1024 / 1024;
}

export const getFileExtension = (filename: string) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};
