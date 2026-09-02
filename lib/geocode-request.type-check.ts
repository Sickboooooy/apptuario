import { requestGeocode } from './geocode-request';

// Compile-only fixture, never executed at runtime (see the unused wrapper
// below). Proves GeocodeRequestBody is a closed type: a call that tries to
// smuggle a `nombre` field must fail to compile. If the type ever loosens
// enough to allow this, `@ts-expect-error` itself becomes a tsc error
// ("Unused '@ts-expect-error' directive"), so `tsc --noEmit` catches the
// regression instead of silently letting it through.
function neverCalled() {
  // @ts-expect-error -- 'nombre' is not part of GeocodeRequestBody
  void requestGeocode({ query: 'Av. Reforma 100', nombre: 'Juan Pérez' });
}
void neverCalled;
