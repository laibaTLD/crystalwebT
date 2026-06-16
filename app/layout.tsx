import type { Metadata } from 'next'
import './globals.css'
import { WebBuilderProvider } from '@/app/providers/WebBuilderProvider'
import { ErrorBoundary } from '@/app/components/ui/ErrorBoundary'
import { ThemeFontWrapper } from './components/ui/ThemeFontWrapper'
import { LanguageProvider } from '@/app/i18n/LanguageProvider'
import { LenisProvider } from '@/app/components/cinematic/LenisProvider'
import { AmbientFoundation } from '@/app/components/cinematic/AmbientFoundation'
import { HeroIntroProvider } from '@/app/providers/HeroIntroProvider'
import { Header } from '@/app/components/layout/Header'
import { getInitialSiteData } from '@/app/lib/initialSiteData'

export const metadata: Metadata = {
  title: 'Web Builder Site',
  description: 'Generated site using Web Builder',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initialData = await getInitialSiteData()

  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased">
        <ErrorBoundary>
          <WebBuilderProvider initialData={initialData}>
            <LanguageProvider>
              <LenisProvider>
                <AmbientFoundation />
                <HeroIntroProvider>
                  <ThemeFontWrapper>
                    <Header />
                    <main className="relative z-10 min-h-screen pt-[4.75rem] lg:pt-[5.25rem]">
                      {children}
                    </main>
                  </ThemeFontWrapper>
                </HeroIntroProvider>
              </LenisProvider>
            </LanguageProvider>
          </WebBuilderProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
