"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, InfoIcon, BookOpenIcon, CalculatorIcon, SearchIcon, ChevronRightIcon, BrainCircuitIcon, ArrowLeftIcon } from "lucide-react";
import Link from 'next/link';

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
    name: "S3IM",
    fullName: "Stochastic Structural Similarity Index",
    definition: "An extension of SSIM specifically designed for images containing stochastic textures or heavy noise patterns.",
    formula: "Combines spatial-spectral structural similarity for stochastic textures.",
    interpretation: "Higher values indicate better preservation of stochastic structures.",
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
    name: "MS-SSIM",
    fullName: "Multi-Scale SSIM",
    definition: "Evaluates image quality across multiple resolutions, which is more robust than single-scale SSIM as it captures details at various scales.",
    formula: "L_M^α * Π (C_j^βj * S_j^γj)",
    interpretation: "Range [0, 1]. Captures human perception better than standard SSIM.",
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
    name: "VIFP",
    fullName: "Visual Information Fidelity (Pixel Domain)",
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
  },
  {
    name: "VSI",
    fullName: "Visual Saliency-induced Index",
    definition: "Uses visual saliency (VS) to weight the local quality map, reflecting that human vision is more sensitive to salient regions.",
    formula: "Sum(S * VS_max) / Sum(VS_max)",
    interpretation: "Range [0, 1]. Excellent for images with clear focus points.",
    category: "Full-Reference"
  },
  {
    name: "SR-SIM",
    fullName: "Spectral Residual Similarity",
    definition: "Combines spectral residual and gradient similarity to assess quality, leveraging how our brain extracts features in the frequency domain.",
    formula: "S_SR^α * S_G^β",
    interpretation: "Focuses on visual saliency and structural preservation.",
    category: "Full-Reference"
  },
  {
    name: "CW-SSIM",
    fullName: "Complex Wavelet SSIM",
    definition: "A variation of SSIM that is insensitive to small spatial variations like translation, rotation, and scaling.",
    formula: "Computed in the steerable pyramid wavelet transform domain.",
    interpretation: "Ideal for evaluating reconstruction robustness against slight misalignments.",
    category: "Full-Reference"
  },
  {
    name: "BRISQUE",
    fullName: "Referenceless Image Spatial Quality Evaluator",
    definition: "A no-reference (blind) metric that uses scene statistics of locally normalized luminance to estimate distortion.",
    formula: "Regression on Mean Subtracted Contrast Normalized (MSCN) coefficients.",
    interpretation: "Lower scores indicate better quality (0-100 scale).",
    category: "No-Reference"
  },
  {
    name: "NIQE",
    fullName: "Natural Image Quality Evaluator",
    definition: "A completely blind metric that measures the 'distance' from a model of natural, undistorted images.",
    formula: "Distance between MVG models of natural vs test image patches.",
    interpretation: "Lower scores indicate more 'natural' looking images.",
    category: "No-Reference"
  },
  {
    name: "PIQE",
    fullName: "Perception-based Image Quality Evaluator",
    definition: "Blind metric that estimates quality by analyzing block-wise distortions without any training data.",
    formula: "Based on local variance and blockiness artifacts.",
    interpretation: "Lower scores indicate higher perceived quality.",
    category: "No-Reference"
  },
  {
    name: "TV",
    fullName: "Total Variation",
    definition: "Measures the overall smoothness of an image. High TV often indicates excessive noise or ringing artifacts.",
    formula: "Σ |I(i+1,j) - I(i,j)| + |I(i,j+1) - I(i,j)|",
    interpretation: "Used to quantify image noise or 'roughness'.",
    category: "General"
  },
  {
    name: "IWSSIM",
    fullName: "Information Content Weighted SSIM",
    definition: "Weights the SSIM index using information-theoretic weights to prioritize areas with more visual information.",
    formula: "Weighted pooling of local SSIM using info content maps.",
    interpretation: "More accurate than standard SSIM for complex scenes.",
    category: "Full-Reference"
  },
  {
    name: "MSGMSD",
    fullName: "Multi-Scale GMSD",
    definition: "Calculates Gradient Magnitude Similarity Deviation at multiple scales to improve performance across resolutions.",
    formula: "Standard deviation of multi-scale GMS maps.",
    interpretation: "Higher accuracy across various image sizes.",
    category: "Full-Reference"
  },
  {
    name: "HAARPSI",
    fullName: "Haar Wavelet Perceptual Similarity Index",
    definition: "A fast perceptual similarity index based on Haar wavelet features that captures high-frequency details efficiently.",
    formula: "Product of local similarity maps from Haar coefficients.",
    interpretation: "Excellent balance between speed and perceptual accuracy.",
    category: "Full-Reference"
  }
];

