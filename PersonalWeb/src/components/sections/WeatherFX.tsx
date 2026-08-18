import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from '@/hooks/useTheme'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const RAIN_COUNT = 850
const SPLASH_COUNT = 420
const SNOW_COUNT = 520
const FIELD_X = 52
const FIELD_Z = 26
const TOP = 24
const BOTTOM = -7

interface RainDrop {
  x: number
  y: number
  z: number
  speed: number
  phase: number
}

interface Snowflake {
  x: number
  y: number
  z: number
  speed: number
  sway: number
  phase: number
  size: number
  spin: number
}

interface Splash {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  life: number
}

function makeSnowTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.65, 'rgba(255,255,255,0.9)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** 3D 天气粒子层：雨 / 雪（Three.js，全屏覆盖）。鼠标移动产生视角视差，快速甩动产生风，点击触发阵风。 */
export function WeatherFX() {
  const { weather } = useTheme()
  const reduced = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const isRain = weather === 'rain'
    const isSnow = weather === 'snow'
    host.innerHTML = ''
    if ((!isRain && !isSnow) || typeof WebGLRenderingContext === 'undefined') return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 300)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6))
    const canvas = renderer.domElement
    canvas.style.position = 'absolute'
    canvas.style.inset = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    host.appendChild(canvas)

    let W = 1
    let H = 1
    const resize = () => {
      W = host.clientWidth || window.innerWidth
      H = host.clientHeight || window.innerHeight
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    const dummy = new THREE.Object3D()
    const precip = isRain
      ? (() => {
          const geo = new THREE.BoxGeometry(0.05, 0.9, 0.05)
          const mat = new THREE.MeshBasicMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.6, depthWrite: false })
          const mesh = new THREE.InstancedMesh(geo, mat, RAIN_COUNT)
          mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
          const data: RainDrop[] = Array.from({ length: RAIN_COUNT }, () => ({
            x: (Math.random() - 0.5) * FIELD_X,
            y: BOTTOM + Math.random() * (TOP - BOTTOM),
            z: (Math.random() - 0.5) * FIELD_Z,
            speed: 26 + Math.random() * 15,
            phase: Math.random() * Math.PI * 2,
          }))
          return { mesh, data, geo, mat }
        })()
      : (() => {
          const geo = new THREE.PlaneGeometry(0.5, 0.5)
          const mat = new THREE.MeshBasicMaterial({ map: makeSnowTexture(), transparent: true, opacity: 0.92, depthWrite: false })
          const mesh = new THREE.InstancedMesh(geo, mat, SNOW_COUNT)
          mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
          const data: Snowflake[] = Array.from({ length: SNOW_COUNT }, () => ({
            x: (Math.random() - 0.5) * FIELD_X,
            y: BOTTOM + Math.random() * (TOP - BOTTOM),
            z: (Math.random() - 0.5) * FIELD_Z,
            speed: 1.4 + Math.random() * 1.6,
            sway: 0.5 + Math.random() * 1.1,
            phase: Math.random() * Math.PI * 2,
            size: 0.3 + Math.random() * 0.75,
            spin: 0.3 + Math.random() * 1.1,
          }))
          return { mesh, data, geo, mat }
        })()
    scene.add(precip.mesh)

    const splashMesh = isRain
      ? (() => {
          const geo = new THREE.SphereGeometry(0.05, 5, 5)
          const mat = new THREE.MeshBasicMaterial({ color: 0xe6f3ff, transparent: true, opacity: 0.8, depthWrite: false })
          const mesh = new THREE.InstancedMesh(geo, mat, SPLASH_COUNT)
          mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
          const pool: Splash[] = Array.from({ length: SPLASH_COUNT }, () => ({ x: 0, y: -999, z: 0, vx: 0, vy: 0, vz: 0, life: 0 }))
          for (let i = 0; i < SPLASH_COUNT; i++) {
            dummy.position.set(0, -999, 0)
            dummy.scale.set(0.001, 0.001, 0.001)
            dummy.updateMatrix()
            mesh.setMatrixAt(i, dummy.matrix)
          }
          mesh.instanceMatrix.needsUpdate = true
          return { mesh, pool, geo, mat }
        })()
      : null
    if (splashMesh) scene.add(splashMesh.mesh)

    // 风向与镜头视差
    let wind = 0.5
    let windTarget = 0.5
    let lastMX = 0
    let lastT = 0
    let parallaxX = 0
    let parallaxY = 0
    let pxTarget = 0
    let pyTarget = 0

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now()
      const dt = Math.max(now - lastT, 1)
      if (lastT > 0) {
        const vx = (e.clientX - lastMX) / dt
        if (Math.abs(vx) > 0.4) windTarget = clamp(windTarget + vx * 2.4, -15, 15)
      }
      lastMX = e.clientX
      lastT = now
      pxTarget = (e.clientX / W - 0.5) * 4
      pyTarget = (e.clientY / H - 0.5) * 2.6
    }
    const onPointerLeave = () => {
      pxTarget = 0
      pyTarget = 0
    }
    const onPointerDown = () => {
      windTarget = clamp(windTarget + (Math.random() > 0.5 ? 7 : -7), -15, 15)
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)

    let raf = 0
    let prev = performance.now()
    let running = true

    const tick = (now: number) => {
      if (!running) return
      const dt = Math.min((now - prev) / 1000, 0.05)
      prev = now

      // 风：向环境值回弹
      windTarget += (0.5 - windTarget) * Math.min(dt * 0.35, 1)
      wind += (windTarget - wind) * Math.min(dt * 3.2, 1)
      parallaxX += (pxTarget - parallaxX) * Math.min(dt * 3.4, 1)
      parallaxY += (pyTarget - parallaxY) * Math.min(dt * 3.4, 1)

      camera.position.set(parallaxX, 8 + parallaxY, 26)
      camera.lookAt(0, 7, 0)

      if (isRain && precip.data.length > 0) {
        const drops = precip.data as RainDrop[]
        for (let i = 0; i < drops.length; i++) {
          const d = drops[i]
          d.y -= d.speed * dt
          d.x += (wind * 0.5 + Math.sin(now * 0.001 + d.phase) * 0.12) * dt
          if (d.y <= BOTTOM) {
            if (splashMesh) {
              const pool = splashMesh.pool
              const cursor = Math.floor(Math.random() * 4)
              for (let k = 0; k < 3; k++) {
                const s = pool[(i * 3 + k + cursor) % SPLASH_COUNT]
                s.x = d.x + (Math.random() - 0.5) * 0.6
                s.y = BOTTOM
                s.z = d.z + (Math.random() - 0.5) * 0.6
                s.vx = wind * 0.3 + (Math.random() - 0.5) * 1.4
                s.vy = 1.8 + Math.random() * 3
                s.vz = (Math.random() - 0.5) * 1.4
                s.life = 0.42 + Math.random() * 0.3
              }
            }
            d.y = TOP + Math.random() * 6
            d.x = (Math.random() - 0.5) * FIELD_X
            d.z = (Math.random() - 0.5) * FIELD_Z
          }
          const tilt = Math.atan2(wind * 0.5, d.speed)
          dummy.position.set(d.x, d.y, d.z)
          dummy.rotation.set(0, 0, tilt)
          dummy.scale.set(1, 1, 1)
          dummy.updateMatrix()
          precip.mesh.setMatrixAt(i, dummy.matrix)
        }
        precip.mesh.instanceMatrix.needsUpdate = true

        if (splashMesh) {
          for (let i = 0; i < SPLASH_COUNT; i++) {
            const s = splashMesh.pool[i]
            if (s.life <= 0) continue
            s.vy -= 17 * dt
            s.x += s.vx * dt
            s.y += s.vy * dt
            s.z += s.vz * dt
            s.life -= dt
            const sc = s.life > 0 ? Math.max(0.001, s.life / 0.6) : 0.001
            dummy.position.set(s.x, s.y, s.z)
            dummy.scale.set(sc, sc, sc)
            dummy.rotation.set(0, 0, 0)
            dummy.updateMatrix()
            splashMesh.mesh.setMatrixAt(i, dummy.matrix)
          }
          splashMesh.mesh.instanceMatrix.needsUpdate = true
        }
      } else if (isSnow && precip.data.length > 0) {
        const flakes = precip.data as Snowflake[]
        for (let i = 0; i < flakes.length; i++) {
          const f = flakes[i]
          f.y -= f.speed * dt
          f.x += (wind * 0.22 + Math.sin(f.phase + now * 0.0005) * f.sway * 0.6) * dt
          if (f.y <= BOTTOM) {
            f.y = TOP + Math.random() * 4
            f.x = (Math.random() - 0.5) * FIELD_X
            f.z = (Math.random() - 0.5) * FIELD_Z
          }
          dummy.position.set(f.x, f.y, f.z)
          dummy.rotation.set(0, 0, now * 0.00018 * f.spin + f.phase)
          dummy.scale.set(f.size, f.size, 1)
          dummy.updateMatrix()
          precip.mesh.setMatrixAt(i, dummy.matrix)
        }
        precip.mesh.instanceMatrix.needsUpdate = true
      }

      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!reduced) {
        running = true
        prev = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    if (reduced) {
      renderer.render(scene, camera)
    } else {
      raf = requestAnimationFrame(tick)
    }

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      ro.disconnect()
      precip.geo.dispose()
      precip.mat.dispose()
      if (splashMesh) {
        splashMesh.geo.dispose()
        splashMesh.mat.dispose()
      }
      renderer.dispose()
      host.innerHTML = ''
    }
  }, [weather, reduced])

  return (
    <div ref={hostRef} className="fixed inset-0 z-40 pointer-events-none" aria-hidden="true" />
  )
}