import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://apptuario.sickboooooy.chatgpt.site'),
  title: 'AppTuario | Gestión actuarial',
  description: 'Organiza expedientes, rutas, diligencias y razones actuariales en un solo lugar.',
  alternates: {
    canonical: 'https://apptuario.sickboooooy.chatgpt.site',
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://apptuario.sickboooooy.chatgpt.site',
    siteName: 'AppTuario',
    title: 'AppTuario | Gestión actuarial',
    description: 'Gestión actuarial en un solo lugar: expedientes, rutas, diligencias, evidencias y razones.',
    images: [{
      url: 'https://apptuario.sickboooooy.chatgpt.site/og.png',
      width: 1731,
      height: 909,
      alt: 'AppTuario, gestión actuarial en un solo lugar',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AppTuario | Gestión actuarial',
    description: 'Gestión actuarial en un solo lugar: expedientes, rutas, diligencias, evidencias y razones.',
    images: ['https://apptuario.sickboooooy.chatgpt.site/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
