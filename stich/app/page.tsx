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
    <main className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
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
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 z-10 mb-20">
          {coreModules.map((m) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: m.delay }}
              whileHover={{ y: -10 }}
              className="h-full"
            >
              <Link href={m.link} className="block h-full">
                <Card className="h-full border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[40px] overflow-hidden bg-white p-12 hover:shadow-[0_30px_60px_rgba(16,185,129,0.1)] transition-all duration-300 group">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-emerald-600 transition-colors duration-300">
                      <div className="group-hover:text-white transition-colors duration-300">{m.icon}</div>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight leading-none group-hover:text-emerald-600 transition-colors">{m.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed text-lg mb-10 flex-1">{m.description}</p>
                    <div className="flex items-center text-emerald-600 font-black text-lg uppercase tracking-widest gap-4 group-hover:gap-6 transition-all mt-auto">
                       Open Module <ArrowRightIcon className="w-6 h-6" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Style 2: Research Modules (Indigo Bento) */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 z-10 mb-10">
          {researchModules.map((m) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: m.delay }}
              whileHover={{ scale: 1.02 }}
              className="h-full"
            >
              <Link href={m.link} className="block h-full">
                <div className="h-full border-4 border-slate-100 rounded-[48px] overflow-hidden bg-white hover:border-indigo-500 transition-all duration-500 group relative p-1 shadow-sm">
                   <div className="bg-slate-50 h-full rounded-[44px] p-12 flex flex-col md:flex-row items-center gap-10 group-hover:bg-indigo-50 transition-colors duration-500">
                      <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-xl border-4 border-indigo-50 group-hover:border-indigo-500 transition-all duration-500 flex-shrink-0">
                         <div className="group-hover:scale-110 transition-transform duration-500">{m.icon}</div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Knowledge Base</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">{m.title}</h3>
                        <p className="text-slate-500 font-bold leading-relaxed text-lg italic">"{m.description}"</p>
                        <div className="pt-4 flex items-center text-indigo-600 font-black text-sm uppercase tracking-[0.2em] gap-3">
                           Explore Repository <ArrowRightIcon className="w-5 h-5" />
                        </div>
                      </div>
                   </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Style 3: Model Vault (Dark Industrial - No Preview) */}
        <div className="w-full max-w-7xl mx-auto z-10 pt-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ y: -10 }}
          >
            <Link href="/models">
              <div className="bg-slate-900 rounded-[64px] p-16 border-4 border-slate-800 shadow-2xl relative overflow-hidden group">
                {/* Background Design Elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] -z-0 group-hover:bg-indigo-600/20 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[120px] -z-0" />
                
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-16">
                   <div className="flex-1 space-y-8">
                      <div className="flex items-center gap-4">
                         <div className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">
                            Secure Registry
                         </div>
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Storage</span>
                      </div>
                      
                      <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
                        Model <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Vault</span>
                      </h2>
                      
                      <p className="text-2xl text-slate-400 font-medium max-w-2xl leading-relaxed">
                        Access the full centralized repository of versioned neural weights, training hyper-parameters, and standardized performance metrics.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                         <div className="flex items-center gap-4 text-slate-500">
                            <ShieldCheckIcon className="w-6 h-6 text-indigo-400" />
                            <span className="text-xs font-black uppercase tracking-widest">Validated Assets</span>
                         </div>
                         <div className="flex items-center gap-4 text-slate-500">
                            <HistoryIcon className="w-6 h-6 text-indigo-400" />
                            <span className="text-xs font-black uppercase tracking-widest">Version Tracking</span>
                         </div>
                         <div className="flex items-center gap-4 text-slate-500">
                            <DatabaseIcon className="w-6 h-6 text-indigo-400" />
                            <span className="text-xs font-black uppercase tracking-widest">Secure Storage</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex-shrink-0">
                      <div className="w-48 h-48 bg-white/5 border-4 border-white/10 rounded-[48px] flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-400 transition-all duration-500 shadow-2xl relative">
                         <DatabaseIcon className="w-20 h-20 text-indigo-400 group-hover:text-white transition-all duration-500 group-hover:scale-110" />
                         <div className="absolute -bottom-4 -right-4 bg-emerald-600 p-4 rounded-2xl text-white shadow-xl group-hover:bg-white group-hover:text-emerald-600 transition-all duration-500">
                            <ArrowRightIcon className="w-8 h-8" />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Industrial Footer */}
      <footer className="bg-slate-950 text-white py-24 px-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <ActivityIcon className="text-emerald-500 w-8 h-8" />
                    <h2 className="text-3xl font-black tracking-tighter">PAT-IQA <span className="text-emerald-500">Research</span></h2>
                </div>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">Advancing photoacoustic tomography through automated, objective, and explainable image quality assessment.</p>
            </div>
            <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500">Tools</h3>
                    <ul className="space-y-4 text-sm font-bold text-slate-500">
                        <li><Link href="/comparator" className="hover:text-white transition-colors">Comparator</Link></li>
                        <li><Link href="/training" className="hover:text-white transition-colors">Training</Link></li>
                        <li><Link href="/diagnostics" className="hover:text-white transition-colors">XAI Tools</Link></li>
                    </ul>
                </div>
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500">Library</h3>
                    <ul className="space-y-4 text-sm font-bold text-slate-500">
                        <li><Link href="/models/architecture" className="hover:text-white transition-colors">Architectures</Link></li>
                        <li><Link href="/metrics" className="hover:text-white transition-colors">Metrics</Link></li>
                        <li><Link href="/models" className="hover:text-white transition-colors">Vault</Link></li>
                    </ul>
                </div>
            </div>
            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500">Status</h3>
                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-sm font-bold text-slate-500">Neural Engine: Active</span></div>
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">v2.1.0-RESEARCH • STITCH INDUSTRIAL</p>
            </div>
        </div>
      </footer>
    </main>
  );
}
