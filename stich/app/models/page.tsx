"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
    DatabaseIcon, 
    CalendarIcon, 
    CpuIcon, 
    FileTextIcon,
    RefreshCwIcon,
    SearchIcon,
    TagIcon,
    ActivityIcon,
    ChevronRightIcon,
    ZapIcon,
    Trash2Icon,
    Edit3Icon,
    ClockIcon,
    HomeIcon
} from "lucide-react";
import Link from 'next/link';

export default function ModelVaultPage() {
    const [models, setModels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [renamingModel, setRenamingModel] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);

    const handleRename = async (filename: string) => {
        if (!newName.trim()) return;
        setIsRenaming(true);
        try {
            await axios.patch(`http://127.0.0.1:8000/api/v1/inference/models/${filename}/rename`, {
                new_name: newName
            });
            await fetchModels();
            setRenamingModel(null);
            setNewName("");
        } catch (err) {
            console.error("Rename failed", err);
        }
        setIsRenaming(false);
    };

    const fetchModels = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/v1/inference/models");
            setModels(res.data);
        } catch (err: any) {
            console.error(err);
            setError("Connectivity Failure: Could not reach Neural Registry.");
        }
        setLoading(false);
    };

    const handleDelete = async (filename: string) => {
        if (!confirm("Are you sure you want to delete this model? This action cannot be undone.")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/api/v1/inference/models/${filename}`);
            await fetchModels();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    const filteredModels = models.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.architecture.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.dataset.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans pb-32">
            {/* Header Section */}
            <header className="px-16 pt-16 pb-12 max-w-[1900px] mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-end gap-10 border-b-2 border-slate-200 pb-10"
                >
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <Link href="/" className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">Home</Link>
                            <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                            <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Vault</span>
                        </div>
                        <h1 className="text-[5rem] font-black tracking-tighter leading-none mb-4 text-slate-900">
                           Model <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Vault</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-2xl">
                            A centralized registry for all trained photoacoustic architectures, weights, and performance metrics.
                        </p>
                    </div>
                    
                    <div className="flex gap-6">
                        <div className="relative group">
                            <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search registry..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white border-4 border-slate-100 rounded-2xl pl-16 pr-8 py-5 text-xl font-bold focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all w-[400px] shadow-sm"
                            />
                        </div>
                        <Link href="/">
                            <Button 
                                className="bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl px-10 py-10 shadow-xl flex items-center gap-4 transition-all active:scale-95 border-b-4 border-slate-950"
                            >
                                <HomeIcon className="w-8 h-8" />
                                <div className="flex flex-col items-start">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-70">Knowledge Base</span>
                                    <span className="text-xl font-black">Return Home</span>
                                </div>
                            </Button>
                        </Link>
                        <Button 
                            onClick={fetchModels}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-10 py-10 shadow-xl flex items-center gap-4 transition-all active:scale-95"
                        >
                            <RefreshCwIcon className={`w-8 h-8 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </motion.div>
            </header>

            <main className="px-16 max-w-[1900px] mx-auto">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-12 p-8 bg-red-50 border-4 border-red-100 rounded-3xl text-red-600 flex items-center gap-6"
                    >
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                            <RefreshCwIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black mb-1">Database Sync Failed</h3>
                            <p className="text-lg font-bold opacity-80">{error}</p>
                        </div>
                    </motion.div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[400px] bg-slate-100 animate-pulse rounded-[40px] border-4 border-slate-50" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        <AnimatePresence>
                            {filteredModels.map((m, idx) => (
                                <motion.div
                                    key={m.filename}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ y: -10 }}
                                >
                                    <Card className="border-4 border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[40px] overflow-hidden bg-white hover:shadow-[0_40px_80px_rgba(79,70,229,0.15)] transition-all duration-500 h-full group relative">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <CardContent className="p-10 flex flex-col h-full">
                                            {/* Top Metadata */}
                                            <div className="flex justify-between items-start mb-10">
                                                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-500 shadow-sm">
                                                    <DatabaseIcon className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors" />
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="bg-slate-100 rounded-xl px-4 py-2 flex items-center gap-2 border border-slate-200 shadow-sm">
                                                        <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                                                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">
                                                            {m.date_saved}
                                                        </span>
                                                    </div>
                                                    {m.timestamp && (
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                                            <ClockIcon className="w-3 h-3" />
                                                            <span>{m.timestamp.replace('_', ' ')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Identity */}
                                            <div className="mb-6">
                                                {renamingModel === m.filename ? (
                                                    <div className="flex flex-col gap-2">
                                                        <input 
                                                            autoFocus
                                                            value={newName}
                                                            onChange={(e) => setNewName(e.target.value)}
                                                            className="text-2xl font-black text-slate-900 border-b-4 border-indigo-500 outline-none w-full bg-transparent"
                                                            placeholder="New Name..."
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleRename(m.filename);
                                                                if (e.key === 'Escape') setRenamingModel(null);
                                                            }}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button 
                                                                disabled={isRenaming}
                                                                onClick={() => handleRename(m.filename)}
                                                                className="text-xs font-bold bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition-colors"
                                                            >
                                                                {isRenaming ? 'Saving...' : 'Save'}
                                                            </button>
                                                            <button 
                                                                onClick={() => setRenamingModel(null)}
                                                                className="text-xs font-bold bg-slate-200 text-slate-600 px-3 py-1 rounded hover:bg-slate-300 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between group/title">
                                                        <h3 className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate pr-4">
                                                            {m.name}
                                                        </h3>
                                                        <button 
                                                            onClick={() => {
                                                                setRenamingModel(m.filename);
                                                                setNewName(m.name);
                                                            }}
                                                            className="opacity-0 group-hover/title:opacity-100 p-2 hover:bg-indigo-50 rounded-lg transition-all"
                                                        >
                                                            <Edit3Icon className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 font-bold mb-10 font-mono text-sm break-all bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <FileTextIcon className="w-4 h-4 flex-shrink-0" />
                                                <span className="truncate">{m.filename}</span>
                                            </div>

                                            {/* Specs Grid */}
                                            <div className="grid grid-cols-2 gap-4 mb-10">
                                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 group-hover:border-indigo-100 transition-colors shadow-sm">
                                                    <div className="flex items-center gap-3 mb-2 text-slate-400">
                                                        <CpuIcon className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Base Arch</span>
                                                    </div>
                                                    <p className="text-lg font-black text-slate-800 uppercase">{m.architecture}</p>
                                                </div>
                                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 group-hover:border-indigo-100 transition-colors shadow-sm">
                                                    <div className="flex items-center gap-3 mb-2 text-slate-400">
                                                        <TagIcon className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Training Set</span>
                                                    </div>
                                                    <p className="text-lg font-black text-slate-800 uppercase truncate">{m.dataset || 'standard_v1'}</p>
                                                </div>
                                            </div>

                                            {/* Metrics */}
                                            <div className="mt-auto pt-8 border-t-2 border-slate-50">
                                                <div className="flex items-center gap-3 mb-4 text-slate-400">
                                                    <ActivityIcon className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Performance</span>
                                                </div>
                                                <div className="flex flex-wrap gap-4">
                                                    {Object.entries(m.metrics || {}).map(([key, val]: [string, any]) => (
                                                        <div key={key} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-black text-xs uppercase border border-indigo-100 shadow-sm">
                                                            {key.replace(/_/g, ' ')}: <span className="text-indigo-900">{typeof val === 'number' ? val.toFixed(4) : val}</span>
                                                        </div>
                                                    ))}
                                                    {Object.keys(m.metrics || {}).length === 0 && (
                                                        <span className="text-slate-400 italic font-bold">No metrics recorded</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Link */}
                                            <div className="mt-10 pt-8 border-t-2 border-slate-50 flex gap-4">
                                                <Link href={`/diagnostics?weight=${m.filename}&model=${m.architecture}`} className="flex-1">
                                                    <Button className="w-full bg-slate-900 hover:bg-indigo-600 text-white rounded-xl py-6 font-bold flex items-center justify-center gap-3 transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/20 active:scale-95">
                                                        <ZapIcon className="w-5 h-5" />
                                                        Deploy
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="outline"
                                                    onClick={() => handleDelete(m.filename)}
                                                    className="border-2 border-slate-100 hover:border-red-200 hover:bg-red-50 hover:text-red-600 rounded-xl p-6 transition-all"
                                                >
                                                    <Trash2Icon className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && filteredModels.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-40 text-center flex flex-col items-center"
                    >
                        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-10">
                            <FileTextIcon className="w-16 h-16 text-slate-200" />
                        </div>
                        <h3 className="text-4xl font-black text-slate-300 tracking-tight">No Models Found</h3>
                        <p className="text-xl font-bold text-slate-400 mt-4">Adjust your search filters or train a new model in the Studio.</p>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
