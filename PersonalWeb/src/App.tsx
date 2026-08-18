import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { Backdrop } from '@/components/sections/Backdrop'
import { WeatherFX } from '@/components/sections/WeatherFX'
import { Navbar } from '@/components/sections/Navbar'
import { Footer } from '@/components/sections/Footer'
import { ThemePanel } from '@/components/sections/ThemePanel'
import { CompassLoader } from '@/components/animation/CompassLoader'
import { CursorGlow } from '@/components/animation/CursorGlow'
import { AmbientAura } from '@/components/animation/AmbientAura'
import { Home } from '@/pages/Home'
import { Log } from '@/pages/Log'
import { Article } from '@/pages/Article'
import { Archive } from '@/pages/Archive'
import { Chart } from '@/pages/Chart'
import { Wake } from '@/pages/Wake'
import { About } from '@/pages/About'
import { Links } from '@/pages/Links'
import { Bottle } from '@/pages/Bottle'
import { NotFound } from '@/pages/NotFound'

const INTRO_KEY = 'harbor.intro.v1'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="relative min-h-screen">
      <Shell />
    </div>
  )
}

function Shell() {
  const { applyPath } = useTheme()
  const location = useLocation()
  const isAboutRoom = location.pathname === '/about'
  const [intro, setIntro] = useState(() => {
    try {
      return sessionStorage.getItem(INTRO_KEY) !== '1'
    } catch {
      return true
    }
  })

  useEffect(() => {
    applyPath(location.pathname)
  }, [location.pathname, applyPath])

  const finishIntro = () => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      /* ignore */
    }
    setIntro(false)
  }

  return (
    <>
      {!isAboutRoom && <Backdrop />}
      {!isAboutRoom && (
        <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
          <AmbientAura />
        </div>
      )}
      {!isAboutRoom && <WeatherFX />}
      {!isAboutRoom && <CursorGlow />}
      {intro && !isAboutRoom && <CompassLoader onDone={finishIntro} />}
      <Navbar />
      <main className={isAboutRoom ? 'about-main relative z-10' : 'relative z-10 min-h-[70vh]'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/log" element={<Log />} />
          <Route path="/log/category/:cat" element={<Log />} />
          <Route path="/log/archive" element={<Archive />} />
          <Route path="/log/:slug" element={<Article />} />
          <Route path="/chart" element={<Chart />} />
          <Route path="/wake" element={<Wake />} />
          <Route path="/about" element={<About />} />
          <Route path="/about/links" element={<Links />} />
          <Route path="/bottle" element={<Bottle />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAboutRoom && <Footer />}
      {!isAboutRoom && <ThemePanel />}
      <ScrollToTop />
    </>
  )
}
