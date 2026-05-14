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
    RefreshCwIcon
} from "lucide-react";

export default function DiagnosticsPage() {
    const [image, setImage] = useState<File | null>(null);
    const [models, setModels] = useState<any[]>([]);
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedWeight, setSelectedWeight] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/v1/inference/models")
            .then(res => setModels(res.data))
            .catch(err => {
                console.error(err);
                setError("Failed to fetch models from backend.");
            });
    }, []);

    return (
        <Suspense fallback={<div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-black text-slate-300 text-4xl uppercase tracking-widest">Synchronizing Vault...</div>}>
            <DiagnosticsContent models={models} error={error} setError={setError} />
        </Suspense>
    );
}

function DiagnosticsContent({ models, error, setError }: { models: any[], error: string | null, setError: (e: string | null) => void }) {
    const searchParams = useSearchParams();
    const [image, setImage] = useState<File | null>(null);
    const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || "");
    const [selectedWeight, setSelectedWeight] = useState(searchParams.get('weight') || "");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const m = searchParams.get('model');
        const w = searchParams.get('weight');
        if (m) setSelectedModel(m);
        if (w) setSelectedWeight(w);
    }, [searchParams]);

    const runInference = async () => {
        if (!image || !selectedWeight) return;
        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append("image", image);
        formData.append("model_name", selectedModel);
        formData.append("weight_file", selectedWeight);

        try {
            const res = await axios.post("http://127.0.0.1:8000/api/v1/inference/diagnose", formData);
            setResult(res.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Inference failed. Check backend logs.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans pb-32">
            {/* Clean Header */}
            <header className="px-16 pt-16 pb-12 max-w-[1900px] mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-end gap-10 border-b-2 border-slate-200 pb-10"
                >
                    <div>
                        <h1 className="text-[5rem] font-black tracking-tighter leading-none mb-4 text-slate-900">
                           XAI <span className="text-emerald-600">Diagnostics</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-2xl">
                            Interpret model decisions using Grad-CAM saliency mapping and retrieve final quality predictions.
                        </p>
                    </div>
                    
                    <Button 
                        onClick={runInference} 
                        disabled={loading || !image || !selectedWeight}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-12 py-10 text-2xl font-bold transition-all disabled:opacity-50 shadow-xl shadow-emerald-500/20 flex items-center gap-4"
                    >
                        {loading ? (
                            <RefreshCwIcon className="w-8 h-8 animate-spin" />
                        ) : (
                            <ZapIcon className="w-8 h-8" />
                        )}
                        Run Diagnosis
                    </Button>
                </motion.div>
            </header>

            <div className="px-16 max-w-[1900px] mx-auto">
                {error && (
                    <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 font-bold">
                        {error}
                    </div>
                )}
                
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-20">
                    
                    {/* Left Column: Config (4 cols) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: 0.1 }}
                        className="xl:col-span-4 space-y-10"
                    >
                        <div className="bg-white border-4 border-slate-100 rounded-3xl p-10 shadow-xl space-y-10">
                            <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                                <BinaryIcon className="w-8 h-8 text-emerald-600" />
                                Parameters
                            </h3>
                            
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Architecture</label>
                                    <select 
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-5 text-xl font-bold focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800"
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                    >
                                        <option value="">Select Architecture</option>
                                        <option value="paqnet">PAQNet Core</option>
                                        <option value="iqdcnn">IQDCNN Multi</option>
                                        <option value="efficientnet">EfficientNet-B0</option>
                                        <option value="unet">U-Net Architecture</option>
                                        <option value="fdunet">FD-UNet Architecture</option>
                                        <option value="pixeldl">Pixel-DL Physics</option>
                                        <option value="ynet">Y-Net Dual-Input</option>
                                        <option value="fdynet">FD-YNet Dense Fusion</option>
                                        <option value="pixelgan">PixelGAN Adversarial</option>
                                        <option value="pixelcgan">PixelCGAN Conditional</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Pre-trained Weights</label>
                                    <select 
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-5 text-xl font-bold focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800"
                                        value={selectedWeight}
                                        onChange={(e) => setSelectedWeight(e.target.value)}
                                    >
                                        <option value="">Select Registry</option>
                                        {models.map(m => (
                                            <option key={m.filename} value={m.filename}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Input Image</label>
                                    <div className="relative h-48 bg-white border-4 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all group overflow-hidden">
                                        <Input 
                                            type="file" 
                                            onChange={e => setImage(e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" 
                                        />
                                        <MonitorIcon className="w-12 h-12 text-slate-300 mb-3 group-hover:text-emerald-500 transition-colors" />
                                        <p className="text-lg font-bold text-slate-500 text-center px-4 truncate w-full">{image ? image.name : "Select Target Image"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Results (8 cols) */}
                    <div className="xl:col-span-8 relative h-full min-h-[700px]">
                        <AnimatePresence mode="wait">
                            {result ? (
                                <motion.div 
                                    key="result" 
                                    initial={{ opacity: 0, x: 30, scale: 0.95 }} 
                                    animate={{ opacity: 1, x: 0, scale: 1 }} 
                                    transition={{ duration: 0.5, type: "spring" }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-10 h-full"
                                >
                                    {/* Saliency Map */}
                                    <div className="bg-white border-4 border-slate-100 rounded-3xl p-10 shadow-xl flex flex-col">
                                        <h4 className="text-3xl font-black text-slate-900 mb-8">Attention Map</h4>
                                        <div className="flex-1 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden min-h-[400px]">
                                            <motion.img 
                                                initial={{ opacity: 0, scale: 1.1 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.8 }}
                                                src={`data:image/png;base64,${result.heatmap_base64}`} 
                                                className="w-full h-full object-contain" 
                                            />
                                        </div>
                                    </div>

                                    {/* Prediction Score */}
                                    <div className="bg-slate-900 rounded-3xl p-12 shadow-2xl text-white flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-4 mb-6">
                                                <AlertCircleIcon className="w-10 h-10 text-emerald-400" />
                                                <h4 className="text-3xl font-black">Quality Prediction</h4>
                                            </div>
                                            <p className="text-lg font-medium text-slate-400 leading-relaxed">
                                                The model's final estimated quality score based on the highlighted spatial features.
                                            </p>
                                        </div>

                                        <div className="bg-slate-800 rounded-3xl p-10 mt-10">
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Estimated Score</p>
                                            <p className="text-7xl font-black text-emerald-400 font-mono tracking-tighter">
                                                {result.score.toFixed(4)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="empty" 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-white border-4 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-20 text-center"
                                >
                                    <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-10">
                                        <ArrowRightIcon className="w-16 h-16 text-slate-300" />
                                    </div>
                                    <h3 className="text-5xl font-black text-slate-300 tracking-tight mb-6">Awaiting Parameters</h3>
                                    <p className="text-2xl font-bold text-slate-400 max-w-lg">Select architecture, weights, and image to run XAI diagnostics.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
