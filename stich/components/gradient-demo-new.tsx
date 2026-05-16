"use client"
import { BgGradient } from "@/components/ui/bg-gredient";

export default function DemoOne() {
  return (
    <div className="relative w-full h-screen">
      <BgGradient />
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tighter">
          Radial Gradient Background
        </h1>
      </div>
    </div>
  );
}
