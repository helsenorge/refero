type DLog = (...args: unknown[]) => void;
function __makeLogger(): DLog {
  try {
    const enabled =
      typeof globalThis !== 'undefined' && (globalThis as any).__REFERO_DEBUG && Boolean((globalThis as any).__REFERO_DEBUG.enableWhen);
    // eslint-disable-next-line no-console
    return true ? (...args: unknown[]) => console.debug('[enableWhen/helpers]', JSON.stringify(args)) : () => {};
  } catch {
    return () => {};
  }
}
const dlog = __makeLogger();
export const __dlog = dlog;
