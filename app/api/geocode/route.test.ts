import { describe, expect, it, vi } from 'vitest';

describe('POST /api/geocode -- rejects natural_person recipients (external provider)', () => {
  it('returns 422 when recipientKind is natural_person, before calling any external provider', async () => {
    vi.doMock('cloudflare:workers', () => ({ env: {} }));
    vi.resetModules();

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { POST } = await import('./route');

    const request = new Request('https://apptuario.test/api/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Av. Reforma 100, Guadalajara',
        recipientKind: 'natural_person',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(422);
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
    vi.doUnmock('cloudflare:workers');
    vi.resetModules();
  });

  it('still accepts a plain query with no recipientKind', async () => {
    vi.doMock('cloudflare:workers', () => ({ env: {} }));
    vi.resetModules();

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    const { POST } = await import('./route');

    const request = new Request('https://apptuario.test/api/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Av. Reforma 100, Guadalajara' }),
    });

    const response = await POST(request);

    expect(response.status).not.toBe(422);

    fetchSpy.mockRestore();
    vi.doUnmock('cloudflare:workers');
    vi.resetModules();
  });
});
