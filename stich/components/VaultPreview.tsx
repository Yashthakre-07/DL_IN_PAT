"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    DatabaseIcon, 
    CalendarIcon, 
    CpuIcon, 
    ZapIcon,
    ChevronRightIcon,
    ClockIcon,
    ArrowRightIcon
} from "lucide-react";
import Link from 'next/link';

export default function VaultPreview() {
    const [models, setModels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await axios.get("http://127.0.0.1:8000/api/v1/inference/models");
                if (res.data && res.data.length > 0) {
                    setModels(res.data.slice(0, 3));
                } else {
                    throw new Error("No data");
                }
            } catch (err) {
                console.error("Vault fetch failed, using internal registry mocks", err);
                setModels([
                    {
                        name: "PAQNET | small | 2026-05-10",
                        filename: "paqnet_small_20260510.pt",
                        architecture: "paqnet",
                        dataset: "small",
                        date_saved: "2026-05-10",
                        timestamp: "15:24:45",
                        metrics: { mae: 0.045, pearson: 0.920, best_val_huber: 9.578 }
                    },
                    {
                        name: "PAQNet Research Standard",
                        filename: "paqnet_standard_v1_20260510.pt",
                        architecture: "paqnet",
                        dataset: "standard_v1",
                        date_saved: "2026-05-10",
                        timestamp: "14:54:01",
                        metrics: { mae: 0.038, pearson: 0.945, best_val_huber: 8.573 }
                    }
                ]);
            }
            setLoading(false);
        };
        fetchModels();
    }, []);

    if (loading) return <div className="h-64 bg-slate-50 animate-pulse rounded-[48px]" />;

    return (
        <section className="w-full py-24 px-16 bg-slate-900 rounded-[64px] my-20 overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] -z-0" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] -z-0" />

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-end mb-16 gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Neural Artifact Registry</span>
                    </div>
                    <h2 className="text-6xl font-black text-white tracking-tighter">Model <span className="text-indigo-400">Vault</span></h2>
                    <p className="text-xl text-slate-400 font-medium max-w-xl italic">
                        "Secure storage for versioned weights, training hyper-parameters, and standardized performance metadata."
                    </p>
                </div>
                <Link href="/models">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-3xl font-black text-lg flex items-center gap-4 transition-all shadow-xl shadow-indigo-500/20"
                    >
                        Enter Full Repository <ArrowRightIcon className="w-6 h-6" />
                    </motion.button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
                {models.map((m, idx) => {
                    const styles = [
                        {
                            bg: "bg-gradient-to-br from-indigo-600/10 to-indigo-900/40",
                            border: "border-indigo-500/30",
                            glow: "group-hover:shadow-[0_0_40px_rgba(99,102,241,0.2)]",
                            accent: "text-indigo-400",
                            iconBg: "bg-indigo-500/20"
                        },
                        {
                            bg: "bg-gradient-to-br from-purple-600/10 to-purple-900/40",
                            border: "border-purple-500/30",
                            glow: "group-hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]",
                            accent: "text-purple-400",
                            iconBg: "bg-purple-500/20"
                        },
                        {
                            bg: "bg-gradient-to-br from-cyan-600/10 to-cyan-900/40",
                            border: "border-cyan-500/30",
                            glow: "group-hover:shadow-[0_0_40px_rgba(6,182,212,0.2)]",
                            accent: "text-cyan-400",
                            iconBg: "bg-cyan-500/20"
                        }
                    ][idx % 3];

                    return (
                        <motion.div
                            key={m.filename}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -12, scale: 1.02 }}
                            className={`
                                ${styles.bg} backdrop-blur-xl border-2 ${styles.border} 
                                p-10 rounded-[48px] transition-all duration-500 group relative
                                ${styles.glow}
                            `}
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div className={`w-20 h-20 ${styles.iconBg} rounded-[24px] flex items-center justify-center transition-all duration-500 group-hover:scale-110`}>
                                    <DatabaseIcon className={`w-10 h-10 ${styles.accent}`} />
                                </div>
                                <div className="text-right">
                                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2 justify-end">
                                        <CalendarIcon className="w-3.5 h-3.5" /> {m.date_saved}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter flex items-center gap-1 justify-end">
                                        <ClockIcon className="w-3.5 h-3.5" /> {m.timestamp?.replace('_', ':')}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-3xl font-black text-white mb-6 group-hover:text-white transition-colors truncate">
                                {m.name}
                            </h3>

                            <div className="space-y-4 mb-10">
                                <div className="flex items-center justify-between text-xs font-bold bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <span className="text-slate-500 uppercase tracking-widest">Architecture</span>
                                    <span className={`${styles.accent} font-black uppercase`}>{m.architecture}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <span className="text-slate-500 uppercase tracking-widest">Training Set</span>
                                    <span className="text-slate-300 font-black uppercase truncate max-w-[1400px]">{m.dataset || 'standard_v1'}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-8 border-t border-white/10">
                                {Object.entries(m.metrics || {}).map(([key, val]: [string, any]) => (
                                    <div key={key} className={`bg-white/5 px-4 py-2 rounded-xl text-[11px] font-black ${styles.accent} uppercase border border-white/5 shadow-inner`}>
                                        {key.replace(/_/g, ' ')}: <span className="text-white">{typeof val === 'number' ? val.toFixed(4) : val}</span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Animated Background Line */}
                            <div className={`absolute bottom-0 left-12 right-12 h-1 bg-gradient-to-r from-transparent via-${styles.accent.split('-')[1]}-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        </motion.div>
                    );
                })}

                {models.length === 0 && (
                     <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[40px]">
                        <p className="text-slate-500 font-black uppercase tracking-widest">No artifacts found in registry</p>
                     </div>
                )}
            </div>
        </section>
    );
}
