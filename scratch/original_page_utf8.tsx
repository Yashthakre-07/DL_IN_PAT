"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CpuIcon, 
    LayersIcon, 
    ZapIcon, 
    MaximizeIcon, 
    ActivityIcon, 
    EraserIcon, 
    HashIcon,
    ChevronRightIcon,
    ArrowLeftIcon,
    BoxIcon,
    DatabaseIcon,
    ChevronDownIcon,
    InfoIcon,
    MoveRightIcon,
    BinaryIcon,
    ShapesIcon
} from "lucide-react";
import Link from 'next/link';

interface Layer {
    type: 'input' | 'conv' | 'relu' | 'pool' | 'flatten' | 'fc' | 'dropout' | 'output' | 'block';
    label: string;
    details: string;
    description: string;
}

const architectures = {
    paqnet: {
        id: 'paqnet',
        title: "PAQNet",
        subtitle: "Photoacoustic Quality Network",
        summary: "Specialized CNN architecture for regression-based image quality assessment in photoacoustic tomography.",
        layers: [
            { type: 'input', label: 'Input Source', details: '1x128x128 Grayscale Tensor', description: 'The raw reconstructed photoacoustic image is normalized and fed into the network as a single-channel spatial tensor.' },
            { type: 'conv', label: 'Conv2D Block 1', details: '5x5 Kernel, 32 Filters, Padding 2', description: 'Primary feature extraction using a large receptive field (5x5) to capture initial structural patterns and edge artifacts.' },
            { type: 'relu', label: 'ReLU Activation', details: 'Non-linear mapping', description: 'Applies the Rectified Linear Unit activation function, introducing non-linearity to allow the model to learn complex mapping functions.' },
            { type: 'pool', label: 'Max Pooling 1', details: '2x2 Window, Output: 32x64x64', description: 'Downsamples the feature maps by taking the maximum value in 2x2 windows, reducing spatial dimensionality and computation.' },
            { type: 'conv', label: 'Conv2D Block 2', details: '3x3 Kernel, 64 Filters, Padding 1', description: 'Second-level feature extraction focused on more complex structural features with an increased filter count.' },
            { type: 'relu', label: 'ReLU Activation', details: 'Non-linear mapping', description: 'Introduces further non-linearity after the second convolutional stage.' },
            { type: 'pool', label: 'Max Pooling 2', details: '2x2 Window, Output: 64x32x32', description: 'Continued spatial reduction to focus the network on higher-level semantic features.' },
            { type: 'conv', label: 'Conv2D Block 3', details: '3x3 Kernel, 128 Filters, Padding 1', description: 'Deep feature extraction targeting high-frequency artifacts common in limited-view tomography.' },
            { type: 'relu', label: 'ReLU Activation', details: 'Non-linear mapping', description: 'Ensures neurons only fire for significant feature activations at deep layers.' },
            { type: 'pool', label: 'Max Pooling 3', details: '2x2 Window, Output: 128x16x16', description: 'Reduces feature maps to a compact spatial representation before the final convolution stage.' },
            { type: 'conv', label: 'Conv2D Block 4', details: '3x3 Kernel, 256 Filters, Padding 1', description: 'Final high-capacity convolutional block extracting the most abstract representations of image quality.' },
            { type: 'relu', label: 'ReLU Activation', details: 'Non-linear mapping', description: 'Final non-linear processing of the convolutional output.' },
            { type: 'pool', label: 'Max Pooling 4', details: '2x2 Window, Output: 256x8x8', description: 'Final pooling before flattening. The output is a highly distilled 256-channel 8x8 representation.' },
            { type: 'flatten', label: 'Flatten Vector', details: '16,384 Feature Units', description: 'Converts the 3D feature tensor (256x8x8) into a 1D vector to prepare for the fully connected decision layers.' },
            { type: 'fc', label: 'Dense Stage 1', details: '128 Neurons, ReLU', description: 'First fully connected layer that combines global features to begin the final regression process.' },
            { type: 'dropout', label: 'Dropout Regularizer', details: 'Rate: 0.3', description: 'Randomly zeros 30% of activations during training to prevent overfitting and improve generalization.' },
            { type: 'fc', label: 'Dense Stage 2', details: '128 Neurons, ReLU', description: 'Second dense layer refining the feature vector before final output.' },
            { type: 'dropout', label: 'Dropout Regularizer', details: 'Rate: 0.3', description: 'Additional regularization to ensure robust quality scoring.' },
            { type: 'output', label: 'Regression Head', details: '1 Output Neuron (Linear)', description: 'The final neuron produces a single continuous scalar value representing the predicted quality score of the image.' },
        ] as Layer[]
    },
    iqdcnn: {
        id: 'iqdcnn',
        title: "IQDCNN",
        subtitle: "Deep Image Quality CNN",
        summary: "A high-capacity deep convolutional network optimized for broad-spectrum structural distortion analysis.",
        layers: [
            { type: 'input', label: 'Input Source', details: '1x128x128 Tensor', description: 'Standard input format for grayscale tomography images.' },
            { type: 'conv', label: 'Primary Conv', details: '5x5 Kernel, 32 Filters', description: 'Initial convolution focused on broad spatial features.' },
            { type: 'pool', label: 'Max Pooling 1', details: '3x3 Window, Stride 2', description: 'First downsampling step using a larger 3x3 window.' },
            { type: 'conv', label: 'Deep Conv 1', details: '5x5 Kernel, 32 Filters', description: 'Repetitive convolutional blocks to deepen the hierarchy.' },
            { type: 'pool', label: 'Max Pooling 2', details: '3x3 Window, Stride 2', description: 'Sequential spatial reduction.' },
            { type: 'conv', label: 'Deep Conv 2', details: '5x5 Kernel, 32 Filters', description: 'Capturing mid-level structural features.' },
            { type: 'pool', label: 'Max Pooling 3', details: '3x3 Window, Stride 2', description: 'Third pooling stage.' },
            { type: 'conv', label: 'Deep Conv 3', details: '5x5 Kernel, 32 Filters', description: 'Extracting deep feature correlations.' },
            { type: 'pool', label: 'Max Pooling 4', details: '3x3 Window, Stride 2', description: 'Final spatial condensation.' },
            { type: 'flatten', label: 'Flatten', details: 'Feature Aggregation', description: 'Vectorizing the latent space representation.' },
            { type: 'fc', label: 'Dense 1024', details: '1024 Units, ReLU', description: 'Extremely high capacity dense layer for detailed feature mapping.' },
            { type: 'dropout', label: 'Dropout Stage', details: 'Rate: 0.3', description: 'Standard regularization.' },
            { type: 'fc', label: 'Dense 1024', details: '1024 Units, ReLU', description: 'Second deep dense layer.' },
            { type: 'dropout', label: 'Dropout Stage', details: 'Rate: 0.3', description: 'Sequential regularization.' },
            { type: 'output', label: 'Final Output', details: 'Regression Scalar', description: 'Produces the final objective quality metric.' },
        ] as Layer[]
    },
    efficientnet: {
        id: 'efficientnet',
        title: "EfficientNet-B0",
        subtitle: "Scaled Feature Extractor",
        summary: "Leverages compound scaling and MBConv blocks for high-efficiency image quality assessment.",
        layers: [
            { type: 'input', label: 'Input Source', details: '1x128x128 Grayscale', description: 'Input adapted for grayscale photoacoustic data.' },
            { type: 'conv', label: 'Stem Conv', details: '3x3, Stride 2, 32 Filters', description: 'Initial feature projection into the EfficientNet space.' },
            { type: 'block', label: 'MBConv Stage 1', details: 'Inverted Residual + SE', description: 'Efficient bottleneck block with squeeze-and-excitation attention.' },
            { type: 'block', label: 'MBConv Stage 2', details: 'Expansion: 6, Stride 2', description: 'Dimensional expansion to capture complex features efficiently.' },
            { type: 'block', label: 'MBConv Stage 3', details: 'Expansion: 6', description: 'Intermediate feature refinement block.' },
            { type: 'block', label: 'MBConv Stage 4', details: 'Expansion: 6, Stride 2', description: 'High-level feature abstraction stage.' },
            { type: 'block', label: 'MBConv Stage 5', details: 'Expansion: 6', description: 'Near-bottleneck feature processing.' },
            { type: 'block', label: 'MBConv Stage 6', details: 'Expansion: 6, Stride 2', description: 'Final deep feature extraction blocks.' },
            { type: 'conv', label: 'Final Conv', details: '1x1 Conv, 1280 Filters', description: 'Projects extracted features into a high-dimensional space.' },
            { type: 'pool', label: 'Global Average Pool', details: 'Global Feature Pooling', description: 'Collapses spatial dimensions into a single feature vector.' },
            { type: 'fc', label: 'Regression Head', details: '128 Units, ReLU', description: 'Task-specific head for image quality scoring.' },
            { type: 'output', label: 'Final Output', details: 'Scalar Quality Index', description: 'Regression output for objective assessment.' },
        ] as Layer[]
    }
};

