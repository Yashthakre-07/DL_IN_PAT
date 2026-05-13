"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, InfoIcon, BookOpenIcon, CalculatorIcon, SearchIcon, ChevronRightIcon, BrainCircuitIcon } from "lucide-react";

interface MetricDetail {
  name: string;
  fullName: string;
  definition: string;
  formula: string;
  interpretation: string;
  category?: "Full-Reference" | "No-Reference" | "Reduced-Reference" | "General";
}

const metricsData: MetricDetail[] = [
  {
    name: "PSNR",
    fullName: "Peak Signal-to-Noise Ratio",
    definition: "The ratio between the maximum possible power of a signal and the power of corrupting noise that affects the fidelity of its representation.",
    formula: "10 * log10(MAX_I^2 / MSE)",
    interpretation: "Higher value indicates better quality. Typically ranges from 30dB to 50dB for high-quality images.",
    category: "Full-Reference"
  },
  {
    name: "SSIM",
    fullName: "Structural Similarity Index",
    definition: "A method for measuring the similarity between two images based on luminance, contrast, and structure.",
    formula: "((2*μx*μy + c1)*(2*σxy + c2)) / ((μx^2 + μy^2 + c1)*(σx^2 + σy^2 + c2))",
    interpretation: "Range is [0, 1]. A value of 1 means perfect similarity.",
    category: "Full-Reference"
  },
  {
    name: "MS-SSIM",
    fullName: "Multi-Scale SSIM",
    definition: "Evaluates image quality across multiple resolutions, which is more robust than single-scale SSIM as it captures details at various scales.",
    formula: "L_M^α * Π (C_j^βj * S_j^γj)",
    interpretation: "Range [0, 1]. Captures human perception better than standard SSIM.",
    category: "Full-Reference"
  },
  {
    name: "IW-SSIM",
    fullName: "Information Content Weighted SSIM",
    definition: "Weights the SSIM index using information-theoretic weights to prioritize areas with more visual information.",
    formula: "Weighted pooling of local SSIM using info content maps.",
    interpretation: "More accurate than standard SSIM for complex scenes.",
    category: "Full-Reference"
  },
  {
    name: "S3IM",
    fullName: "Stochastic Structural Similarity Index",
    definition: "An extension of SSIM specifically designed for images containing stochastic textures or heavy noise patterns.",
    formula: "Combines spatial-spectral structural similarity for stochastic textures.",
    interpretation: "Higher values indicate better preservation of stochastic structures.",
    category: "Full-Reference"
  },
  {
    name: "HAARPSI",
    fullName: "Haar Wavelet Perceptual Similarity Index",
    definition: "A fast perceptual similarity index based on Haar wavelet features that captures high-frequency details efficiently.",
    formula: "Product of local similarity maps from Haar coefficients.",
    interpretation: "Excellent balance between speed and perceptual accuracy.",
    category: "Full-Reference"
  },
  {
    name: "FSIM",
    fullName: "Feature Similarity Index",
    definition: "Based on the premise that human vision understands images mainly according to their low-level features, specifically Phase Congruency (PC).",
    formula: "Sum(S_L * PC_max) / Sum(PC_max)",
    interpretation: "Range [0, 1]. High correlation with subjective quality scores.",
    category: "Full-Reference"
  },
  {
    name: "GMSD",
    fullName: "Gradient Magnitude Similarity Deviation",
    definition: "Uses gradient magnitude similarity to quantify image distortion, emphasizing that image gradients carry important structural information.",
    formula: "std(GMS_map) where GMS = (2*gm1*gm2 + c) / (gm1^2 + gm2^2 + c)",
    interpretation: "Lower deviation indicates higher perceived image quality.",
    category: "Full-Reference"
  },
  {
    name: "MS-GMSD",
    fullName: "Multi-Scale GMSD",
    definition: "Calculates Gradient Magnitude Similarity Deviation at multiple scales to improve performance across resolutions.",
    formula: "Standard deviation of multi-scale GMS maps.",
    interpretation: "Higher accuracy across various image sizes.",
    category: "Full-Reference"
  },
  {
    name: "VIF",
    fullName: "Visual Information Fidelity",
    definition: "An information-theoretic criterion that quantifies the information shared between a reference and a distorted image.",
    formula: "Information(Ref; Distorted) / Information(Ref)",
    interpretation: "Higher is better. Values > 1 can occur for enhanced images.",
    category: "Full-Reference"
  },
  {
    name: "UQI",
    fullName: "Universal Quality Index",
    definition: "Models image distortion as a combination of three factors: loss of correlation, luminance distortion, and contrast distortion.",
    formula: "Q = (4*σxy*μx*μy) / ((σx^2+σy^2)*(μx^2+μy^2))",
    interpretation: "Precursor to SSIM. Range [-1, 1]. 1 is perfect.",
    category: "Full-Reference"
  }
];

