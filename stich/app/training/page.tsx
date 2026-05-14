"use client";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    BrainIcon, 
    PlayIcon, 
    DatabaseIcon, 
    TrendingUpIcon,
    RefreshCwIcon,
    ArrowRightIcon,
    TerminalIcon,
    AlertCircleIcon,
    CheckCircle2Icon
} from "lucide-react";

export default function TrainingStudio() {
    const [dataset, setDataset] = useState<File | null>(null);
    const [modelType, setModelType] = useState("paqnet");
    const [epochs, setEpochs] = useState(10);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [lossData, setLossData] = useState<any[]>([]);
    const [status, setStatus] = useState("IDLE");
    const [error, setError] = useState<{message: string, details?: string} | null>(null);
    const [logs, setLogs] = useState<{time: string, msg: string, type: 'info' | 'error' | 'success'}[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const addLog = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { time, msg, type }]);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const startTraining = async () => {
        if (!dataset) return;
        setStatus("INITIALIZING");
        setError(null);
        setLossData([]);
        setLogs([]);
        addLog(`Initiating training for ${modelType} architecture...`);
        
        const formData = new FormData();
        formData.append("dataset", dataset);
        formData.append("model_name", modelType);
        formData.append("epochs", epochs.toString());

        try {
            const res = await axios.post("http://127.0.0.1:8000/api/v1/training/start", formData);
            setTaskId(res.data.task_id);
            addLog("Background task triggered successfully.", "success");
        } catch (err: any) {
            console.error("Training Initiation Error:", err);
            setStatus("ERROR");
            const detail = err.response?.data?.detail || err.message || "Failed to initiate training task.";
            setError({ message: "Task Initiation Failed", details: detail });
            addLog(`Error: ${detail}`, "error");
        }
    };

    useEffect(() => {
        if (!taskId) return;
        const ws = new WebSocket(`ws://127.0.0.1:8000/api/v1/training/ws/${taskId}`);
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.data?.message) {
                addLog(data.data.message, data.status === 'FAILURE' ? 'error' : data.status === 'SUCCESS' ? 'success' : 'info');
            }

            if (data.status === "TRAINING") {
                setStatus("TRAINING");
                if (data.data.epoch) {
                    setLossData(prev => {
                        // Avoid duplicates if WS sends same state
                        if (prev.length > 0 && prev[prev.length-1].epoch === data.data.epoch) return prev;
                        return [...prev, { 
                            epoch: data.data.epoch, 
                            loss: data.data.loss, 
                            val_loss: data.data.val_loss 
                        }];
                    });
                }
            } else if (data.status === "SUCCESS") {
                setStatus("COMPLETED");
                addLog("Training pipeline finished successfully.", "success");
                ws.close();
            } else if (data.status === "FAILURE") {
                setStatus("FAILED");
                setError({ 
                    message: data.data?.message || "Internal Server Error", 
                    details: data.data?.details 
                });
                addLog(`CRITICAL FAILURE: ${data.data?.message || 'Check server logs'}`, "error");
                ws.close();
            }
        };

        ws.onerror = () => {
            addLog("WebSocket connection error. Retrying...", "error");
        };

        return () => ws.close();
    }, [taskId]);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20">
            {/* Header Section */}
            <header className="px-8 lg:px-16 pt-12 pb-8 max-w-[1900px] mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8"
                >
                    <div>
                        <h1 className="text-6xl font-black tracking-tight text-slate-900 flex items-center gap-4">
                           Neural <span className="text-emerald-600">Studio</span>
                           {status !== "IDLE" && (
                               <span className="text-sm font-bold bg-slate-100 text-slate-500 px-4 py-1 rounded-full uppercase tracking-tighter align-middle">
                                   v2.4 Live
                               </span>
                           )}
                        </h1>
                        <p className="text-lg text-slate-500 font-medium mt-2">
                            Advanced Photoacoustic Image Quality Assessment Pipeline
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${
                            status === 'TRAINING' ? 'bg-emerald-500' : 
                            status === 'ERROR' || status === 'FAILED' ? 'bg-red-500' : 
                            status === 'COMPLETED' ? 'bg-blue-500' : 'bg-slate-300'
                        }`} />
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Status</p>
                            <p className="text-xl font-black text-slate-800 tracking-tight">{status}</p>
                        </div>
                    </div>
                </motion.div>
            </header>

            <div className="px-8 lg:px-16 max-w-[1900px] mx-auto">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex items-start gap-4"
                    >
                        <AlertCircleIcon className="w-8 h-8 text-red-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="text-xl font-bold text-red-700">{error.message}</h4>
                            <p className="text-red-600 font-medium mb-4">{error.details || "No further details provided."}</p>
                            {error.details && (
                                <div className="bg-red-900/10 p-4 rounded-xl font-mono text-xs text-red-800 overflow-x-auto max-h-40">
                                    {error.details}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* Config Panel */}
                    <div className="xl:col-span-4 space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm"
                        >
                            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-8">
                                <BrainIcon className="w-6 h-6 text-emerald-600" />
                                Configuration
                            </h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Architecture</label>
                                    <select 
                                        value={modelType}
                                        onChange={(e) => setModelType(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                    >
                                        <option value="paqnet">PAQNet Core (EfficientNet-B0)</option>
                                        <option value="iqdcnn">IQDCNN Multi-Task</option>
                                        <option value="unet">U-Net Architecture</option>
                                        <option value="fdunet">FD-UNet Architecture</option>
                                        <option value="pixeldl">Pixel-DL Physics</option>
                                        <option value="ynet">Y-Net Dual-Input</option>
                                        <option value="fdynet">FD-YNet Dense Fusion</option>
                                        <option value="pixelgan">PixelGAN Adversarial</option>
                                        <option value="pixelcgan">PixelCGAN Conditional</option>
                                        <option value="resnet50">ResNet-50 Baseline</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Epochs</label>
                                    <Input 
                                        type="number" 
                                        value={epochs}
                                        onChange={(e) => setEpochs(Math.max(1, parseInt(e.target.value) || 0))}
                                        className="bg-slate-50 border-slate-200 rounded-2xl py-6 font-bold text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Training Dataset</label>
                                    <div className="relative h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group overflow-hidden">
                                        <Input 
                                            type="file" 
                                            onChange={(e) => setDataset(e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full"
                                        />
                                        <DatabaseIcon className={`w-8 h-8 mb-2 transition-colors ${dataset ? 'text-emerald-500' : 'text-slate-300 group-hover:text-emerald-500'}`} />
                                        <p className="text-sm font-bold text-slate-500 text-center px-4 truncate w-full">
                                            {dataset ? dataset.name : "Drop ZIP Archive Here"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button 
                                onClick={startTraining}
                                disabled={!dataset || status === "TRAINING" || status === "INITIALIZING"}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-8 mt-8 text-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                            >
                                {status === "TRAINING" || status === "INITIALIZING" ? (
                                    <RefreshCwIcon className="w-6 h-6 animate-spin" />
                                ) : (
                                    <PlayIcon className="w-6 h-6" />
                                )}
                                Start Training Pipeline
                            </Button>
                        </motion.div>

                        {/* Terminal Logs */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 flex flex-col h-[400px]"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <TerminalIcon className="w-4 h-4" /> Live Progress Logs
                                </h3>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                                </div>
                            </div>
                            <div 
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 pr-2 custom-scrollbar"
                            >
                                {logs.length === 0 ? (
                                    <p className="text-slate-600 italic">Awaiting telemetry data...</p>
                                ) : (
                                    logs.map((log, i) => (
                                        <div key={i} className="flex gap-3">
                                            <span className="text-slate-600 shrink-0">[{log.time}]</span>
                                            <span className={`${
                                                log.type === 'error' ? 'text-red-400' : 
                                                log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
                                            }`}>
                                                {log.msg}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Analytics Area */}
                    <div className="xl:col-span-8 flex flex-col gap-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex-1 flex flex-col min-h-[600px]"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                    <TrendingUpIcon className="w-6 h-6 text-emerald-500" /> Convergence Tracking
                                </h2>
                                {lossData.length > 0 && (
                                    <div className="flex gap-4">
                                        {lossData[lossData.length - 1]?.loss !== undefined && (
                                            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100">
                                                Train: {lossData[lossData.length - 1].loss?.toFixed(6) || "0.000000"}
                                            </div>
                                        )}
                                        {lossData[lossData.length - 1]?.val_loss !== undefined && (
                                            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100">
                                                Val: {lossData[lossData.length - 1].val_loss?.toFixed(6) || "0.000000"}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 w-full min-h-[400px]">
                                <AnimatePresence mode="wait">
                                    {lossData.length > 0 ? (
                                        <motion.div 
                                            key="chart"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="h-full w-full"
                                        >
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={lossData}>
                                                    <defs>
                                                        <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                        </linearGradient>
                                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="epoch" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                                                    <YAxis stroke="#94a3b8" fontSize={12} tickMargin={10} />
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                    />
                                                    <Legend verticalAlign="top" height={36}/>
                                                    <Area name="Training Loss" type="monotone" dataKey="loss" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLoss)" />
                                                    <Area name="Validation Loss" type="monotone" dataKey="val_loss" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </motion.div>
                                    ) : (
                                        <div className="h-full w-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                                                <ArrowRightIcon className="w-10 h-10 text-slate-300" />
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-300 mb-4 tracking-tight">Telemetry Offline</h3>
                                            <p className="text-slate-400 font-medium max-w-sm">Start the training engine to visualize real-time performance metrics and convergence curves.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Summary Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Epoch Progress</p>
                                <p className="text-2xl font-black text-slate-800">
                                    {lossData.length > 0 ? `${lossData[lossData.length-1].epoch} / ${epochs}` : "--"}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Best Val Loss</p>
                                <p className="text-2xl font-black text-emerald-600">
                                    {lossData.length > 0 && lossData.some(d => d.val_loss !== undefined) 
                                        ? Math.min(...lossData.filter(d => d.val_loss !== undefined).map(d => d.val_loss)).toFixed(6) 
                                        : "--"}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Compute Device</p>
                                <p className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                    CUDA:0 <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold">ACTIVE</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
            `}</style>
        </div>
    );
}

