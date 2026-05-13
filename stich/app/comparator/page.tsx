"use client";
import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    ActivityIcon, 
    RefreshCwIcon,
    ArrowRightIcon,
    CheckIcon,
    ImagePlusIcon,
    BarChartIcon,
    BookOpenIcon,
    HomeIcon
} from "lucide-react";
import Link from 'next/link';

export default function ComparatorPage() {
    const [testFile, setTestFile] = useState<File | null>(null);
    const [refFile, setRefFile] = useState<File | null>(null);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
        "PSNR", "SSIM", "MS-SSIM", "IW-SSIM", "S3IM"
    ]);

    const availableMetrics = [
        "PSNR", "SSIM", "MS-SSIM", "IW-SSIM", "S3IM", "HAARPSI", "FSIM", "GMSD", "MS-GMSD", "VIF", "UQI"
    ];

    const toggleMetric = (metric: string) => {
        setSelectedMetrics(prev => 
            prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
        );
    };

    const handleRun = async () => {
        if (!testFile) return;
        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append("test_image", testFile);
        if (refFile) formData.append("reference_image", refFile);

        try {
            const res = await axios.post("http://127.0.0.1:8000/api/v1/comparator/evaluate", formData);
            setResults(res.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Connection failed. Ensure backend is running at 127.0.0.1:8000.");
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
                           Analytical <span className="text-emerald-600">Comparator</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-2xl">
                            Evaluate image reconstruction quality using state-of-the-art structural metrics and spatial error mapping.
                        </p>
                    </div>
                    
                    <Button 
                        onClick={handleRun} 
                        disabled={loading || !testFile}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-12 py-10 text-2xl font-bold transition-all disabled:opacity-50 shadow-xl shadow-emerald-500/20 flex items-center gap-4"
                    >
                        {loading ? (
                            <RefreshCwIcon className="w-8 h-8 animate-spin" />
                        ) : (
                            <ActivityIcon className="w-8 h-8" />
                        )}
                        Run Analysis
                    </Button>
                </motion.div>
            </header>

            <div className="px-16 max-w-[1900px] mx-auto">
                {error && (
                    <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 font-bold">
                        {error}
                    </div>
                )}
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
                    
                    {/* Left Column: Inputs & Parameters */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: 0.1 }}
                        className="space-y-12"
                    >
                        {/* Image Uploads */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Reconstructed Image</label>
                                <div className="relative h-64 bg-white border-4 border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:shadow-2xl transition-all group overflow-hidden">
                                    <Input 
                                        type="file" 
                                        onChange={e => setTestFile(e.target.files?.[0] || null)} 
                                        className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" 
                                    />
                                    <ImagePlusIcon className="w-16 h-16 text-slate-300 mb-4 group-hover:text-emerald-500 transition-colors group-hover:scale-110 duration-300" />
                                    <p className="text-xl font-bold text-slate-700 text-center px-4 truncate w-full">{testFile ? testFile.name : "Select Image"}</p>
                                    {testFile && <div className="absolute inset-0 bg-emerald-50/50 pointer-events-none" />}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Ground Truth (Optional)</label>
                                <div className="relative h-64 bg-white border-4 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all group overflow-hidden">
                                    <Input 
                                        type="file" 
                                        onChange={e => setRefFile(e.target.files?.[0] || null)} 
                                        className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" 
                                    />
                                    <ImagePlusIcon className="w-16 h-16 text-slate-300 mb-4 group-hover:text-emerald-500 transition-colors group-hover:scale-110 duration-300" />
                                    <p className="text-xl font-bold text-slate-500 text-center px-4 truncate w-full">{refFile ? refFile.name : "Select Reference"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Metric Selection */}
                        <div className="bg-white border-4 border-slate-100 rounded-3xl p-10 shadow-lg">
                            <div className="mb-8 flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Metrics Matrix</h3>
                                    <p className="text-slate-500 font-medium">Select the evaluation metrics for this audit.</p>
                                </div>
                                <div className="flex gap-3">
                                    <Link href="/">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="text-xs font-bold uppercase tracking-wider border-2 border-slate-200 hover:border-slate-900 rounded-xl px-4 flex items-center gap-2"
                                        >
                                            <HomeIcon className="w-4 h-4" />
                                            Return Home
                                        </Button>
                                    </Link>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setSelectedMetrics(availableMetrics)}
                                            className="text-xs font-bold uppercase tracking-wider border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-xl px-4"
                                        >
                                            Select All
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setSelectedMetrics([])}
                                            className="text-xs font-bold uppercase tracking-wider border-2 border-slate-200 hover:border-red-500 hover:text-red-600 rounded-xl px-4"
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {availableMetrics.map(m => (
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        key={m} 
                                        onClick={() => toggleMetric(m)}
                                        className={`flex items-center justify-between p-5 rounded-2xl font-bold text-lg transition-all border-2 ${selectedMetrics.includes(m) ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300"}`}
                                    >
                                        {m}
                                        {selectedMetrics.includes(m) && <CheckIcon className="w-6 h-6" />}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <div className="relative h-full min-h-[600px]">
                        <AnimatePresence mode="wait">
                            {results ? (
                                <motion.div 
                                    key="results" 
                                    initial={{ opacity: 0, x: 30, scale: 0.95 }} 
                                    animate={{ opacity: 1, x: 0, scale: 1 }} 
                                    transition={{ duration: 0.5, type: "spring" }}
                                    className="space-y-10"
                                >
                                    {/* Heatmap */}
                                    <div className="bg-white border-4 border-slate-100 rounded-3xl p-8 shadow-xl">
                                        <h4 className="text-3xl font-black text-slate-900 mb-6">Spatial Error Map</h4>
                                        <div className="bg-slate-100 rounded-2xl aspect-[16/9] flex items-center justify-center overflow-hidden">
                                            <motion.img 
                                                initial={{ opacity: 0, scale: 1.1 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.8 }}
                                                src={`data:image/png;base64,${results.heatmap_base64}`} 
                                                alt="Heatmap" 
                                                className="w-full h-full object-contain" 
                                            />
                                        </div>
                                    </div>

                                    {/* Metrics Results */}
                                    <div className="bg-slate-900 rounded-3xl p-12 shadow-2xl text-white">
                                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-800">
                                            <BarChartIcon className="w-10 h-10 text-emerald-400" />
                                            <h4 className="text-3xl font-black">Evaluation Results</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                                            {availableMetrics.filter(m => selectedMetrics.includes(m)).map((m, i) => {
                                                const val = results.metrics.Primary?.[m] ?? results.metrics.Secondary?.[m];
                                                if (val === undefined) return null;
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3 + (i * 0.05) }}
                                                        key={m} 
                                                        className="flex justify-between items-end border-b border-slate-800 pb-4"
                                                    >
                                                        <span className="font-bold text-xl text-slate-400">{m}</span>
                                                        <span className="text-4xl font-black font-mono text-emerald-400">
                                                            {Number(val).toFixed(4)}
                                                        </span>
                                                    </motion.div>
                                                );
                                            })}
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
                                    <h3 className="text-5xl font-black text-slate-300 tracking-tight mb-6">Awaiting Images</h3>
                                    <p className="text-2xl font-bold text-slate-400 max-w-md">Provide the images and select metrics to generate the structural audit.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Metrics info removed from here as per request */}
        </div>
    );
}
