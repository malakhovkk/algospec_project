import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AlgoSpec - Подготовка к интервью по алгоритмам',
  description: 'Отточите навыки программирования перед важным интервью. 100 задач для интервью, 30+ часов объяснений, решения на 4 языках программирования.',
  keywords: 'алгоритмы, программирование, интервью, подготовка, задачи, JavaScript, Python, C++, Java',
  authors: [{ name: 'AlgoSpec' }],
  openGraph: {
    title: 'AlgoSpec - Подготовка к интервью по алгоритмам',
    description: 'Отточите навыки программирования перед важным интервью',
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlgoSpec - Подготовка к интервью по алгоритмам',
    description: 'Отточите навыки программирования перед важным интервью',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

