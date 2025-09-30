import { Open_Sans as FontSans, Manrope } from 'next/font/google'
import localFont from 'next/font/local'

export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const unlock = localFont({
  src: [
    {
      path: '../app/assets/unlock_bold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../app/assets/unlock_condensed.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../app/assets/unlock_medium.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../app/assets/unlock_regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--unlock',
  display: 'swap',
})
