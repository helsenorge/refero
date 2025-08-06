import workerUrl from './fhir-path.worker.ts?worker&url';

// const baseUrl = import.meta.env.DEV ? import.meta.url.replace('.vite/deps', '@helsenorge/refero') + '' : import.meta.url;

const js = `import ${JSON.stringify(new URL(workerUrl.replace('.vite/deps', '@helsenorge/refero'), import.meta.url))}`;
const blob = new Blob([js], { type: 'application/javascript' });

export function WorkaroundWorker(options: { name: string }): Worker {
  const objURL = URL.createObjectURL(blob);
  const worker = new Worker(objURL, { type: 'module', name: options?.name });
  worker.addEventListener('error', e => {
    // eslint-disable-next-line no-console
    console.error('Worker error:', e);
    URL.revokeObjectURL(objURL);
  });
  return worker;
}
