import { Suspense, useMemo, useRef, useEffect, type MutableRefObject } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, SMAA } from '@react-three/postprocessing'
import * as THREE from 'three'
import Env from './Env'
import { FOCUS_POINTS, FRAMES_PER_NODE } from '../data/focusPoints'

const POINTS = FOCUS_POINTS as readonly string[]
const M = POINTS.length
const RESUME_FRAMES = M * FRAMES_PER_NODE
const WORKS_ENTRANCE = 50
const NODE_LINE = 0.3

// Camera targets mapped to the regions of your portrait & stickers in 3D space:
// [x, y, z] where camera looks and zooms as you scroll through each section
const ANCHOR_TARGETS: Record<string, { focus: [number, number, number]; cam: [number, number, number] }> = {
  'focus-0': { focus: [0, 0.05, 0], cam: [0, 0.1, 8.6] },         // Hero: Full portrait overview
  'focus-1': { focus: [1.05, -0.35, 0], cam: [0.65, -0.25, 5.4] }, // GAT sticker (Global Academy of Technology)
  'focus-2': { focus: [-0.95, -0.65, 0], cam: [-0.55, -0.55, 5.2] }, // Dinosaur & Loading stickers (ThreatLens)
  'focus-3': { focus: [-0.9, 0.15, 0], cam: [-0.5, 0.15, 5.4] },   // Headphones & Coffee stickers (NyayaSetu)
  'focus-4': { focus: [0.95, 0.25, 0], cam: [0.55, 0.25, 5.3] },   // Sunflower & Disco Ball stickers (Fashion App)
  'focus-works': { focus: [0, 0.0, 0], cam: [0, 0.0, 9.4] },       // Works gallery overview
}

