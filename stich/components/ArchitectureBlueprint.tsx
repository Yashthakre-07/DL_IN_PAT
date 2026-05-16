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
    BoxIcon,
    DatabaseIcon,
    ChevronDownIcon,
    ShapesIcon,
    BinaryIcon,
    XIcon
} from "lucide-react";

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
    },
    pixeldl: {
        id: 'pixeldl',
        title: "Pixel-DL",
        subtitle: "Physics-Informed Model",
        summary: "Integrates wave propagation physics with dense neural networks for artifact removal.",
        layers: [
            { type: 'input', label: 'Channel Map', details: '64x128x128', description: 'Pixel-interpolated data from 64 sensors.' },
            { type: 'block', label: 'Dense Entry', details: 'Block k=8', description: 'Initial dense feature processing.' },
            { type: 'pool', label: 'Pooling', details: 'MaxPool 2x2', description: 'Spatial reduction.' },
            { type: 'block', label: 'Bottleneck', details: 'Deep Latent Space', description: 'Deepest feature representation.' },
            { type: 'block', label: 'Restoration', details: 'Synthesis', description: 'Upsampling and detail recovery.' },
            { type: 'output', label: 'Reconstructed', details: 'Residual Map', description: 'Final photoacoustic image output.' }
        ] as Layer[]
    },
    unet: {
        id: 'unet',
        title: "U-Net",
        subtitle: "Symmetric Encoder-Decoder",
        summary: "The standard U-Net architecture with contractive path for context and expansive path for precise localization.",
        layers: [
            { type: 'input', label: 'Input Image', details: '1x128x128', description: 'Grayscale photoacoustic reconstruction.' },
            { type: 'block', label: 'Encoder 1', details: '32 Filters', description: 'Initial feature extraction and spatial reduction.' },
            { type: 'block', label: 'Encoder 2', details: '64 Filters', description: 'Deeper spatial abstraction.' },
            { type: 'block', label: 'Bottleneck', details: '256 Filters', description: 'Compressed latent representation.' },
            { type: 'block', label: 'Decoder 1', details: '64 Filters', description: 'Upsampling with skip-connections from Encoder 2.' },
            { type: 'block', label: 'Decoder 2', details: '32 Filters', description: 'Upsampling with skip-connections from Encoder 1.' },
            { type: 'output', label: 'Output Map', details: '1x128x128', description: 'Denoised/Artifact-free reconstruction.' }
        ] as Layer[]
    },
    fdunet: {
        id: 'fdunet',
        title: "FD-UNet",
        subtitle: "Fully Dense U-Net",
        summary: "Utilizes Dense Blocks in both encoder and decoder to improve feature reuse and gradient flow.",
        layers: [
            { type: 'input', label: 'Input Image', details: '1x128x128', description: 'Input photoacoustic source.' },
            { type: 'conv', label: 'Init Conv', details: '3x3, 32 Filters', description: 'Initial feature projection.' },
            { type: 'block', label: 'Dense Enc 1', details: 'k=8, L=4', description: 'Dense connectivity block at the first level.' },
            { type: 'pool', label: 'Transition Down', details: '2x2 MaxPool', description: 'Spatial reduction and channel management.' },
            { type: 'block', label: 'Dense Enc 2', details: 'k=8, L=4', description: 'Deeper dense feature extraction.' },
            { type: 'block', label: 'Dense Bottleneck', details: 'k=8, L=4', description: 'Dense latent representation.' },
            { type: 'block', label: 'Dense Dec 1', details: 'Concatenated Skip', description: 'Upsampling followed by dense feature synthesis.' },
            { type: 'output', label: 'Residual Out', details: 'Λθ(x) + x', description: 'Learns the artifact residual function via identity mapping.' }
        ] as Layer[]
    },
    ynet: {
        id: 'ynet',
        title: "Y-Net",
        subtitle: "Dual-Branch Fusion",
        summary: "Parallel encoders for spatial (image) and temporal (signal) features fused into a common decoder.",
        layers: [
            { type: 'input', label: 'Image Branch', details: '1x128x128', description: 'Reconstructed image input.' },
            { type: 'input', label: 'Signal Branch', details: '1x64x512', description: 'Raw ultrasound sensor data.' },
            { type: 'block', label: 'Dual Encoders', details: 'Parallel CNN', description: 'Extracting features from both modalities simultaneously.' },
            { type: 'conv', label: 'Fusion Hub', details: '1x1 Conv, 128 Filters', description: 'Concatenation and feature alignment stage.' },
            { type: 'block', label: 'Decoder', details: 'Upsampling', description: 'Generating final image from fused feature vector.' },
            { type: 'output', label: 'Fused Output', details: 'Reconstruction', description: 'Physically consistent image reconstruction.' }
        ] as Layer[]
    },
    pixelgan: {
        id: 'pixelgan',
        title: "PixelGAN",
        subtitle: "Adversarial Translation",
        summary: "A generative adversarial network for pixel-to-pixel photoacoustic artifact removal.",
        layers: [
            { type: 'input', label: 'Source Image', details: 'Artifact-heavy', description: 'Initial poor-quality reconstruction.' },
            { type: 'conv', label: 'Encoder Stride-2', details: 'Downsampling', description: 'Projecting into latent adversarial space.' },
            { type: 'block', label: 'Adversarial Bottleneck', details: '16x16 Latent', description: 'Representing compressed image structure.' },
            { type: 'conv', label: 'Decoder Transpose', details: 'Upsampling', description: 'Synthesizing artifact-free pixels.' },
            { type: 'relu', label: 'Tanh Head', details: '[-1, 1] Range', description: 'Normalizing output for GAN consistency.' },
            { type: 'output', label: 'Generated', details: 'Fake Image', description: 'The artifact-removed image proposed by the Generator.' }
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

export default function ArchitectureBlueprint() {
    const [selectedModel, setSelectedModel] = useState<keyof typeof architectures>('paqnet');
    const [activeLayer, setActiveLayer] = useState<number | null>(null);

    const model = architectures[selectedModel];

    return (
        <div className="w-full h-[800px] bg-white border-4 border-slate-100 rounded-[48px] overflow-hidden shadow-2xl relative flex flex-col">
            <div className="p-8 border-b-2 border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black text-slate-900">Neural Architecture</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Interactive vertical blueprint</p>
                </div>
                <div className="flex gap-2 bg-white p-1.5 rounded-2xl border-2 border-slate-100">
                    <button 
                        onClick={() => setSelectedModel('paqnet')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${selectedModel === 'paqnet' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                        PAQNet
                    </button>
                    <button 
                        onClick={() => setSelectedModel('iqdcnn')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${selectedModel === 'iqdcnn' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                        IQDCNN
                    </button>
                    <button 
                        onClick={() => setSelectedModel('efficientnet')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${selectedModel === 'efficientnet' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                        EfficientNet
                    </button>
                    <button 
                        onClick={() => setSelectedModel('pixeldl')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${selectedModel === 'pixeldl' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                        PixelDL
                    </button>
                    <button 
                        onClick={() => setSelectedModel('fdunet')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${selectedModel === 'fdunet' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                        FD-UNet
                    </button>
                    <button 
                        onClick={() => setSelectedModel('ynet')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${selectedModel === 'ynet' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                        Y-Net
                    </button>
                    <button 
                        onClick={() => setSelectedModel('pixelgan')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${selectedModel === 'pixelgan' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                        PixelGAN
                    </button>

                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="flex flex-col items-center">
                    {model.layers.map((layer, idx) => (
                        <div key={idx} className="flex flex-col items-center w-full">
                            <motion.div
                                onClick={() => setActiveLayer(activeLayer === idx ? null : idx)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                    w-full h-24 rounded-3xl border-4 flex items-center justify-between px-8 cursor-pointer transition-all duration-300 relative
                                    ${activeLayer === idx ? "border-slate-900 bg-white shadow-xl -translate-y-1 z-10" : `border-slate-50 ${layerTypeMeta[layer.type].bg}`}
                                `}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white border-2 ${layerTypeMeta[layer.type].border}`}>
                                        {(() => {
                                            const Meta = layerTypeMeta[layer.type];
                                            return <Meta.icon className={`w-6 h-6 ${layerTypeMeta[layer.type].text}`} />;
                                        })()}
                                    </div>
                                    <div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${layerTypeMeta[layer.type].accent} text-white mb-1 inline-block`}>
                                            {layerTypeMeta[layer.type].subtext}
                                        </span>
                                        <h4 className="text-lg font-black text-slate-900 leading-none">{layer.label}</h4>
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono font-black text-slate-400">{layer.details.split(',')[0]}</span>
                            </motion.div>
                            
                            {idx < model.layers.length - 1 && (
                                <div className="py-2 opacity-20">
                                    <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Click Tooltip Overlay */}
            <AnimatePresence>
                {activeLayer !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-6 left-6 right-6 p-6 bg-slate-900 text-white rounded-[32px] shadow-2xl z-20 border-2 border-white/10"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/10`}>
                                    {(() => {
                                        const Meta = layerTypeMeta[model.layers[activeLayer].type];
                                        return <Meta.icon className="w-4 h-4 text-white" />;
                                    })()}
                                </div>
                                <h5 className="font-black text-lg">{model.layers[activeLayer].label}</h5>
                            </div>
                            <button 
                                onClick={() => setActiveLayer(null)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                            "{model.layers[activeLayer].description}"
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
