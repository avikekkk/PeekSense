import type { Metadata, Viewport } from 'next';
import { DM_Sans, Gloock } from 'next/font/google';
import Script from 'next/script';
import '../css/base.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

const gloock = Gloock({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-gloock',
});

export const metadata: Metadata = {
  title: 'PeekSense',
  description: 'An elastic, scroll-smoothed image grid showcasing PeekSense.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${gloock.variable}`}>
      <body>
        <Script src="/js/gsap.min.js" strategy="beforeInteractive" />
        <Script src="/js/ScrollTrigger.min.js" strategy="beforeInteractive" />
        <Script src="/js/ScrollSmoother.min.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