export function MetricsEncyclopedia({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [selectedMetricName, setSelectedMetricName] = useState<string>(metricsData[0].name);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedMetric = useMemo(() => 
    metricsData.find(m => m.name === selectedMetricName) || metricsData[0],
    [selectedMetricName]
  );

  const filteredMetrics = useMemo(() => 
    metricsData.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [searchQuery]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 bg-slate-50 rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] z-[101] overflow-hidden flex flex-col border border-white/20"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200/50">
                    <BookOpenIcon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Metrics <span className="text-indigo-600">Encyclopedia</span>
                    <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded-full border border-slate-200 font-bold uppercase tracking-tighter">v1.4 PRO</span>
                  </h2>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900 group"
              >
                <XIcon className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar List */}
              <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white flex flex-col">
                <div className="p-6 pb-2">
                  <div className="relative group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text"
                      placeholder="Search metrics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:border-indigo-500/30 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
                  {filteredMetrics.map((metric) => (
                    <button
                      key={metric.name}
                      onClick={() => setSelectedMetricName(metric.name)}
                      className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group ${
                        selectedMetricName === metric.name 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-2" 
                          : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-sm font-black tracking-tight ${selectedMetricName === metric.name ? "text-white" : "text-slate-900"}`}>
                          {metric.name}
                        </span>
                        <span className={`text-[10px] font-medium truncate max-w-[180px] ${selectedMetricName === metric.name ? "text-indigo-100" : "text-slate-400"}`}>
                          {metric.fullName}
                        </span>
                      </div>
                      <ChevronRightIcon className={`w-4 h-4 transition-transform ${selectedMetricName === metric.name ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`} />
                    </button>
                  ))}
                  {filteredMetrics.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                      <SearchIcon className="w-8 h-8 opacity-20" />
                      <p className="text-sm font-bold">No metrics found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content (Flash Card Area) */}
              <div className="flex-1 bg-slate-50/50 p-6 md:p-12 overflow-y-auto custom-scrollbar flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedMetric.name}
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="w-full max-w-3xl"
                  >
                    {/* Flash Card */}
                    <div className="bg-white rounded-[40px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden relative group">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <BrainCircuitIcon className="w-32 h-32" />
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-8 md:p-12 space-y-10 relative z-10">
                        {/* Title Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                              {selectedMetric.category || "Full-Reference"}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Algorithm ID: {selectedMetric.name.toLowerCase()}</span>
                          </div>
                          <div>
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-2">
                              {selectedMetric.name}
                            </h1>
                            <p className="text-lg md:text-xl font-bold text-indigo-600/80 italic">
                              {selectedMetric.fullName}
                            </p>
                          </div>
                        </div>

                        {/* Definition */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                            <InfoIcon className="w-3 h-3" /> Definition & Purpose
                          </div>
                          <p className="text-xl md:text-2xl text-slate-700 font-medium leading-relaxed">
                            {selectedMetric.definition}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                          {/* Formula */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px]">
                              <CalculatorIcon className="w-3 h-3" /> Mathematical Formula
                            </div>
                            <div className="bg-slate-950 p-6 rounded-3xl font-mono text-base md:text-lg text-indigo-300 overflow-x-auto shadow-2xl border border-white/5 relative">
                              <div className="absolute top-3 right-4 flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                              </div>
                              <code className="block mt-2">
                                {selectedMetric.formula}
                              </code>
                            </div>
                          </div>

                          {/* Interpretation */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-[0.2em] text-[10px]">
                              <BrainCircuitIcon className="w-3 h-3" /> Interpretation
                            </div>
                            <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl text-base md:text-lg text-slate-700 leading-relaxed font-semibold italic">
                              {selectedMetric.interpretation}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Signature */}
                      <div className="px-12 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Research Grade Model</span>
                        <div className="flex gap-4">
                          <span>Valid</span>
                          <span>Verified</span>
                          <span className="text-indigo-500 underline underline-offset-4 cursor-pointer hover:text-indigo-700 transition-colors">Documentation →</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            
            {/* Modal Bottom Bar */}
            <div className="px-8 py-4 bg-white border-t border-slate-200 flex justify-between items-center">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Ready</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Metrics: {metricsData.length}</span>
                </div>
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Stitch PAT-IQA • Industrial Standard
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
