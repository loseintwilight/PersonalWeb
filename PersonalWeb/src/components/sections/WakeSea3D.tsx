import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useTheme } from '@/hooks/useTheme'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { Season, Weather } from '@/themes'

/*
 * Wake page 3D ocean scene.
 * - Anime cel water: Voronoi F1 - SmoothF1 color ramp + shader ripple rings,
 *   adapted from cortiz2894/stylized-components (WaterFloor).
 * - Ship model: tz_pirate_ship by niktonigde (CC-BY-4.0), via xentoshi/Shipspace.
 * - Click-to-sail mini game: the ship slowly turns toward the clicked point,
 *   sails there and leaves wake ripples behind.
 */

/* ==================== Anime cel water (stylized-components WaterFloor) ==================== */

const WATER_VERT = /* glsl */ `
  varying vec2 vWorldPos;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const WATER_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uScale;
  uniform float uSmoothness;
  uniform float uEdgeThreshold;
  uniform float uEdgeSoftness;
  uniform float uFlowX;
  uniform float uFlowZ;
  uniform float uCellSpeed;
  uniform float uNoiseScale;
  uniform float uNoiseFlowSpeed;
  uniform float uDistortAmount;
  uniform vec3 uDeepColor;
  uniform vec3 uMidColor;
  uniform float uMidPos;
  uniform vec3 uHighlight;
  uniform vec3 uSky;
  uniform float uFadeDistance;
  uniform float uFadeStrength;
  uniform vec2 uCamXZ;

  uniform vec2 uRippleCenters[12];
  uniform float uRippleTimes[12];
  uniform int uRippleCount;
  uniform float uRippleSpeed;
  uniform float uRippleWidth;
  uniform float uRippleStrength;
  uniform float uRippleDecay;
  uniform int uRippleRings;
  uniform float uRippleSpacing;

  varying vec2 vWorldPos;

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k / 6.0;
  }

  vec2 cellPt(vec2 seed) {
    return 0.5 + 0.5 * sin(uTime * uCellSpeed + 6.2831 * seed);
  }

  float voronoiF1(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float md = 8.0;
    for (int y = -1; y <= 1; y++)
      for (int x = -1; x <= 1; x++) {
        vec2 n = vec2(float(x), float(y));
        vec2 pt = cellPt(hash2(i + n));
        md = min(md, length(n + pt - f));
      }
    return md;
  }

  float voronoiSF1(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float res = 8.0;
    for (int y = -1; y <= 1; y++)
      for (int x = -1; x <= 1; x++) {
        vec2 n = vec2(float(x), float(y));
        vec2 pt = cellPt(hash2(i + n));
        res = smin(res, length(n + pt - f), uSmoothness);
      }
    return res;
  }

  float nHash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(nHash(i), nHash(i + vec2(1.0, 0.0)), f.x),
      mix(nHash(i + vec2(0.0, 1.0)), nHash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 2; i++) { v += a * vnoise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 noiseUV = vWorldPos * uNoiseScale + vec2(uTime * uNoiseFlowSpeed, 0.0);
    float noiseFac = fbm(noiseUV);
    vec2 distort = (vec2(noiseFac) - 0.5) * uDistortAmount;

    vec2 uv = vWorldPos * uScale + vec2(uFlowX, uFlowZ) * uTime + distort;

    float f1 = voronoiF1(uv);
    float sf1 = voronoiSF1(uv);
    float edge = f1 - sf1;

    float t = smoothstep(
      uEdgeThreshold - uEdgeSoftness,
      uEdgeThreshold + uEdgeSoftness,
      edge
    );

    float safeMP = max(uMidPos, 1e-4);
    float seg0 = clamp(t / safeMP, 0.0, 1.0);
    float seg1 = clamp((t - safeMP) / max(1.0 - safeMP, 1e-4), 0.0, 1.0);
    float inSeg1 = step(safeMP, t);
    vec3 color = mix(
      mix(uDeepColor, uMidColor, seg0),
      mix(uMidColor, uHighlight, seg1),
      inSeg1
    );

    float rippleAcc = 0.0;
    for (int i = 0; i < 12; i++) {
      float isOn = step(float(i), float(uRippleCount) - 0.5);
      float elapsed = max(uTime - uRippleTimes[i], 0.0);
      float d = length(vWorldPos - uRippleCenters[i]);
      for (int r = 0; r < 4; r++) {
        float rIsOn = step(float(r), float(uRippleRings) - 0.5);
        float re = max(elapsed - float(r) * uRippleSpacing, 0.0);
        float ringR = re * uRippleSpeed;
        float ringDist = abs(d - ringR);
        float ring = 1.0 - smoothstep(0.0, uRippleWidth, ringDist);
        float fade = exp(-re * uRippleDecay);
        rippleAcc += ring * fade * isOn * rIsOn;
      }
    }
    float ripple = clamp(rippleAcc * uRippleStrength, 0.0, 1.0);
    // Anime foam: bright pure-white rings with a soft glow so they stand out
    // from the cel-shaded cell edges.
    color = mix(color, vec3(1.0), ripple);
    color += uHighlight * ripple * 0.22;

    float dist = length(vWorldPos - uCamXZ);
    float fade = 1.0 - pow(clamp(dist / uFadeDistance, 0.0, 1.0), uFadeStrength);
    color = mix(uSky, color, fade);

    gl_FragColor = vec4(color, 1.0);
  }
`

