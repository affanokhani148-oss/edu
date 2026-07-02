import './design-tokens.css';
import './globals.css';
import Link from 'next/link';
import { prisma } from '../lib/prisma';
import NavClient from '../components/NavClient';
import FooterClient from '../components/FooterClient';
import SecurityEnforcer from '../components/SecurityEnforcer';

export const metadata = {
  title: 'EduPro — Premium Study Community',
  description: 'Daily editorials, GRE words, idioms, pair of words, essay notes & daily quizzes.',
};

export const revalidate = 60; // Revalidate settings every 60 seconds to allow static build of _not-found

export default async function RootLayout({ children }) {
  let settings = [];
  try {
    settings = await prisma.siteSetting.findMany();
  } catch (error) {
    console.warn("Could not fetch site settings during build phase.");
  }
  const s = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

  const dynamicCss = `
    :root {
      ${s.colorPrimary ? `--color-primary: ${s.colorPrimary};` : ''}
      ${s.bgPrimary ? `--color-background: ${s.bgPrimary};` : ''}
      ${s.bgSecondary ? `--color-hover: ${s.bgSecondary};` : ''}
    }
  `;

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,400&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet" />
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000" crossOrigin="anonymous"></script>
        <style dangerouslySetInnerHTML={{ __html: dynamicCss }} />
        {s.customHeadHtml ? <div dangerouslySetInnerHTML={{ __html: s.customHeadHtml }} /> : null}
      </head>
      <body>
        <SecurityEnforcer />
        {s.customBodyHtml ? <div dangerouslySetInnerHTML={{ __html: s.customBodyHtml }} style={{ display: 'none' }} /> : null}
        <NavClient />
        <div className="container main-content">
          {children}
        </div>
        <FooterClient settings={s} />
      </body>
    </html>
  );
}
