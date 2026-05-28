export async function isWebGpuAvailable(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.gpu) return false;
  try {
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    return adapter !== null;
  } catch {
    return false;
  }
}