const SPARKLE_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTwinkle;
  void main() {
    vTwinkle = 0.55 + 0.45 * sin(uTime * 1.7 + aPhase * 6.28318);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (34.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const SPARKLE_FRAG = /* glsl */ `
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    vec2 q = gl_PointCoord * 2.0 - 1.0;
    float star = pow(clamp(1.0 - length(abs(q)), 0.0, 1.0), 3.0);
    float a = star * vTwinkle * uOpacity;
    if (a < 0.01) discard;
    gl_FragColor = vec4(1.0, 1.0, 1.0, a);
  }
`

const RIPPLE_SLOTS = 12
const SPARKLE_COUNT = 150

interface RippleEvent {
  x: number
  z: number
  t: number
}

/* ==================== Theme palette ==================== */

interface OceanPalette {
  skyTop: string
  skyMid: string
  skyBottom: string
  fog: string
  sun: string
  sunIntensity: number
  ambient: number
  deep: THREE.Color
  mid: THREE.Color
  highlight: THREE.Color
  midPos: number
  ripple: number
  sparkle: number
}

function getTargetPalette(season: Season, weather: Weather): OceanPalette {
  const base = (() => {
    switch (season) {
      case 'spring':
        return {
          skyTop: '#79b9ea', skyMid: '#d3ecf7', skyBottom: '#fbf3dd', fog: '#cfe9f5',
          sun: '#fff2c9', sunIntensity: 1.7, ambient: 0.9,
          deep: '#1773b5', mid: '#45cdf2', highlight: '#f4fdff',
          midPos: 0.15, ripple: 1, sparkle: 0.85,
        }
      case 'summer':
        return {
          skyTop: '#3f9fe8', skyMid: '#bfe8f8', skyBottom: '#f6f9e8', fog: '#c4e7f7',
          sun: '#fff1b8', sunIntensity: 1.95, ambient: 1,
          deep: '#0f73c2', mid: '#34c6f0', highlight: '#eafcff',
          midPos: 0.15, ripple: 1, sparkle: 1,
        }
      case 'autumn':
        return {
          skyTop: '#5d86a8', skyMid: '#f0c98d', skyBottom: '#f7e3c0', fog: '#e8cfa8',
          sun: '#ffca7a', sunIntensity: 1.5, ambient: 0.85,
          deep: '#1c6f9e', mid: '#45c4d8', highlight: '#fdf3c8',
          midPos: 0.16, ripple: 0.9, sparkle: 0.6,
        }
      case 'winter':
        return {
          skyTop: '#7fa3c4', skyMid: '#dcecf7', skyBottom: '#f2f7fb', fog: '#dce9f4',
          sun: '#eaf4ff', sunIntensity: 1.3, ambient: 0.95,
          deep: '#2d6094', mid: '#7fb8d6', highlight: '#f2f8ff',
          midPos: 0.18, ripple: 0.8, sparkle: 1.1,
        }
    }
  })()

  const p: OceanPalette = {
    ...base,
    deep: new THREE.Color(base.deep),
    mid: new THREE.Color(base.mid),
    highlight: new THREE.Color(base.highlight),
  }
  const gray = new THREE.Color(0x7d8f9c)
  const pale = new THREE.Color(0xdcebf4)

  switch (weather) {
    case 'cloudy':
      p.sunIntensity *= 0.72
      p.ambient *= 0.9
      p.deep.lerp(gray, 0.16)
      p.mid.lerp(gray, 0.11)
      p.highlight.lerp(gray, 0.07)
      p.ripple *= 0.6
      break
    case 'rain':
      p.sunIntensity *= 0.4
      p.ambient *= 0.7
      p.deep.multiplyScalar(0.72)
      p.mid.multiplyScalar(0.78)
      p.highlight.multiplyScalar(0.85)
      p.fog = '#9fb8c8'
      p.ripple *= 1.8
      p.sparkle *= 0.5
      break
    case 'snow':
      p.sunIntensity *= 0.85
      p.deep.lerp(pale, 0.4)
      p.mid.lerp(pale, 0.35)
      p.highlight.lerp(pale, 0.25)
      p.fog = '#e8f1f8'
      p.sparkle *= 1.35
      break
  }
  return p
}

function makeSkyTexture(palette: Pick<OceanPalette, 'skyTop' | 'skyMid' | 'skyBottom'>): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 2
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, palette.skyTop)
  grad.addColorStop(0.55, palette.skyMid)
  grad.addColorStop(1, palette.skyBottom)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 2, 256)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Simple sailboat used only if the GLTF model fails to load. */
