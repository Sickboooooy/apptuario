import { afterEach, describe, expect, it, vi } from 'vitest';

function mockEnv(env: Record<string, string | undefined>) {
  vi.doMock('cloudflare:workers', () => ({ env }));
}

describe('POST /api/recipients -- REAL_JUDICIAL_DATA gate (e2e ligero)', () => {
  afterEach(() => {
    vi.doUnmock('cloudflare:workers');
    vi.resetModules();
  });

  it('rejects a free-text natural_person recipient when REAL_JUDICIAL_DATA=false', async () => {
    mockEnv({ REAL_JUDICIAL_DATA: 'false' });
    vi.resetModules();
    const { POST } = await import('./route');

    const request = new Request('https://apptuario.test/api/recipients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientKind: 'natural_person',
        name: 'Juan Pérez',
        addressLine: 'Av. Real 100',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it('rejects a free-text natural_person recipient when REAL_JUDICIAL_DATA is unset (defaults to false)', async () => {
    mockEnv({});
    vi.resetModules();
    const { POST } = await import('./route');

    const request = new Request('https://apptuario.test/api/recipients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientKind: 'natural_person',
        name: 'Juan Pérez',
        addressLine: 'Av. Real 100',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it('accepts a synthetic-dataset selection when REAL_JUDICIAL_DATA=false', async () => {
    mockEnv({ REAL_JUDICIAL_DATA: 'false' });
    vi.resetModules();
    const { POST } = await import('./route');
    const { SYNTHETIC_NATURAL_PERSON_RECIPIENTS } = await import(
      '@/lib/synthetic-recipients'
    );

    const request = new Request('https://apptuario.test/api/recipients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientKind: 'natural_person',
        syntheticId: SYNTHETIC_NATURAL_PERSON_RECIPIENTS[0].id,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(202);
  });

  it('accepts a free-text natural_person recipient when REAL_JUDICIAL_DATA=true', async () => {
    mockEnv({ REAL_JUDICIAL_DATA: 'true' });
    vi.resetModules();
    const { POST } = await import('./route');

    const request = new Request('https://apptuario.test/api/recipients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientKind: 'natural_person',
        name: 'Juan Pérez',
        addressLine: 'Av. Real 100',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(202);
  });
});