const layerTypeMeta = {
    input: { icon: DatabaseIcon, bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-900", accent: "bg-slate-400", subtext: "Data Entry", gradient: "from-slate-400 to-slate-600" },
    conv: { icon: LayersIcon, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900", accent: "bg-emerald-400", subtext: "Feature Map", gradient: "from-emerald-400 to-emerald-600" },
    relu: { icon: ActivityIcon, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", accent: "bg-amber-400", subtext: "Activation", gradient: "from-amber-400 to-amber-600" },
    pool: { icon: MaximizeIcon, bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-900", accent: "bg-rose-400", subtext: "Pooling", gradient: "from-rose-400 to-rose-600" },
    flatten: { icon: BoxIcon, bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-900", accent: "bg-indigo-400", subtext: "Vectorization", gradient: "from-indigo-400 to-indigo-600" },
    fc: { icon: HashIcon, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", accent: "bg-amber-400", subtext: "Dense", gradient: "from-amber-400 to-amber-600" },
    dropout: { icon: EraserIcon, bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-900", accent: "bg-slate-300", subtext: "Regularizer", gradient: "from-slate-300 to-slate-500" },
    output: { icon: ZapIcon, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", accent: "bg-blue-400", subtext: "Output", gradient: "from-blue-400 to-blue-600" },
    block: { icon: CpuIcon, bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-900", accent: "bg-cyan-400", subtext: "MB Block", gradient: "from-cyan-400 to-cyan-600" }
};

export default function ArchitecturePage() {
    const [selectedModel, setSelectedModel] = useState<keyof typeof architectures>('paqnet');
    const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);

    const model = architectures[selectedModel];

    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans pb-96 overflow-x-hidden relative">
            {/* Navigation Header */}
            <header className="px-16 pt-16 pb-12 max-w-[1900px] mx-auto relative z-20">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 border-b-2 border-slate-200 pb-10"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Link href="/models" className="p-3 bg-white border-2 border-slate-100 rounded-xl hover:border-slate-900 transition-all text-slate-400 hover:text-slate-900">
                                <ArrowLeftIcon className="w-6 h-6" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <Link href="/models" className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">Vault</Link>
                                <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                                <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Architecture Schematics</span>
                            </div>
                        </div>
                        <h1 className="text-7xl font-black tracking-tighter leading-none text-slate-900">
                           Structural <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Blueprint</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-2xl">
                           Interactive vertical decomposition of the neural structures powering PAQNet and related IQA models.
                        </p>
                    </div>

                    <div className="flex bg-white border-4 border-slate-100 rounded-[32px] p-2 shadow-2xl shadow-slate-200/50">
                        {Object.keys(architectures).map((key) => (
                            <button
                                key={key}
                                onClick={() => setSelectedModel(key as any)}
                                className={`px-10 py-4 rounded-2xl font-black text-lg transition-all ${
                                    selectedModel === key 
                                    ? "bg-slate-900 text-white shadow-lg" 
                                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                            >
                                {architectures[key as keyof typeof architectures].title}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </header>

            {/* Model Summary Overlay (Floating) */}
            <div className="px-16 max-w-[1900px] mx-auto mb-20">
                <motion.div 
                    key={selectedModel + "summary"}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-10 bg-white border-4 border-slate-100 rounded-[40px] shadow-xl max-w-3xl"
                >
                    <h2 className="text-5xl font-black text-slate-900 mb-4">{model.subtitle}</h2>
                    <p className="text-2xl text-slate-500 font-medium leading-relaxed">{model.summary}</p>
                </motion.div>
            </div>

            {/* Main Vertical Diagram */}
            <main className="max-w-[1400px] mx-auto px-16 flex flex-col items-center relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={selectedModel}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center w-full"
                    >
                        {model.layers.map((layer, idx) => (
                            <div key={`${selectedModel}-${idx}`} className="flex flex-col items-center w-full">
                                <motion.div
                                    onMouseEnter={() => setHoveredLayer(idx)}
                                    onMouseLeave={() => setHoveredLayer(null)}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.05, x: 20 }}
                                    className={`
                                        w-full max-w-[1000px] h-40 rounded-[48px] border-[6px] flex items-center justify-between px-16 cursor-help transition-all duration-300 relative group
                                        ${hoveredLayer === idx ? "shadow-[0_40px_100px_rgba(0,0,0,0.2)] border-slate-900 bg-white -translate-y-2 z-20" : `shadow-xl border-slate-100 ${layerTypeMeta[layer.type].bg}`}
                                    `}
                                >
                                    <div className="flex items-center gap-12">
                                        <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-xl bg-white border-4 ${layerTypeMeta[layer.type].border}`}>
                                            {(() => {
                                                const Meta = layerTypeMeta[layer.type];
                                                return <Meta.icon className={`w-12 h-12 ${layerTypeMeta[layer.type].text}`} />;
                                            })()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-4 mb-2">
                                                <span className={`text-[12px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-xl ${layerTypeMeta[layer.type].accent} text-white shadow-sm`}>
                                                    {layerTypeMeta[layer.type].subtext}
                                                </span>
                                                <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-200 pl-4">
                                                    Block #{idx + 1}
                                                </span>
                                            </div>
                                            <h3 className={`text-5xl font-black tracking-tighter ${hoveredLayer === idx ? "text-slate-900" : layerTypeMeta[layer.type].text}`}>
                                                {layer.label}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Dimensions</span>
                                            <p className="text-3xl font-black font-mono text-slate-900 opacity-90">{layer.details.split(',')[0]}</p>
                                        </div>
                                    </div>

                                    {/* Connection Line Indicator */}
                                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className={`w-6 h-6 rounded-full border-4 border-slate-900 ${layerTypeMeta[layer.type].bg}`} />
                                    </div>
                                </motion.div>
                                
                                {idx < model.layers.length - 1 && (
                                    <div className="py-6 flex flex-col items-center gap-2">
                                        <div className="w-1.5 h-16 bg-gradient-to-b from-slate-200 to-slate-400 rounded-full opacity-40" />
                                        <ChevronDownIcon className="w-6 h-6 text-slate-300 animate-bounce" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Flashcard Style Overlay */}
            <AnimatePresence>
                {hoveredLayer !== null && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-6 md:p-12"
                    >
                        <div className="absolute inset-0 bg-slate-950/40" />
                        
                        <motion.div
                            initial={{ scale: 0.8, rotateY: 30, y: 50, opacity: 0 }}
                            animate={{ scale: 1, rotateY: 0, y: 0, opacity: 1 }}
                            exit={{ scale: 0.8, rotateY: -30, y: 50, opacity: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 150 }}
                            className="relative w-full max-w-[900px] bg-white rounded-[64px] shadow-[0_64px_128px_-16px_rgba(0,0,0,0.5)] border-[12px] border-slate-900 pointer-events-auto flex flex-col items-center overflow-hidden"
                        >
                            {/* Card Header Decoration */}
                            <div className={`absolute top-0 left-0 right-0 h-6 bg-gradient-to-r ${layerTypeMeta[model.layers[hoveredLayer].type].gradient}`} />
                            
                            <div className="p-16 w-full flex flex-col items-center text-center">
                                <div className={`w-36 h-36 rounded-[48px] flex items-center justify-center mb-10 shadow-2xl bg-white border-4 ${layerTypeMeta[model.layers[hoveredLayer].type].border} relative`}>
                                    {(() => {
                                        const Meta = layerTypeMeta[model.layers[hoveredLayer].type];
                                        return <Meta.icon className={`w-20 h-20 ${layerTypeMeta[model.layers[hoveredLayer].type].text}`} />;
                                    })()}
                                    <div className="absolute -bottom-4 -right-4 bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl">
                                        {hoveredLayer + 1}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-12">
                                    <span className="text-sm font-black uppercase tracking-[0.6em] text-slate-400 block">
                                        {model.layers[hoveredLayer].type} module unit
                                    </span>
                                    <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">
                                        {model.layers[hoveredLayer].label}
                                    </h2>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-10 w-full mb-14">
                                    <div className="p-10 bg-slate-50 rounded-[40px] border-4 border-slate-100 flex flex-col items-center shadow-inner group">
                                        <ShapesIcon className="w-10 h-10 text-slate-400 mb-4 group-hover:scale-110 transition-transform" />
                                        <div className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-2">Technical Dimension</div>
                                        <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">{model.layers[hoveredLayer].details}</div>
                                    </div>
                                    <div className="p-10 bg-slate-50 rounded-[40px] border-4 border-slate-100 flex flex-col items-center shadow-inner group">
                                        <BinaryIcon className="w-10 h-10 text-slate-400 mb-4 group-hover:scale-110 transition-transform" />
                                        <div className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-2">Network Utility</div>
                                        <div className="text-4xl font-black text-slate-900 uppercase tracking-tight">{model.layers[hoveredLayer].subtext || model.layers[hoveredLayer].type}</div>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-10 top-0 text-6xl font-serif text-slate-200 italic">"</div>
                                    <p className="text-3xl md:text-4xl font-medium text-slate-600 leading-tight max-w-4xl italic px-4">
                                        {model.layers[hoveredLayer].description}
                                    </p>
                                    <div className="absolute -right-10 bottom-0 text-6xl font-serif text-slate-200 italic">"</div>
                                </div>

                                <div className="mt-16 flex items-center gap-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Active Module</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                        <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Weights Loaded</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="w-full bg-slate-900 py-6 px-16 flex justify-between items-center">
                                <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">
                                    Neural Flashcard Unit v2.0
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-white opacity-20" />
                                    <div className="w-2 h-2 rounded-full bg-white opacity-40" />
                                    <div className="w-2 h-2 rounded-full bg-white opacity-100" />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] bg-emerald-100/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] bg-blue-100/20 rounded-full blur-[120px]" />
                
                {/* Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ 
                    backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
                    backgroundSize: '60px 60px' 
                }} />
            </div>
            
            {/* Legend / Footer */}
            <footer className="fixed bottom-12 left-1/2 -translate-x-1/2 z-30 bg-slate-900 text-white px-12 py-6 rounded-full shadow-2xl border-4 border-slate-800 flex items-center gap-12 backdrop-blur-xl bg-opacity-90">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-slate-400 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Input</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Convolution</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-rose-400 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Pooling</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-amber-400 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Activation / FC</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-blue-400 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Output</span>
                </div>
            </footer>
        </div>
    );
}