function GradientBackground() {
  const top = '#6f906f'
  const bottom = '#dbd3b5'
  const steep = 1.4

  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uBottom: { value: new THREE.Color() },
      uSteep: { value: 1 },
    }),
    []
  )
  uniforms.uTop.value.set(top)
  uniforms.uBottom.value.set(bottom)
  uniforms.uSteep.value = steep

  return (
    <mesh scale={100}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uTop;
          uniform vec3 uBottom;
          uniform float uSteep;
          varying vec3 vDir;
          void main() {
            float t = clamp(vDir.y * uSteep * 0.5 + 0.5, 0.0, 1.0);
            gl_FragColor = vec4(mix(uBottom, uTop, t), 1.0);
          }
        `}
      />
    </mesh>
  )
}

function Lights() {
  return (
    <>
      <Env
        intensity={0.75}
        rotationX={0}
        rotationY={0}
        rotationZ={0}
        asBackground={false}
        bgIntensity={0.4}
        bgBlur={0}
      />
      <hemisphereLight args={['#ffffff', '#404040', 1.1]} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} color="#ffd9c6" />
      <directionalLight position={[-5, 4, -4]} intensity={1.1} color="#9fc6ff" />
    </>
  )
}

function InteractiveAvatar({
  focusRef,
  frameRef,
}: {
  focusRef: MutableRefObject<THREE.Vector3>
  frameRef: MutableRefObject<number>
}) {
  const texture = useTexture(`${import.meta.env.BASE_URL}images/vaishnavi-avatar.png`)
  texture.colorSpace = THREE.SRGBColorSpace

  const aspect = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined
    return img && img.width && img.height ? img.width / img.height : 4 / 3
  }, [texture])

  const planeHeight = 6.2
  const planeWidth = planeHeight * aspect

  const cardRef = useRef<THREE.Group>(null)
  const get = useThree((s) => s.get)

  const mouse = useRef({ x: 0, y: 0 })
  const smouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const isMobile = useRef(
    typeof window !== 'undefined' &&
      (window.matchMedia?.('(pointer: coarse)').matches === true || window.innerWidth <= 640)
  )

  const anchorEls = useRef<any>(null)
  const galleryEl = useRef<any>(null)
  const frameSmooth = useRef(0)

  const posA = useRef(new THREE.Vector3())
  const posB = useRef(new THREE.Vector3())
  const camA = useRef(new THREE.Vector3())
  const camB = useRef(new THREE.Vector3())
  const targetCamPos = useRef(new THREE.Vector3(0, 0.1, 8.6))

  useFrame((state, dt) => {
    const a = 1 - Math.pow(0.1, dt)

    if (!anchorEls.current) {
      anchorEls.current = POINTS.map((n) => document.querySelector(`[data-point="${n}"]`))
    }
    const els = anchorEls.current
    const d = 0.35
    const dwell = (t: number) => {
      if (t < d) return 0
      if (t > 1 - d) return 1
      return THREE.MathUtils.smoothstep((t - d) / (1 - 2 * d), 0, 1)
    }

    let sTarget = THREE.MathUtils.clamp(frameSmooth.current / FRAMES_PER_NODE - 1, -1, M - 1)
    if (els && els.length === M && els.every(Boolean)) {
      const refLine = window.scrollY + window.innerHeight * NODE_LINE
      const tops = els.map((el: any) => el.getBoundingClientRect().top + window.scrollY)
      if (refLine <= tops[0]) {
        const heroScroll = Math.max(1, tops[0] - window.innerHeight * NODE_LINE)
        sTarget = -1 + dwell(THREE.MathUtils.clamp(window.scrollY / heroScroll, 0, 1))
      } else if (refLine >= tops[M - 1]) {
        sTarget = M - 1
      } else {
        for (let i = 0; i < M - 1; i++) {
          if (refLine <= tops[i + 1]) {
            const t = (refLine - tops[i]) / Math.max(1, tops[i + 1] - tops[i])
            sTarget = i + dwell(t)
            break
          }
        }
      }
    }

    let frameTarget = THREE.MathUtils.clamp((sTarget + 1) * FRAMES_PER_NODE, 0, RESUME_FRAMES)
    let inWorks = false
    const totalFrames = RESUME_FRAMES + 2 * WORKS_ENTRANCE

    if (!galleryEl.current) galleryEl.current = document.querySelector('.wk-gallery')
    if (galleryEl.current) {
      const ih = window.innerHeight
      const rectTop = galleryEl.current.getBoundingClientRect().top
      const range = Math.max(0, galleryEl.current.offsetHeight - ih)
      if (rectTop < ih) {
        inWorks = true
        const entranceEnd = RESUME_FRAMES + WORKS_ENTRANCE
        if (rectTop > 0) {
          const pA = THREE.MathUtils.clamp(1 - rectTop / ih, 0, 1)
          frameTarget = RESUME_FRAMES + (entranceEnd - RESUME_FRAMES) * pA
        } else {
          const scrolled = THREE.MathUtils.clamp(-rectTop, 0, range)
          const pB = THREE.MathUtils.clamp(scrolled / window.innerWidth, 0, 1)
          frameTarget = entranceEnd + (totalFrames - entranceEnd) * pB
        }
      }
    }

    const smoothOff = THREE.MathUtils.smoothstep(frameTarget, RESUME_FRAMES, RESUME_FRAMES + WORKS_ENTRANCE)
    const aEff = THREE.MathUtils.lerp(a, 1, smoothOff)
    frameSmooth.current += (frameTarget - frameSmooth.current) * aEff
    const frame = frameSmooth.current
    if (frameRef) frameRef.current = frame

    const s = THREE.MathUtils.clamp(frame / FRAMES_PER_NODE - 1, -1, M - 1)

    // Interpolate focus point and camera position across scroll sections
    if (inWorks) {
      focusRef.current.set(...ANCHOR_TARGETS['focus-works'].focus)
      targetCamPos.current.set(...ANCHOR_TARGETS['focus-works'].cam)
    } else if (s < 0) {
      const t = THREE.MathUtils.clamp(s + 1, 0, 1)
      posA.current.set(...ANCHOR_TARGETS['focus-0'].focus)
      posB.current.set(...ANCHOR_TARGETS['focus-1'].focus)
      focusRef.current.lerpVectors(posA.current, posB.current, t)

      camA.current.set(...ANCHOR_TARGETS['focus-0'].cam)
      camB.current.set(...ANCHOR_TARGETS['focus-1'].cam)
      targetCamPos.current.lerpVectors(camA.current, camB.current, t)
    } else {
      const sc = THREE.MathUtils.clamp(s, 0, M - 1)
      const iA = Math.floor(sc)
      const iB = Math.min(iA + 1, M - 1)
      const f = sc - iA
      const keyA = POINTS[iA]
      const keyB = POINTS[iB]

      posA.current.set(...ANCHOR_TARGETS[keyA].focus)
      posB.current.set(...ANCHOR_TARGETS[keyB].focus)
      focusRef.current.lerpVectors(posA.current, posB.current, f)

      camA.current.set(...ANCHOR_TARGETS[keyA].cam)
      camB.current.set(...ANCHOR_TARGETS[keyB].cam)
      targetCamPos.current.lerpVectors(camA.current, camB.current, f)
    }

    // Cursor parallax & interactive 3D tilt on your portrait
    const me = 1 - Math.pow(0.08, dt)
    smouse.current.x += (mouse.current.x - smouse.current.x) * me
    smouse.current.y += (mouse.current.y - smouse.current.y) * me

    if (cardRef.current) {
      const floatY = Math.sin(state.clock.elapsedTime * 1.4) * 0.06
      cardRef.current.position.y = floatY
      if (!isMobile.current) {
        cardRef.current.rotation.y = THREE.MathUtils.lerp(
          cardRef.current.rotation.y,
          smouse.current.x * 0.22,
          0.12
        )
        cardRef.current.rotation.x = THREE.MathUtils.lerp(
          cardRef.current.rotation.x,
          -smouse.current.y * 0.16,
          0.12
        )
      }
    }

    const camera = get().camera as THREE.PerspectiveCamera
    if (camera) {
      const pull = isMobile.current ? 1.25 : 1.0
      camera.position.set(
        targetCamPos.current.x + smouse.current.x * 0.45,
        targetCamPos.current.y + smouse.current.y * 0.35,
        targetCamPos.current.z * pull
      )
      camera.lookAt(focusRef.current)
    }
  })

  return (
    <group ref={cardRef} position={[0, 0, 0]}>
      <mesh>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
    </group>
  )
}

function Post2({
  focusRef,
  frameRef,
}: {
  focusRef: MutableRefObject<THREE.Vector3>
  frameRef: MutableRefObject<number>
}) {
  const dofRef = useRef<any>(null)
  useFrame(() => {
    const e = dofRef.current
    if (!e) return
    if (e.target && focusRef) e.target.copy(focusRef.current)
    const f = frameRef ? frameRef.current : 0
    const wStart = 1 - THREE.MathUtils.smoothstep(f, 0, 48)
    const wEnd = THREE.MathUtils.smoothstep(f, RESUME_FRAMES - 50, RESUME_FRAMES)
    const w = Math.max(wStart, wEnd)
    e.bokehScale = THREE.MathUtils.lerp(4.2, 1.5, w)
    if (e.cocMaterial) {
      e.cocMaterial.focusRange = THREE.MathUtils.lerp(2.2, 4.5, w)
    }
  })

  return (
    <EffectComposer multisampling={0} stencilBuffer={false} depthBuffer>
      <DepthOfField
        ref={dofRef}
        target={[0, 0, 0]}
        worldFocusRange={3.5}
        bokehScale={2.0}
        height={480}
      />
      <Bloom mipmapBlur intensity={0.35} luminanceThreshold={0.88} luminanceSmoothing={0.3} />
      <SMAA />
    </EffectComposer>
  )
}

export default function Scene() {
  const focusRef = useRef(new THREE.Vector3(0, 0, 0))
  const frameRef = useRef(0)

  return (
    <>
      <GradientBackground />
      <Suspense fallback={null}>
        <Lights />
        <InteractiveAvatar focusRef={focusRef} frameRef={frameRef} />
      </Suspense>
      <Post2 focusRef={focusRef} frameRef={frameRef} />
    </>
  )
}