function makeFallbackShip(): THREE.Group {
  const g = new THREE.Group()
  const hull = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 1.1), new THREE.MeshLambertMaterial({ color: 0x8a5a33 }))
  hull.position.y = 0.12
  g.add(hull)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 0.9), new THREE.MeshLambertMaterial({ color: 0xc8965a }))
  deck.position.y = 0.42
  g.add(deck)
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.6, 8), new THREE.MeshLambertMaterial({ color: 0x5d4023 }))
  mast.position.set(0, 1.75, 0)
  g.add(mast)
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.5), new THREE.MeshLambertMaterial({ color: 0xfff6ea, side: THREE.DoubleSide }))
  sail.position.set(0.18, 1.4, 0)
  sail.rotation.y = 0.15
  g.add(sail)
  return g
}

/* ==================== Scene ==================== */

export function WakeSea3D({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const reduced = usePrefersReducedMotion()
  const { season, weather } = useTheme()
  const themeRef = useRef<{ season: Season; weather: Weather }>({ season, weather })
  themeRef.current = { season, weather }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (typeof WebGLRenderingContext === 'undefined') return

    const scene = new THREE.Scene()
    const fog = new THREE.Fog(0xcfeaff, 42, 90)
    scene.fog = fog

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200)
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setClearColor(0xcfeaff)
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6)
    renderer.setPixelRatio(dpr)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.cursor = 'grab'
    container.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 0.9)
    const sun = new THREE.DirectionalLight(0xfff3d0, 1.7)
    sun.position.set(8, 12, 6)
    scene.add(ambient, sun)

    const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xfff6c8, transparent: true, opacity: 0.85 }))
    sunSprite.scale.set(5, 5, 1)
    sunSprite.position.set(14, 16, -30)
    scene.add(sunSprite)

    /* ---------- anime cel water (follows camera for infinite floor) ---------- */
    const waterMat = new THREE.ShaderMaterial({
      vertexShader: WATER_VERT,
      fragmentShader: WATER_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: 0.2 },
        uSmoothness: { value: 0.55 },
        uEdgeThreshold: { value: 0.12 },
        uEdgeSoftness: { value: 0.01 },
        uFlowX: { value: 0 },
        uFlowZ: { value: 0.05 },
        uCellSpeed: { value: 0.3 },
        uNoiseScale: { value: 1.52 },
        uNoiseFlowSpeed: { value: 0.2 },
        uDistortAmount: { value: 0.3 },
        uDeepColor: { value: new THREE.Color(0x1773b5) },
        uMidColor: { value: new THREE.Color(0x45cdf2) },
        uMidPos: { value: 0.15 },
        uHighlight: { value: new THREE.Color(0xf2fbff) },
        uSky: { value: new THREE.Color(0xd3ecf7) },
        uFadeDistance: { value: 60 },
        uFadeStrength: { value: 1.5 },
        uCamXZ: { value: new THREE.Vector2(0, 0) },
        uRippleCenters: { value: Array.from({ length: RIPPLE_SLOTS }, () => new THREE.Vector2()) },
        uRippleTimes: { value: new Array(RIPPLE_SLOTS).fill(0) },
        uRippleCount: { value: 0 },
        uRippleSpeed: { value: 2.2 },
        uRippleWidth: { value: 0.22 },
        uRippleStrength: { value: 5.5 },
        uRippleDecay: { value: 1.3 },
        uRippleRings: { value: 3 },
        uRippleSpacing: { value: 0.9 },
      },
    })
    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), waterMat)
    ocean.rotation.x = -Math.PI / 2
    ocean.position.y = -0.02
    scene.add(ocean)

    /* ---------- water sparkles ---------- */
    const sparkleGeo = new THREE.BufferGeometry()
    const sparklePos = new Float32Array(SPARKLE_COUNT * 3)
    const sparkleSize = new Float32Array(SPARKLE_COUNT)
    const sparklePhase = new Float32Array(SPARKLE_COUNT)
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.pow(Math.random(), 0.6) * 30
      sparklePos[i * 3] = Math.cos(a) * r
      sparklePos[i * 3 + 1] = 0.15 + Math.random() * 0.3
      sparklePos[i * 3 + 2] = Math.sin(a) * r
      sparkleSize[i] = 0.5 + Math.random() * 0.9
      sparklePhase[i] = Math.random()
    }
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3))
    sparkleGeo.setAttribute('aSize', new THREE.BufferAttribute(sparkleSize, 1))
    sparkleGeo.setAttribute('aPhase', new THREE.BufferAttribute(sparklePhase, 1))
    const sparkleMat = new THREE.ShaderMaterial({
      vertexShader: SPARKLE_VERT,
      fragmentShader: SPARKLE_FRAG,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: dpr }, uOpacity: { value: 0.85 } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat)
    scene.add(sparkles)

    /* ---------- clouds ---------- */
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    const clouds: { group: THREE.Group; baseY: number; speed: number; offset: number }[] = []
    for (let i = 0; i < 7; i++) {
      const group = new THREE.Group()
      const puffs = [
        [0, 0, 0, 1],
        [1.1, 0.15, 0.2, 0.72],
        [-1.05, 0.1, -0.15, 0.68],
        [0.4, 0.45, 0.1, 0.6],
      ] as const
      for (const [x, y, z, s] of puffs) {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(s, 12, 8), cloudMat)
        sphere.position.set(x, y, z)
        sphere.scale.y = 0.5
        group.add(sphere)
      }
      const r = 14 + (i % 4) * 7
      const angle = (i / 7) * Math.PI * 2
      group.position.set(Math.cos(angle) * r, 7 + (i % 3) * 2.4, Math.sin(angle) * r)
      group.scale.setScalar(1.4 + (i % 3) * 0.6)
      scene.add(group)
      clouds.push({ group, baseY: group.position.y, speed: 0.05 + (i % 3) * 0.03, offset: i * 1.7 })
    }

    /* ---------- birds ---------- */
    const birds: THREE.Line[] = []
    const birdMat = new THREE.LineBasicMaterial({ color: 0x33475c })
    for (let i = 0; i < 5; i++) {
      const birdGeo = new THREE.BufferGeometry()
      const pts: number[] = []
      for (let k = 0; k <= 8; k++) {
        const t = k / 8
        const x = t * 1.2 - 0.6
        const y = Math.sin(t * Math.PI) * 0.18
        pts.push(x, y, 0)
      }
      birdGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
      const bird = new THREE.Line(birdGeo, birdMat)
      bird.rotation.z = Math.PI / 2
      const r = 9 + (i % 3) * 3
      const a = (i / 5) * Math.PI * 2
      bird.position.set(Math.cos(a) * r, 6 + i * 0.8, Math.sin(a) * r)
      scene.add(bird)
      birds.push(bird)
    }

    /* ---------- ship ---------- */
    const shipRoot = new THREE.Group()
    scene.add(shipRoot)

    const shipPos = new THREE.Vector3(-2.5, 0, -1.5)
    let shipHeading = Math.PI * 0.18
    let targetNav: THREE.Vector3 | null = null
    let sailing = false
    let wakeTimer = 0
    let wakeSide = false
    let modelReady = false
    let mixer: THREE.AnimationMixer | null = null
    const gltfTextures = new Set<THREE.Texture>()
    // 卡通三阶明暗渐变图（Toon shading）：让海盗船呈现赛璐璐质感
    const toonGradient = (() => {
      const data = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 240, 240, 240, 255, 255, 255, 255, 255])
      const tex = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat)
      tex.minFilter = THREE.NearestFilter
      tex.magFilter = THREE.NearestFilter
      tex.generateMipmaps = false
      tex.needsUpdate = true
      return tex
    })()

    const prepareShipModel = (root: THREE.Group, animations: THREE.AnimationClip[]) => {
      // Model export is in FBX units (scale 100). After centering, the bow
      // already faces +Z (heading 0), matching the click-to-sail movement.
      root.scale.setScalar(0.01)

      const box = new THREE.Box3().setFromObject(root)
      const center = box.getCenter(new THREE.Vector3())
      root.position.x -= center.x
      root.position.z -= center.z
      // 吃水线对准船体中部的船梁（船体最宽处），船体自然漂浮、不再沉入海面。
      root.position.y = 0.72

      root.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (!mesh.isMesh) return
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        const converted = mats.map((m) => {
          const src = m as THREE.MeshStandardMaterial
          if (src.map) gltfTextures.add(src.map)
          if (src.alphaMap) gltfTextures.add(src.alphaMap)
          const toon = new THREE.MeshToonMaterial({
            map: src.map ?? null,
            alphaMap: src.alphaMap ?? null,
            gradientMap: toonGradient,
            color: 0xffffff,
            transparent: src.transparent,
            opacity: src.opacity ?? 1,
            alphaTest: src.alphaTest ?? 0,
            side: src.side,
          })
          toon.name = src.name
          return toon
        })
        mesh.material = Array.isArray(mesh.material) ? converted : converted[0]
      })

      shipRoot.add(root)
      modelReady = true

      if (!reduced && animations.length > 0) {
        mixer = new THREE.AnimationMixer(root)
        mixer.clipAction(animations[0]).play()
      }
    }

    new GLTFLoader().load(
      '/models/tz_pirate_ship/scene.gltf',
      (gltf) => prepareShipModel(gltf.scene, gltf.animations),
      undefined,
      () => {
        const fallback = makeFallbackShip()
        shipRoot.add(fallback)
        modelReady = true
      },
    )

    /* ---------- theme ---------- */
    let themeKey = `${season}:${weather}`
    let target = getTargetPalette(season, weather)
    let skyTex: THREE.Texture | null = null
    const applyPalette = (p: OceanPalette) => {
      if (skyTex) skyTex.dispose()
      skyTex = makeSkyTexture(p)
      scene.background = skyTex
      fog.color.set(p.fog)
      renderer.setClearColor(p.fog)
      sun.color.set(p.sun)
      sun.intensity = p.sunIntensity
      ambient.intensity = p.ambient
      sunSprite.material.color.set(p.sun)
      waterMat.uniforms.uSky.value.set(p.skyMid)
    }
    applyPalette(target)

    /* ---------- camera / interaction ---------- */
    let yaw = 0.65
    let pitch = 0.42
    let radius = 11
    const targetV = new THREE.Vector3(0, 1.2, 0)
    let dragging = false
    let autoRotate = true
    const uTime = { value: 0 }

    const updateCamera = () => {
      camera.position.set(
        targetV.x + radius * Math.cos(pitch) * Math.sin(yaw),
        targetV.y + radius * Math.sin(pitch),
        targetV.z + radius * Math.cos(pitch) * Math.cos(yaw),
      )
      camera.lookAt(targetV)
    }
    updateCamera()

    const raycaster = new THREE.Raycaster()
    const hitPoint = new THREE.Vector3()
    const waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

    const hitWater = (clientX: number, clientY: number, maxR = 44): THREE.Vector3 | null => {
      const rect = renderer.domElement.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return null
      const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      const hit = raycaster.ray.intersectPlane(waterPlane, hitPoint)
      if (!hit) return null
      const len = Math.hypot(hit.x, hit.z)
      if (len > maxR) {
        const s = maxR / len
        hit.x *= s
        hit.z *= s
      }
      return hit.clone()
    }

    /* ---------- ripple pool (fed to the water shader) ---------- */
    const ripplePool: RippleEvent[] = []
    const spawnRippleEvent = (x: number, z: number) => {
      if (reduced) return
      ripplePool.push({ x, z, t: performance.now() / 1000 })
      if (ripplePool.length > RIPPLE_SLOTS) ripplePool.shift()
    }

    const spawnBurst = (x: number, z: number) => {
      spawnRippleEvent(x, z)
      spawnRippleEvent(x + 0.6, z + 0.35)
    }

    let lastX = 0
    let lastY = 0
    let moved = 0
    let lastRippleMs = 0

    const onPointerDown = (e: PointerEvent) => {
      dragging = true
      autoRotate = false
      lastX = e.clientX
      lastY = e.clientY
      moved = 0
      renderer.domElement.style.cursor = 'grabbing'
      const hit = hitWater(e.clientX, e.clientY)
      if (hit) {
        spawnBurst(hit.x, hit.z)
        lastRippleMs = performance.now()
      }
    }
    const onPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      moved += Math.abs(dx) + Math.abs(dy)
      if (!dragging) return
      yaw -= dx * 0.0055
      pitch = Math.max(0.08, Math.min(1.35, pitch + dy * 0.004))
      updateCamera()
      const nowMs = performance.now()
      if (!sailing && nowMs - lastRippleMs > 300) {
        const hit = hitWater(e.clientX, e.clientY)
        if (hit) {
          spawnRippleEvent(hit.x, hit.z)
          lastRippleMs = nowMs
        }
      }
    }
    const onPointerUp = (e: PointerEvent) => {
      dragging = false
      renderer.domElement.style.cursor = 'grab'
      if (moved < 6) {
        const hit = hitWater(e.clientX, e.clientY, 26)
        if (hit) {
          // Click-to-sail: aim the ship at the clicked point and splash a ripple.
          targetNav = hit.clone()
          spawnBurst(hit.x, hit.z)
        }
      }
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      radius = Math.max(6, Math.min(18, radius + e.deltaY * 0.012))
      updateCamera()
    }
    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    const canvas = renderer.domElement
    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    const ro = new ResizeObserver(onResize)
    ro.observe(container)
    onResize()

    const uRippleCenters = waterMat.uniforms.uRippleCenters.value as THREE.Vector2[]
    const uRippleTimes = waterMat.uniforms.uRippleTimes.value as number[]

    let raf = 0
    let prev = performance.now()
    const animate = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05)
      prev = now
      uTime.value += dt
      const nowSec = now / 1000

      // Theme transitions
      const key = `${themeRef.current.season}:${themeRef.current.weather}`
      if (key !== themeKey) {
        themeKey = key
        target = getTargetPalette(themeRef.current.season, themeRef.current.weather)
        applyPalette(target)
      }
      const blend = 1 - Math.exp(-dt * 2.2)
      waterMat.uniforms.uDeepColor.value.lerp(target.deep, blend)
      waterMat.uniforms.uMidColor.value.lerp(target.mid, blend)
      waterMat.uniforms.uHighlight.value.lerp(target.highlight, blend)
      waterMat.uniforms.uMidPos.value += (target.midPos - waterMat.uniforms.uMidPos.value) * blend
      waterMat.uniforms.uRippleStrength.value += (target.ripple * 4.5 - waterMat.uniforms.uRippleStrength.value) * blend
      sparkleMat.uniforms.uOpacity.value += (target.sparkle - sparkleMat.uniforms.uOpacity.value) * blend

      // Water follows the camera so the Voronoi pattern tiles like an infinite floor
      waterMat.uniforms.uTime.value = nowSec
      waterMat.uniforms.uCamXZ.value.set(camera.position.x, camera.position.z)
      ocean.position.x = camera.position.x
      ocean.position.z = camera.position.z

      // Ripple events -> shader slots
      const count = Math.min(ripplePool.length, RIPPLE_SLOTS)
      for (let i = 0; i < count; i++) {
        uRippleCenters[i].set(ripplePool[i].x, ripplePool[i].z)
        uRippleTimes[i] = ripplePool[i].t
      }
      waterMat.uniforms.uRippleCount.value = count

      // Click-to-sail navigation
      if (targetNav) {
        const dx = targetNav.x - shipPos.x
        const dz = targetNav.z - shipPos.z
        const dist = Math.hypot(dx, dz)
        if (dist < 0.6) {
          targetNav = null
          if (sailing) spawnBurst(shipPos.x, shipPos.z)
          sailing = false
        } else {
          const targetHeading = Math.atan2(dx, dz)
          let diff = targetHeading - shipHeading
          while (diff > Math.PI) diff -= Math.PI * 2
          while (diff < -Math.PI) diff += Math.PI * 2
          const maxTurn = 1.15 * dt
          if (Math.abs(diff) > maxTurn) shipHeading += Math.sign(diff) * maxTurn
          else shipHeading = targetHeading

          if (Math.abs(diff) < 0.5) {
            sailing = true
            const speed = reduced ? 0 : 2.4
            shipPos.x += Math.sin(shipHeading) * speed * dt
            shipPos.z += Math.cos(shipHeading) * speed * dt

            // Wake ripples at the stern, alternating sides
            if (!reduced) {
              wakeTimer -= dt
              if (wakeTimer <= 0) {
                wakeTimer = 0.16
                wakeSide = !wakeSide
                const side = wakeSide ? 0.55 : -0.55
                const sternX = shipPos.x - Math.sin(shipHeading) * 1.7
                const sternZ = shipPos.z - Math.cos(shipHeading) * 1.7
                spawnRippleEvent(sternX + Math.cos(shipHeading) * side, sternZ - Math.sin(shipHeading) * side)
              }
            }
          } else {
            sailing = false
          }
        }
      }

      // Ship pose: slow buoyancy + gentle heading-driven motion
      if (modelReady) {
        if (!reduced) {
          const t = uTime.value
          const bob = Math.sin(t * 1.2) * 0.05 + Math.sin(t * 2.6 + 1.4) * 0.028
          const roll = Math.sin(t * 0.85) * 0.035 + (sailing ? Math.sin(t * 2.1) * 0.02 : 0)
          const pitch = Math.sin(t * 1.05 + 0.7) * 0.03 + (sailing ? 0.045 : 0)
          shipRoot.position.set(shipPos.x, bob, shipPos.z)
          shipRoot.rotation.order = 'YXZ'
          shipRoot.rotation.set(pitch, shipHeading, roll)
        } else {
          shipRoot.position.set(shipPos.x, 0, shipPos.z)
          shipRoot.rotation.set(0, shipHeading, 0)
        }
        if (mixer) mixer.update(dt)
      }

      if (!reduced) {
        for (const c of clouds) {
          c.group.position.x = c.group.position.x + Math.sin(uTime.value * c.speed + c.offset) * 0.004
          c.group.position.y = c.baseY + Math.sin(uTime.value * 0.4 + c.offset) * 0.3
        }
        for (let i = 0; i < birds.length; i++) {
          const b = birds[i]
          const a = uTime.value * 0.3 + i * 1.4
          const r = 10 + (i % 3) * 3
          b.position.x = Math.cos(a) * r
          b.position.z = Math.sin(a) * r
          b.rotation.y = -a + Math.PI / 2
          b.position.y = 6 + i * 0.9 + Math.sin(uTime.value * 2 + i) * 0.3
        }
        if (sailing && !dragging) {
          const k = Math.min(1, dt * 0.5)
          targetV.x += (shipPos.x * 0.55 - targetV.x) * k
          targetV.z += (shipPos.z * 0.55 - targetV.z) * k
        }
        if (autoRotate) {
          yaw += dt * 0.06
          updateCamera()
        }
      }

      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('wheel', onWheel)
      ro.disconnect()
      if (skyTex) skyTex.dispose()
      toonGradient.dispose()
      for (const tex of gltfTextures) tex.dispose()
      scene.traverse((obj) => {
        const anyObj = obj as unknown as { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] }
        anyObj.geometry?.dispose()
        if (anyObj.material) {
          if (Array.isArray(anyObj.material)) anyObj.material.forEach((m) => m.dispose())
          else anyObj.material.dispose()
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement)
    }
  }, [reduced])

  return <div ref={containerRef} className={className} aria-label="3D ocean scene" />
}