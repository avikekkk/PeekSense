import type { Metadata } from 'next';
import Script from 'next/script';
import '../css/base.css';

export const metadata: Metadata = {
  title: 'PeekSense',
  description: 'PeekSense',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="js">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
        />
      </head>
      <body>
        <Script src="/js/gsap.min.js" strategy="beforeInteractive" />
        <Script src="/js/ScrollTrigger.min.js" strategy="beforeInteractive" />
        <Script src="/js/ScrollSmoother.min.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
