import LightRays from '../../components/LightRays'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="relative h-[600px] w-full">
      {/* Background rays */}
      <LightRays
        raysOrigin="top-center"
        raysColor="#00ffff"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.2}
        followMouse
        mouseInfluence={0.1}
        noiseAmount={0.1}
        distortion={0.05}
        className="custom-rays"
      />
      {/* Centered overlay content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
        <h2 className="mb-4 font-sans text-5xl font-bold text-white">
          Create dynamic forms with AI
        </h2>
        <p className="font-manrope mb-6 max-w-xl text-lg text-white">
          Instantly design, generate and deploy interactive forms powered by
          Thesys SDK
        </p>
        <Link href="https://github.com/Anmol-Baranwal" passHref>
          <button className="cursor-pointer rounded-lg bg-[#00ffff] px-6 py-3 font-semibold text-black shadow-lg transition hover:bg-cyan-400">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  )
}
