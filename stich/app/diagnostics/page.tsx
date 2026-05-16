"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    BinaryIcon, 
    ZapIcon, 
    ArrowRightIcon,
    AlertCircleIcon,
    MonitorIcon,
    RefreshCwIcon,
    WavesIcon,
    ImageIcon,
    GaugeIcon,
    SearchIcon
} from "lucide-react";

export default function DiagnosticsPage() {
    const [models, setModels] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/v1/inference/models")
            .then(res => setModels(res.data))
            .catch(err => {
                console.error(err);
                setError("Failed to fetch model registry from backend.");
            });
    }, []);

    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center font-black text-slate-200 text-6xl tracking-tighter animate-pulse">BOOTING X-LAB...</div>}>
            <DiagnosticsContent models={models} error={error} setError={setError} />
        </Suspense>
    );
}

function DiagnosticsContent({ models, error, setError }: { models: any[], error: string | null, setError: (e: string | null) => void }) {
    const searchParams = useSearchParams();
    const [image, setImage] = useState<File | null>(null);
    const [signal, setSignal] = useState<File | null>(null);
    const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || "paqnet");
    const [selectedWeight, setSelectedWeight] = useState(searchParams.get('weight') || "");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const m = searchParams.get('model');
        const w = searchParams.get('weight');
        if (m) setSelectedModel(m);
        if (w) setSelectedWeight(w);
    }, [searchParams]);

    const isDualInput = selectedModel === 'ynet' || selectedModel === 'fdynet';
    const isReconstruction = ['unet', 'fdunet', 'pixeldl', 'ynet', 'fdynet', 'pixelgan', 'pixelcgan'].includes(selectedModel);

    const runInference = async () => {
        if (!image || !selectedWeight) return;
        if (isDualInput && !signal) {
            setError("Dual-input models (Y-Net) require both an Image and a Signal file.");
            return;
        }
        
        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append("image", image);
        if (signal) formData.append("signal", signal);
        formData.append("model_name", selectedModel);
        formData.append("weight_file", selectedWeight);

        try {
            const res = await axios.post("http://127.0.0.1:8000/api/v1/inference/diagnose", formData);
            setResult(res.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Neural Engine Failure. Verify connectivity and weights.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans pb-32">
            <header className="px-16 pt-16 pb-12 max-w-[1900px] mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-end gap-10 border-b-2 border-slate-200/60 pb-12"
                >
                    <div>
                        <h1 className="text-[5.5rem] font-black tracking-tighter leading-none mb-6 text-slate-900">
                           Neural <span className="text-emerald-600">Diagnosis</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-black uppercase tracking-[0.2em]">
                           {isReconstruction ? "Deep Reconstruction & Artifact Removal" : "Quantitative Quality Intelligence"}
                        </p>
                    </div>
                    
                    <Button 
                        onClick={runInference} 
                        disabled={loading || !image || (isDualInput && !signal) || !selectedWeight}
                        className="bg-slate-950 hover:bg-slate-900 text-white rounded-[32px] px-16 py-12 text-2xl font-black transition-all disabled:opacity-30 shadow-2xl flex items-center gap-4 group"
                    >
                        {loading ? (
                            <RefreshCwIcon className="w-8 h-8 animate-spin" />
                        ) : (
                            <ZapIcon className="w-8 h-8 fill-emerald-500 group-hover:scale-110 transition-transform" />
                        )}
                        RUN DIAGNOSIS
                    </Button>
                </motion.div>
            </header>

            <div className="px-16 max-w-[1900px] mx-auto">
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 p-8 bg-red-50 border-4 border-red-100 rounded-[32px] flex items-center gap-6"
                        >
                            <AlertCircleIcon className="w-10 h-10 text-red-500 shrink-0" />
                            <p className="text-xl font-bold text-red-700">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
                    
                    {/* Parameters Column */}
                    <motion.div className="xl:col-span-4 space-y-10">
                        <div className="bg-white border-2 border-slate-200/50 rounded-[56px] p-12 shadow-2xl shadow-black/5 space-y-12">
                            <h3 className="text-2xl font-black text-slate-950 flex items-center gap-4 uppercase tracking-widest">
                                <BinaryIcon className="w-7 h-7 text-emerald-600" /> Parameters
                            </h3>
                            
                            <div className="space-y-10">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Neural Architecture</label>
                                    <select 
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-6 text-lg font-black focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all cursor-pointer appearance-none"
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                    >
                                        <option value="paqnet">PAQNet Core</option>
                                        <option value="iqdcnn">IQDCNN Multi</option>
                                        <option value="efficientnet">EfficientNet-B0</option>
                                        <option value="unet">U-Net Architecture</option>
                                        <option value="fdunet">FD-UNet Ultra</option>
                                        <option value="pixeldl">Pixel-DL Physics</option>
                                        <option value="ynet">Y-Net Dual Input</option>
                                        <option value="fdynet">FD-YNet Dense Fusion</option>
                                        <option value="pixelgan">PixelGAN Pro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Synaptic Weights</label>
                                    <select 
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-6 text-lg font-black focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all cursor-pointer appearance-none"
                                        value={selectedWeight}
                                        onChange={(e) => setSelectedWeight(e.target.value)}
                                    >
                                        <option value="">Select Weight Set...</option>
                                        {models.map(m => (
                                            <option key={m.filename} value={m.filename}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Primary Input (Image)</label>
                                        <div className="relative h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all overflow-hidden group">
                                            <Input 
                                                type="file" 
                                                onChange={e => setImage(e.target.files?.[0] || null)}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" 
                                            />
                                            <ImageIcon className={`w-10 h-10 mb-2 transition-colors ${image ? 'text-emerald-500' : 'text-slate-300'}`} />
                                            <p className="text-xs font-black text-slate-500 px-6 truncate w-full text-center">
                                                {image ? image.name : "LOAD RECONSTRUCTED IMAGE"}
                                            </p>
                                        </div>
                                    </div>

                                    {isDualInput && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="relative group"
                                        >
                                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 mb-3 block">Dual Input (Raw Signal)</label>
                                            <div className="relative h-40 bg-emerald-50/30 border-2 border-dashed border-emerald-100 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all overflow-hidden group">
                                                <Input 
                                                    type="file" 
                                                    onChange={e => setSignal(e.target.files?.[0] || null)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" 
                                                />
                                                <WavesIcon className={`w-10 h-10 mb-2 transition-colors ${signal ? 'text-emerald-500' : 'text-emerald-200'}`} />
                                                <p className="text-xs font-black text-emerald-700 px-6 truncate w-full text-center uppercase tracking-tighter">
                                                    {signal ? signal.name : "LOAD RAW SIGNAL DATA"}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Results Column */}
                    <div className="xl:col-span-8 relative min-h-[800px]">
                        <AnimatePresence mode="wait">
                            {result ? (
                                <motion.div 
                                    key="result" 
                                    initial={{ opacity: 0, scale: 0.98 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    className="space-y-12"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {/* Visualization Box */}
                                        <div className="bg-white border-2 border-slate-100 rounded-[64px] p-12 shadow-2xl shadow-black/5 flex flex-col">
                                            <h4 className="text-2xl font-black text-slate-950 mb-10 flex items-center gap-4">
                                                {result.prediction?.type === 'reconstruction' ? (
                                                    <><SearchIcon className="text-emerald-500" /> DEEP RECONSTRUCTION</>
                                                ) : (
                                                    <><ActivityIcon className="text-emerald-500" /> ACTIVATION MAP (CAM)</>
                                                )}
                                            </h4>
                                            
                                            <div className="flex-1 bg-slate-950 rounded-[48px] flex items-center justify-center overflow-hidden border-[12px] border-slate-900 shadow-inner">
                                                <motion.img 
                                                    initial={{ opacity: 0, scale: 1.05 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    src={`data:image/png;base64,${result.prediction?.type === 'reconstruction' ? result.prediction.image_base64 : result.heatmap_base64}`} 
                                                    className="w-full h-full object-contain" 
                                                />
                                            </div>
                                        </div>

                                        {/* Analytics Box */}
                                        <div className="bg-slate-950 rounded-[64px] p-16 shadow-2xl text-white flex flex-col justify-between border-2 border-white/5">
                                            <div>
                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                                                        <GaugeIcon className="w-6 h-6 text-emerald-500" />
                                                    </div>
                                                    <h4 className="text-3xl font-black tracking-tight uppercase">Analysis Matrix</h4>
                                                </div>
                                                <p className="text-lg font-medium text-slate-500 leading-relaxed mb-10">
                                                    {result.prediction?.type === 'reconstruction' 
                                                        ? "Neural engine has successfully processed the dual-domain inputs to generate an enhanced, artifact-free reconstruction."
                                                        : "The saliency map highlights localized features that the model weighted most heavily in its final quality assessment."
                                                    }
                                                </p>

                                                <div className="space-y-6">
                                                    {result.prediction?.type === 'reconstruction' ? (
                                                        <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Reconstruction Fidelity (PSNR)</p>
                                                            <div className="flex items-baseline gap-2">
                                                                <p className="text-7xl font-black text-emerald-400 font-mono tracking-tighter">
                                                                    {result.prediction.psnr.toFixed(2)}
                                                                </p>
                                                                <span className="text-xl font-black text-slate-700">dB</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Quality Score</p>
                                                            <p className="text-7xl font-black text-emerald-400 font-mono tracking-tighter">
                                                                {result.prediction.score.toFixed(6)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-8">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Model</p>
                                                    <p className="text-sm font-black text-white">{result.model_used.toUpperCase()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pipeline</p>
                                                    <p className="text-sm font-black text-emerald-500">OPTIMIZED</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="empty" 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-white border-4 border-dashed border-slate-200 rounded-[64px] flex flex-col items-center justify-center p-20 text-center"
                                >
                                    <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-10 shadow-inner">
                                        <ArrowRightIcon className="w-16 h-16 text-slate-200" />
                                    </div>
                                    <h3 className="text-5xl font-black text-slate-200 tracking-tighter mb-6 uppercase">Awaiting Neural Pulse</h3>
                                    <p className="text-2xl font-bold text-slate-400 max-w-lg leading-snug">Select your architecture and weights to initiate deep diagnostics.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
