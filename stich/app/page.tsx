"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { 
  LayersIcon, 
  BrainIcon, 
  ZapIcon, 
  ArrowRightIcon,
  ActivityIcon,
  CpuIcon,
  BookOpenIcon,
  DatabaseIcon,
  ShieldCheckIcon,
  HistoryIcon
} from "lucide-react";

export default function Home() {
  const coreModules = [
    {
      title: "Analytical Comparator",
      description: "Evaluate reconstructed images against 14 structural and perceptual metrics in a side-by-side diagnostic environment.",
      link: "/comparator",
      icon: <LayersIcon className="w-12 h-12 text-emerald-600" />,
      delay: 0.1
    },
    {
      title: "Training Studio",
      description: "Monitor neural network convergence, Huber loss optimization, and feature map evolution in real-time.",
      link: "/training",
      icon: <BrainIcon className="w-12 h-12 text-emerald-600" />,
      delay: 0.2
    },
    {
      title: "XAI Diagnostics",
      description: "Generate Grad-CAM saliency maps to interpret model attention and hidden layer feature extraction.",
      link: "/diagnostics",
      icon: <ZapIcon className="w-12 h-12 text-emerald-600" />,
      delay: 0.3
    }
  ];

  const researchModules = [
    {
      title: "Architecture Blueprints",
      description: "Interactive vertical decomposition of neural structures powering PAQNet and EfficientNet architectures.",
      link: "/models/architecture",
      icon: <CpuIcon className="w-10 h-10 text-indigo-600" />,
      delay: 0.4
    },
    {
      title: "Metrics Encyclopedia",
      description: "A comprehensive guide to 18 mathematical and perceptual standards used in image quality assessment.",
      link: "/metrics",
      icon: <BookOpenIcon className="w-10 h-10 text-indigo-600" />,
      delay: 0.5
    }
  ];

  return (
    <main className="min-h-screen bg-transparent text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
      {/* Minimal Navbar */}
      <nav className="flex justify-between items-center px-16 py-8 bg-transparent relative z-50">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
             <ActivityIcon className="text-emerald-400 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">PAT-IQA <span className="text-emerald-600 font-medium">Research</span></h1>
        </motion.div>
        
        <div className="hidden md:flex gap-12 text-sm font-bold text-slate-500 uppercase tracking-widest">
           <Link href="/comparator" className="hover:text-emerald-600 transition-colors">Comparator</Link>
           <Link href="/training" className="hover:text-emerald-600 transition-colors">Training</Link>
           <Link href="/diagnostics" className="hover:text-emerald-600 transition-colors">Diagnostics</Link>
           <Link href="/models" className="hover:text-emerald-600 transition-colors">Vault</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-16 py-20 relative overflow-hidden">
        <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-400 rounded-full blur-[150px] -z-10 pointer-events-none"
        />

        <div className="max-w-5xl mx-auto text-center z-10 mb-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <h2 className="text-[5rem] md:text-[7rem] font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
              Photoacoustic <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Intelligence</span>
            </h2>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }} className="text-2xl text-slate-500 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
            A high-fidelity research environment for developing and evaluating deep neural networks for photoacoustic tomography reconstruction.
          </motion.p>
        </div>

        {/* Style 1: Core Modules Grid (Emerald) */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 z-10 mb-20 relative">
          {coreModules.map((m) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: m.delay }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="h-full relative group perspective-1000"
            >
              <Link href={m.link} className="block h-full relative z-10">
                {/* Animated gradient border */}
                <div className="absolute -inset-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-[42px] opacity-0 group-hover:opacity-100 blur-md transition-all duration-500 group-hover:animate-pulse" />
                <div className="absolute -inset-[1px] bg-gradient-to-br from-emerald-400/50 to-white/10 rounded-[42px] opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                <Card className="relative h-full border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(16,185,129,0.15)] rounded-[40px] overflow-hidden bg-white/70 backdrop-blur-2xl transition-all duration-500 group-hover:bg-white/90">
                  <CardContent className="p-10 flex flex-col h-full relative z-20">
                    {/* Background blob for card */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 blur-[50px] rounded-full group-hover:bg-emerald-400/20 transition-colors duration-500" />
                    
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-emerald-100/50 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative z-10 group-hover:text-white transition-colors duration-500">{m.icon}</div>
                    </div>
                    
                    <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-500">
                      {m.title}
                    </h3>
                    <p className="text-slate-500 font-medium leading-relaxed text-lg mb-10 flex-1 relative z-10 group-hover:text-slate-600 transition-colors">
                      {m.description}
                    </p>
                    
                    <div className="flex items-center text-slate-400 font-black text-sm uppercase tracking-[0.2em] gap-4 group-hover:text-emerald-600 transition-colors duration-500 mt-auto">
                       Open Module 
                       <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 group-hover:translate-x-2 transition-all duration-500">
                          <ArrowRightIcon className="w-5 h-5" />
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Style 2: Research Modules (Indigo Bento) */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 z-10 mb-20 relative">
          {researchModules.map((m) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: m.delay }}
              whileHover={{ scale: 1.03 }}
              className="h-full relative group"
            >
              <Link href={m.link} className="block h-full relative z-10">
                {/* Glowing Aura */}
                <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-[48px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="h-full border border-white/60 shadow-[0_8px_40px_rgb(0,0,0,0.06)] rounded-[48px] overflow-hidden bg-white/60 backdrop-blur-3xl hover:border-indigo-300/50 transition-all duration-500 relative p-2 group">
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                   
                   <div className="relative z-10 bg-gradient-to-b from-white/80 to-white/40 h-full rounded-[40px] p-10 lg:p-12 flex flex-col md:flex-row items-center gap-10 border border-white/80 group-hover:shadow-inner transition-all duration-500">
                      
                      <div className="w-28 h-28 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[32px] flex items-center justify-center shadow-[0_10px_30px_rgba(99,102,241,0.15)] border border-indigo-100/50 group-hover:shadow-[0_20px_40px_rgba(99,102,241,0.3)] transition-all duration-500 flex-shrink-0 relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                         <div className="relative z-10 group-hover:text-white transition-colors duration-500 group-hover:scale-110">{m.icon}</div>
                      </div>
                      
                      <div className="flex-1 space-y-5 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 inline-flex bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100/50">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Knowledge Base</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tight leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-500">
                          {m.title}
                        </h3>
                        <p className="text-slate-500 font-medium leading-relaxed text-lg">
                          "{m.description}"
                        </p>
                        <div className="pt-2 flex items-center justify-center md:justify-start text-slate-400 font-black text-sm uppercase tracking-[0.2em] gap-3 group-hover:text-indigo-600 transition-colors duration-500">
                           Explore Repository 
                           <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                        </div>
                      </div>
                   </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* God-Level Vault Section: The Neural Core */}
        <div className="w-full max-w-7xl mx-auto z-10 pt-32 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 100 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/models" className="block group px-4 lg:px-0">
              <div className="relative rounded-[3rem] overflow-hidden bg-[#030712] border border-white/5 shadow-[0_0_150px_rgba(79,70,229,0.15)] transition-all duration-1000 group-hover:shadow-[0_0_200px_rgba(79,70,229,0.3)]">
                
                {/* Layer 1: Ambient Void Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#030712] to-[#030712]" />
                
                {/* Layer 2: Animated Noise Texture */}
                <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

                {/* Layer 3: Roaming Laser Lines (CSS Animation) */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div 
                        animate={{ y: ['-100%', '200%'] }} 
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} 
                        className="w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent shadow-[0_0_20px_rgba(52,211,153,0.8)]" 
                    />
                </div>

                {/* Layer 4: Interactive Core Container */}
                <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between p-10 md:p-20 gap-16 min-h-[600px]">
                  
                  {/* Left Column: Typography & HUD */}
                  <div className="flex-1 space-y-10 relative">
                    
                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl group-hover:bg-white/10 transition-colors duration-700 shadow-xl">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)]"></span>
                        </div>
                        <span className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Neural Registry Active</span>
                    </div>

                    {/* God-Tier Typography */}
                    <div className="space-y-2">
                        <h2 className="text-[5rem] sm:text-[6rem] lg:text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 tracking-tighter leading-[0.85] relative">
                            MODEL
                            {/* Outline effect on hover */}
                            <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-md mix-blend-screen">MODEL</span>
                        </h2>
                        <h2 className="text-[5rem] sm:text-[6rem] lg:text-[8rem] font-black tracking-tighter leading-[0.85] text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.15)' }}>
                            VAULT
                        </h2>
                    </div>

                    <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl leading-relaxed border-l-4 border-indigo-500/30 pl-8 group-hover:border-indigo-400 transition-colors duration-700">
                        The ultimate centralized nexus. Securely access versioned neural weights, physics-informed priors, and standardized PAT-IQA performance benchmarks.
                    </p>

                    {/* Futuristic HUD Stats */}
                    <div className="flex flex-wrap gap-8 pt-6">
                        {[
                            { icon: ShieldCheckIcon, label: "Validated", value: "Assets", color: "text-emerald-400" },
                            { icon: HistoryIcon, label: "Version", value: "Tracking", color: "text-indigo-400" },
                            { icon: DatabaseIcon, label: "Secure", value: "Sharding", color: "text-purple-400" }
                        ].map((stat, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className={`mt-1 ${stat.color}`}>
                                    <stat.icon className="w-6 h-6 drop-shadow-[0_0_10px_currentColor]" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">{stat.label}</div>
                                    <div className="text-sm font-black uppercase tracking-widest text-slate-200">{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>

                  {/* Right Column: The Core Visualizer */}
                  <div className="w-full max-w-[350px] md:max-w-[450px] aspect-square relative flex items-center justify-center mx-auto xl:mx-0 mt-10 xl:mt-0">
                     
                     {/* Orbiting Rings */}
                     <motion.div 
                        animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border border-white/10 rounded-full border-t-indigo-500/50 shadow-[inset_0_0_60px_rgba(79,70,229,0.2)] group-hover:border-t-indigo-400 group-hover:shadow-[inset_0_0_100px_rgba(79,70,229,0.4)] transition-all duration-1000"
                     />
                     <motion.div 
                        animate={{ rotate: -360, scale: [1, 1.1, 1] }} 
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-8 border border-white/5 rounded-full border-b-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.1)] group-hover:border-b-emerald-400 group-hover:shadow-[0_0_80px_rgba(16,185,129,0.3)] transition-all duration-1000"
                     />
                     <motion.div 
                        animate={{ rotate: 180, scale: [0.9, 1, 0.9] }} 
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-16 border border-dashed border-white/20 rounded-full group-hover:border-white/40 transition-all duration-1000"
                     />

                     {/* The Central Core */}
                     <div className="relative z-10 w-48 h-48 rounded-full bg-[#030712] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-1000 ease-out">
                         
                         {/* Core Energy */}
                         <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 to-emerald-600/30 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                         <motion.div 
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute w-32 h-32 bg-indigo-500/40 rounded-full blur-[30px]" 
                         />
                         
                         <DatabaseIcon className="w-20 h-20 text-white relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] group-hover:drop-shadow-[0_0_40px_rgba(255,255,255,1)] transition-all duration-1000" />
                     </div>

                     {/* Action Button */}
                     <div className="absolute -bottom-4 -right-4 md:-bottom-10 md:-right-10 z-20">
                         <div className="relative group/btn cursor-pointer">
                             {/* Button Glow */}
                             <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-50 group-hover/btn:opacity-100 group-hover/btn:blur-2xl transition-all duration-500" />
                             {/* Button Surface */}
                             <div className="relative w-20 h-20 md:w-28 md:h-28 bg-slate-900 border-2 border-emerald-500/50 rounded-full flex items-center justify-center overflow-hidden">
                                 <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out" />
                                 <ArrowRightIcon className="w-8 h-8 md:w-12 md:h-12 text-emerald-500 relative z-10 group-hover/btn:text-white group-hover/btn:-rotate-45 transition-all duration-500" />
                             </div>
                         </div>
                     </div>

                  </div>

                </div>
              </div>
            </Link>
          </motion.div>
        </div>

      </section>


    </main>
  );
}
