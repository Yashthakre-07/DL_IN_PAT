"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    XIcon, 
    InfoIcon, 
    BookOpenIcon, 
    CalculatorIcon, 
    SearchIcon, 
    ChevronRightIcon, 
    BrainCircuitIcon 
} from "lucide-react";

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
    definition: "The ratio between the maximum possible power of a signal and the power of corrupting noise.",
    formula: "10 * log10(MAX_I^2 / MSE)",
    interpretation: "Higher is better. Typically 30dB to 50dB.",
    category: "Full-Reference"
  },
  {
    name: "SSIM",
    fullName: "Structural Similarity Index",
    definition: "Measures similarity based on luminance, contrast, and structure.",
    formula: "Combination of l(x,y), c(x,y), and s(x,y).",
    interpretation: "Range [0, 1]. 1 is perfect similarity.",
    category: "Full-Reference"
  },
  {
    name: "MS-SSIM",
    fullName: "Multi-Scale SSIM",
    definition: "Evaluates image quality across multiple resolutions.",
    formula: "Product of scale-specific SSIM indices.",
    interpretation: "More robust than single-scale SSIM.",
    category: "Full-Reference"
  },
  {
    name: "IW-SSIM",
    fullName: "Information Content Weighted SSIM",
    definition: "Weights SSIM index using information-theoretic weights.",
    formula: "Weighted pooling of local SSIM.",
    interpretation: "Accurate for complex textures.",
    category: "Full-Reference"
  },
  {
    name: "S3IM",
    fullName: "Stochastic Structural Similarity Index",
    definition: "Designed for images with heavy noise or stochastic patterns.",
    formula: "Spatial-spectral structural similarity.",
    interpretation: "Higher values indicate better texture preservation.",
    category: "Full-Reference"
  },
  {
    name: "HAARPSI",
    fullName: "Haar Wavelet Perceptual Similarity Index",
    definition: "Fast perceptual index based on Haar wavelet features.",
    formula: "Weighted Haar coefficient similarity.",
    interpretation: "Excellent balance of speed and accuracy.",
    category: "Full-Reference"
  },
  {
    name: "FSIM",
    fullName: "Feature Similarity Index",
    definition: "Uses low-level features like Phase Congruency (PC).",
    formula: "Weighted similarity of PC and Gradient Magnitude.",
    interpretation: "High correlation with human perception.",
    category: "Full-Reference"
  },
  {
    name: "GMSD",
    fullName: "Gradient Magnitude Similarity Deviation",
    definition: "Quantifies distortion using gradient magnitude similarity.",
    formula: "std(GMS_map).",
    interpretation: "Lower deviation indicates higher quality.",
    category: "Full-Reference"
  },
  {
    name: "MS-GMSD",
    fullName: "Multi-Scale GMSD",
    definition: "Calculates GMSD at multiple scales for resolution robustness.",
    formula: "Combined multi-scale GMS standard deviation.",
    interpretation: "Higher accuracy across various image sizes.",
    category: "Full-Reference"
  },
  {
    name: "VIF",
    fullName: "Visual Information Fidelity",
    definition: "Quantifies information shared between reference and distorted images.",
    formula: "Information(Ref; Dist) / Information(Ref).",
    interpretation: "Higher is better. Measures fidelity.",
    category: "Full-Reference"
  },
  {
    name: "UQI",
    fullName: "Universal Quality Index",
    definition: "Combination of correlation, luminance, and contrast distortion.",
    formula: "Q = (4*σxy*μx*μy) / ((σx^2+σy^2)*(μx^2+μy^2)).",
    interpretation: "Range [-1, 1]. 1 is perfect.",
    category: "Full-Reference"
  }
];

export default function MetricsEncyclopediaInline() {
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
    <div className="w-full h-[800px] bg-white border-4 border-slate-100 rounded-[48px] overflow-hidden shadow-2xl flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
              <BookOpenIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">Metrics Encyclopedia</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mathematical standards repository</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Total: {metricsData.length}
            </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 md:w-80 border-r border-slate-100 bg-white flex flex-col">
          <div className="p-4 border-b border-slate-50">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-indigo-500/30 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {filteredMetrics.map((m) => (
              <button
                key={m.name}
                onClick={() => setSelectedMetricName(m.name)}
                className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group ${
                  selectedMetricName === m.name 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                    : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-black ${selectedMetricName === m.name ? "text-white" : "text-slate-900"}`}>{m.name}</span>
                  <span className={`text-[10px] font-bold truncate max-w-[120px] ${selectedMetricName === m.name ? "text-indigo-100" : "text-slate-400"}`}>{m.fullName}</span>
                </div>
                <ChevronRightIcon className={`w-4 h-4 transition-transform ${selectedMetricName === m.name ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-50/50 overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMetric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {selectedMetric.category}
                </span>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{selectedMetric.name}</h2>
                <p className="text-xl font-bold text-indigo-600/60 italic">{selectedMetric.fullName}</p>
              </div>

              <div className="p-8 bg-white rounded-[32px] border-2 border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                   <InfoIcon className="w-3 h-3" /> Definition
                </div>
                <p className="text-xl text-slate-700 font-medium leading-relaxed">{selectedMetric.definition}</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-[10px]">
                     <CalculatorIcon className="w-3 h-3" /> Formula
                  </div>
                  <div className="bg-slate-900 p-6 rounded-3xl font-mono text-indigo-300 shadow-xl border border-white/5 overflow-x-auto">
                    <code>{selectedMetric.formula}</code>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-[10px]">
                     <BrainCircuitIcon className="w-3 h-3" /> Interpretation
                  </div>
                  <div className="bg-emerald-50/50 border-2 border-emerald-100 p-6 rounded-3xl text-slate-700 font-semibold italic">
                    {selectedMetric.interpretation}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
