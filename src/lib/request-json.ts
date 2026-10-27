/** Bound streamed request bytes before JSON parsing (including chunked bodies). */
export async function readJson(request: Request, maxBytes = 16_384): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, 'JSON body required');
  let size = 0; const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new RequestError(413, 'Request body too large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  let body: unknown;
  try { body = JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new RequestError(400, 'Malformed JSON'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new RequestError(400, 'JSON object required');
  return body as Record<string, unknown>;
}
export class RequestError extends Error { constructor(public status: number, message: string) { super(message); } }
