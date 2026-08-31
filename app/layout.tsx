import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AppTuario | Gestión actuarial',
  description: 'Organiza expedientes, rutas, diligencias y razones actuariales en un solo lugar.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
