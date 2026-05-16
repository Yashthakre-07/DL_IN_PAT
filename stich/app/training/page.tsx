"use client";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    PlayIcon, 
    DatabaseIcon, 
    RefreshCwIcon,
    TerminalIcon,
    SettingsIcon,
    ActivityIcon,
    ZapIcon,
    FlameIcon,
    TargetIcon,
    InfoIcon,
    SparklesIcon
} from "lucide-react";

export default function TrainingStudio() {
    const [dataset, setDataset] = useState<File | null>(null);
    const [modelType, setModelType] = useState("ynet");
    const [epochs, setEpochs] = useState(100);
    const [batchSize, setBatchSize] = useState(16);
    const [lr, setLr] = useState(0.0001);
    const [optimizer, setOptimizer] = useState("adam");
    const [lossFunc, setLossFunc] = useState("mse");
    
    const [taskId, setTaskId] = useState<string | null>(null);
    const [lossData, setLossData] = useState<any[]>([]);
    const [status, setStatus] = useState("IDLE");
    const [error, setError] = useState<{message: string, details?: string} | null>(null);
    const [logs, setLogs] = useState<{time: string, msg: string, type: 'info' | 'error' | 'success' | 'warning'}[]>([]);
    
    const scrollRef = useRef<HTMLDivElement>(null);

    // AI Recommendation Engine
    const getRecommendation = (type: string) => {
        const recommendations: Record<string, any> = {
            ynet: {
                epochs: 200, lr: 0.0001, opt: "adam", loss: "mse",
                reason: "Dual-domain fusion needs higher epochs to align signal & image. MSE is best for PSNR accuracy."
            },
            fdynet: {
                epochs: 250, lr: 0.00005, opt: "adam", loss: "mse",
                reason: "Dense connections require a lower learning rate for stable convergence."
            },
            unet: {
                epochs: 100, lr: 0.0002, opt: "adam", loss: "huber",
                reason: "Standard U-Net is robust. Huber loss helps if the reconstruction has artifacts."
            },
            pixelgan: {
                epochs: 150, lr: 0.0002, opt: "adam", loss: "l1",
                reason: "GANs produce sharper results with L1 loss than MSE."
            },
            fdunet: {
                epochs: 150, lr: 0.0001, opt: "adam", loss: "mse",
                reason: "Optimized for speed and high-fidelity artifact removal."
            }
        };
        return recommendations[type] || recommendations['unet'];
    };

    const rec = getRecommendation(modelType);

    const applyRecommendation = () => {
        setEpochs(rec.epochs);
        setLr(rec.lr);
        setOptimizer(rec.opt);
        setLossFunc(rec.loss);
        addLog(`Applied optimal parameters for ${modelType.toUpperCase()}.`, 'success');
    };

    const addLog = (msg: string, type: 'info' | 'error' | 'success' | 'warning' = 'info') => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { time, msg, type }]);
    };

    const startTraining = async () => {
        if (!dataset) return;
        setStatus("INITIALIZING");
        setError(null);
        setLossData([]);
        setLogs([]);
        addLog(`Igniting pipeline: ${modelType.toUpperCase()} | ${optimizer} | ${lossFunc}`, 'info');
        
        const formData = new FormData();
        formData.append("dataset", dataset);
        formData.append("model_name", modelType);
        formData.append("epochs", epochs.toString());
        formData.append("batch_size", batchSize.toString());
        formData.append("learning_rate", lr.toString());
        formData.append("optimizer_type", optimizer);
        formData.append("loss_type", lossFunc);

        try {
            const res = await axios.post("http://127.0.0.1:8000/api/v1/training/train", formData);
            setTaskId(res.data.task_id);
            addLog("Telemetry link established.", "success");
        } catch (err: any) {
            setStatus("ERROR");
            setError({ message: "Engine Failure", details: err.message });
        }
    };

    useEffect(() => {
        if (!taskId) return;
        const ws = new WebSocket(`ws://127.0.0.1:8000/api/v1/training/ws/${taskId}`);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.data?.message) addLog(data.data.message, data.status === 'FAILURE' ? 'error' : 'info');
            if (data.status === "TRAINING") {
                setStatus("TRAINING");
                if (data.data.epoch) setLossData(prev => [...prev, { epoch: data.data.epoch, loss: data.data.loss, val_loss: data.data.val_loss }]);
            } else if (data.status === "SUCCESS") setStatus("COMPLETED");
            else if (data.status === "FAILURE") setStatus("FAILED");
        };
        return () => ws.close();
    }, [taskId]);

    return (
        <div className="min-h-screen bg-slate-50/30 text-slate-900 font-sans pb-20">
            <header className="px-12 pt-16 pb-8 max-w-[1900px] mx-auto border-b border-slate-200 flex justify-between items-end">
                <div>
                    <h1 className="text-6xl font-black tracking-tighter leading-none mb-4 italic">
                        NEURAL <span className="text-emerald-600 not-italic">STUDIO</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest">v2.1 Experimental</div>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">Deep Reconstruction Laboratory</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-slate-100 flex items-center gap-6 min-w-[240px]">
                    <div className={`w-3 h-3 rounded-full ${status === 'TRAINING' ? 'bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Engine Status</p>
                        <p className="text-xl font-black tracking-tight leading-none">{status}</p>
                    </div>
                </div>
            </header>

            <div className="px-12 py-12 max-w-[1900px] mx-auto grid grid-cols-12 gap-12">
                
                {/* CONFIGURATION & ADVISORY */}
                <div className="col-span-4 space-y-8">
                    {/* Neural Advisory Panel */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-emerald-600 rounded-[48px] p-10 text-white shadow-2xl shadow-emerald-500/20"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-black flex items-center gap-3 italic">
                                <SparklesIcon className="w-6 h-6 not-italic" /> NEURAL ADVISORY
                            </h3>
                            <button 
                                onClick={applyRecommendation}
                                className="bg-white/20 hover:bg-white text-white hover:text-emerald-700 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-xl"
                            >
                                AUTO-TUNE
                            </button>
                        </div>
                        <p className="text-sm font-medium leading-relaxed opacity-90 mb-6">{rec.reason}</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 p-4 rounded-3xl border border-white/10">
                                <p className="text-[9px] font-black opacity-60 uppercase mb-1">Target Epochs</p>
                                <p className="text-lg font-black italic">{rec.epochs}</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-3xl border border-white/10">
                                <p className="text-[9px] font-black opacity-60 uppercase mb-1">Target Loss</p>
                                <p className="text-lg font-black italic uppercase">{rec.loss}</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="bg-white border border-slate-100 rounded-[56px] p-12 shadow-2xl shadow-black/5 space-y-10">
                        <h3 className="text-xl font-black flex items-center gap-4"><SettingsIcon className="text-emerald-500 w-5 h-5" /> PARAMETERS</h3>
                        
                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Target Model</label>
                                <select value={modelType} onChange={e => setModelType(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 font-black text-lg">
                                    <option value="paqnet">PAQNet Score</option>
                                    <option value="unet">U-Net Standard</option>
                                    <option value="fdunet">FD-UNet Ultra</option>
                                    <option value="ynet">Y-Net Dual Input</option>
                                    <option value="fdynet">FD-YNet Fusion</option>
                                    <option value="pixelgan">PixelGAN Pro</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Epochs</label>
                                    <Input type="number" value={epochs} onChange={e => setEpochs(parseInt(e.target.value))} className="bg-slate-50 border-none rounded-2xl py-8 text-center text-2xl font-black" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Batch</label>
                                    <Input type="number" value={batchSize} onChange={e => setBatchSize(parseInt(e.target.value))} className="bg-slate-50 border-none rounded-2xl py-8 text-center text-2xl font-black" />
                                </div>
                            </div>

                            <div className="bg-slate-950 p-10 rounded-[48px] border border-white/5 space-y-8">
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Learning Rate (LR)</label>
                                    <Input type="number" step="0.00001" value={lr} onChange={e => setLr(parseFloat(e.target.value))} className="bg-white/5 border-white/10 text-white rounded-xl py-6 font-mono font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={optimizer} onChange={e => setOptimizer(e.target.value)} className="bg-white/5 border-white/10 text-white rounded-xl p-4 text-[10px] font-black appearance-none">
                                        <option value="adam">ADAM</option>
                                        <option value="sgd">SGD</option>
                                        <option value="rmsprop">RMSprop</option>
                                    </select>
                                    <select value={lossFunc} onChange={e => setLossFunc(e.target.value)} className="bg-white/5 border-white/10 text-white rounded-xl p-4 text-[10px] font-black appearance-none uppercase">
                                        <option value="mse">MSE</option>
                                        <option value="l1">L1</option>
                                        <option value="huber">Huber</option>
                                    </select>
                                </div>
                            </div>

                            <div className="h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all group relative">
                                <Input type="file" onChange={e => setDataset(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" />
                                <DatabaseIcon className={`w-8 h-8 mb-2 ${dataset ? 'text-emerald-500' : 'text-slate-200'}`} />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate w-full px-8 text-center">{dataset ? dataset.name : "IMPORT DATASET"}</p>
                            </div>
                        </div>

                        <Button onClick={startTraining} disabled={!dataset || status === "TRAINING"} className="w-full bg-slate-950 hover:bg-emerald-600 text-white rounded-[32px] py-12 text-2xl font-black shadow-2xl flex gap-4 group transition-all">
                            {status === "TRAINING" ? <RefreshCwIcon className="animate-spin w-8 h-8" /> : <FlameIcon className="w-8 h-8 fill-current" />}
                            IGNITE ENGINE
                        </Button>
                    </div>
                </div>

                {/* TELEMETRY & LAB */}
                <div className="col-span-8 space-y-12">
                    <div className="bg-white border border-slate-100 rounded-[64px] p-16 shadow-2xl shadow-black/5 h-[650px] flex flex-col">
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-6 italic underline decoration-emerald-500 underline-offset-8">
                                <ActivityIcon className="text-emerald-500 w-8 h-8 not-italic" /> CONVERGENCE LAB
                            </h2>
                            {lossData.length > 0 && <div className="text-4xl font-black tracking-tighter text-slate-300">LOSS: {lossData[lossData.length-1].loss?.toFixed(6)}</div>}
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            {lossData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={lossData}>
                                        <defs>
                                            <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="epoch" stroke="#cbd5e1" fontSize={12} fontWeight="900" tickMargin={15} axisLine={false} />
                                        <YAxis stroke="#cbd5e1" fontSize={12} fontWeight="900" tickMargin={15} axisLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '32px', border: 'none', boxShadow: '0 40px 80px rgba(0,0,0,0.1)', fontWeight: '900' }} />
                                        <Area type="monotone" dataKey="loss" stroke="#10b981" strokeWidth={6} fill="url(#colorLoss)" />
                                        <Area type="monotone" dataKey="val_loss" stroke="#3b82f6" strokeWidth={3} fill="transparent" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center p-20 border-4 border-dashed border-slate-100 rounded-[48px] text-center bg-slate-50/50">
                                    <TargetIcon className="w-24 h-24 text-slate-100 mb-8" />
                                    <p className="text-2xl font-black text-slate-300 uppercase tracking-widest">Neural Telemetry Standby</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-950 rounded-[56px] p-12 shadow-2xl border-4 border-white/5 flex flex-col h-[350px]">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-4 mb-8"><TerminalIcon className="text-emerald-500 w-4 h-4" /> CONSOLE FEED</h3>
                        <div ref={scrollRef} className="flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-4 pr-6 scrollbar-hide">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-6 border-l-2 border-white/5 pl-6 group">
                                    <span className="text-slate-700 shrink-0 font-black opacity-50">[{log.time}]</span>
                                    <span className={`${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'} font-bold`}>
                                        {log.msg}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