export default function MetricsPage() {
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
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="px-16 pt-16 pb-12 max-w-[1900px] mx-auto w-full">
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 border-b-2 border-slate-200 pb-10"
        >
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-3 bg-white border-2 border-slate-100 rounded-xl hover:border-slate-900 transition-all text-slate-400 hover:text-slate-900 shadow-sm">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">Home</Link>
                        <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                        <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Metrics Encyclopedia</span>
                    </div>
                </div>
                <h1 className="text-7xl font-black tracking-tighter leading-none text-slate-900">
                    Mathematical <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Standards</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-2xl">
                    The complete registry of 18 structural and perceptual metrics used for objective image quality assessment in photoacoustic tomography.
                </p>
            </div>
        </motion.div>
      </header>

      <main className="flex-1 flex px-16 max-w-[1900px] mx-auto w-full gap-16 pb-32">
        {/* Sidebar List */}
        <div className="w-full md:w-96 flex flex-col gap-6">
            <div className="relative group">
                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                    type="text"
                    placeholder="Search 18 metrics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-4 border-slate-100 rounded-[24px] py-4 pl-16 pr-8 text-lg font-bold focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                />
            </div>

            <div className="bg-white border-4 border-slate-100 rounded-[40px] p-4 flex-1 shadow-sm overflow-y-auto max-h-[750px] custom-scrollbar">
                <div className="space-y-2">
                    {filteredMetrics.map((metric) => (
                        <button
                            key={metric.name}
                            onClick={() => setSelectedMetricName(metric.name)}
                            className={`w-full text-left p-6 rounded-3xl transition-all flex items-center justify-between group ${
                                selectedMetricName === metric.name 
                                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-x-2" 
                                : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xl font-black ${selectedMetricName === metric.name ? "text-white" : "text-slate-900"}`}>{metric.name}</span>
                                    {metric.category === "No-Reference" && (
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${selectedMetricName === metric.name ? "bg-indigo-400 text-white" : "bg-slate-100 text-slate-400"}`}>NR</span>
                                    )}
                                </div>
                                <span className={`text-xs font-bold truncate max-w-[200px] ${selectedMetricName === metric.name ? "text-indigo-100" : "text-slate-400"}`}>{metric.fullName}</span>
                            </div>
                            <ChevronRightIcon className={`w-5 h-5 transition-all ${selectedMetricName === metric.name ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`} />
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Detail View */}
        <div className="flex-1">
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedMetric.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="bg-white border-4 border-slate-100 rounded-[56px] shadow-2xl p-16 md:p-24 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                         <BrainCircuitIcon className="w-64 h-64" />
                    </div>

                    <div className="relative z-10 space-y-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-[0.2em] rounded-xl">
                                    {selectedMetric.category}
                                </span>
                                <span className="w-2 h-2 rounded-full bg-slate-200" />
                                <span className="text-xs text-slate-400 font-black uppercase tracking-widest">Formal Standard</span>
                            </div>
                            <div>
                                <h2 className="text-[6rem] md:text-[8rem] font-black text-slate-900 tracking-tighter leading-[0.8] mb-4">{selectedMetric.name}</h2>
                                <p className="text-3xl font-black text-indigo-600/80 italic">{selectedMetric.fullName}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-slate-400 font-black uppercase tracking-[0.3em] text-xs">
                                <InfoIcon className="w-4 h-4" /> Comprehensive Definition
                            </div>
                            <p className="text-3xl text-slate-700 font-medium leading-relaxed max-w-4xl">
                                {selectedMetric.definition}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-12 pt-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-indigo-400 font-black uppercase tracking-[0.3em] text-xs">
                                    <CalculatorIcon className="w-4 h-4" /> Mathematical Proof
                                </div>
                                <div className="bg-slate-950 p-10 rounded-[40px] text-2xl font-mono text-indigo-300 shadow-2xl border-4 border-white/5 overflow-x-auto relative group">
                                    <div className="absolute top-6 right-8 flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    </div>
                                    <code className="block mt-4">{selectedMetric.formula}</code>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-emerald-500 font-black uppercase tracking-[0.3em] text-xs">
                                    <BrainCircuitIcon className="w-4 h-4" /> Perceptual Interpretation
                                </div>
                                <div className="bg-emerald-50/50 border-4 border-emerald-100 p-10 rounded-[40px] text-2xl text-slate-700 font-bold italic leading-snug">
                                    {selectedMetric.interpretation}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
