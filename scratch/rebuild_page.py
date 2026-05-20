import re

file_path = r"c:\Users\Admin\Documents\DL_IN_PAT\localhost\scratch\original_page_utf8.tsx"
output_path = r"c:\Users\Admin\Documents\DL_IN_PAT\localhost\stich\app\models\architecture\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add fdunet and unet to architectures
new_models = """
    unet: {
        id: 'unet',
        title: "U-Net",
        subtitle: "Classic Symmetric Network",
        summary: "The foundational U-shaped architecture featuring contracting and expanding paths with skip connections.",
        isUshaped: true,
        layers: [
            { type: 'input', label: 'Input Image', details: '1x572x572', description: 'Raw input tensor.' },
            { type: 'conv', label: 'Conv Block 1', details: '2x Conv 3x3, 64', description: 'First stage feature extraction.' },
            { type: 'pool', label: 'Max Pool 1', details: 'MaxPool 2x2', description: 'Spatial dimension reduction.' },
            { type: 'conv', label: 'Conv Block 2', details: '2x Conv 3x3, 128', description: 'Second stage feature extraction.' },
            { type: 'pool', label: 'Max Pool 2', details: 'MaxPool 2x2', description: 'Spatial dimension reduction.' },
            { type: 'conv', label: 'Conv Block 3', details: '2x Conv 3x3, 256', description: 'Third stage feature extraction.' },
            { type: 'pool', label: 'Max Pool 3', details: 'MaxPool 2x2', description: 'Spatial dimension reduction.' },
            { type: 'conv', label: 'Conv Block 4', details: '2x Conv 3x3, 512', description: 'Fourth stage feature extraction.' },
            { type: 'pool', label: 'Max Pool 4', details: 'MaxPool 2x2', description: 'Final spatial reduction to bottleneck.' },
            
            { type: 'block', label: 'Bottleneck', details: '2x Conv 3x3, 1024', description: 'The deepest feature representation layer.' },
            
            { type: 'upconv', label: 'Up-Conv 4', details: 'ConvTranspose 2x2, 512', description: 'First upsampling step.' },
            { type: 'conv', label: 'Conv Block 4', details: 'Concat + 2x Conv 3x3', description: 'Feature synthesis with skip connection.' },
            { type: 'upconv', label: 'Up-Conv 3', details: 'ConvTranspose 2x2, 256', description: 'Second upsampling step.' },
            { type: 'conv', label: 'Conv Block 3', details: 'Concat + 2x Conv 3x3', description: 'Feature synthesis with skip connection.' },
            { type: 'upconv', label: 'Up-Conv 2', details: 'ConvTranspose 2x2, 128', description: 'Third upsampling step.' },
            { type: 'conv', label: 'Conv Block 2', details: 'Concat + 2x Conv 3x3', description: 'Feature synthesis with skip connection.' },
            { type: 'upconv', label: 'Up-Conv 1', details: 'ConvTranspose 2x2, 64', description: 'Final upsampling step.' },
            { type: 'conv', label: 'Conv Block 1', details: 'Concat + 2x Conv 3x3', description: 'Final feature synthesis.' },
            { type: 'output', label: 'Output Map', details: 'Conv 1x1', description: 'Final segmentation or artifact map output.' }
        ] as Layer[]
    },
    fdunet: {
        id: 'fdunet',
        title: "FD-UNet",
        subtitle: "Fully Dense U-Net",
        summary: "Specialized U-Net architecture with dense connectivity for 2D sparse photoacoustic tomography artifact removal.",
        isUshaped: true,
        layers: [
            { type: 'input', label: 'Input Image', details: '1x128x128', description: 'Reconstructed PA image with artifacts.' },
            { type: 'block', label: 'Dense Block 1', details: 'k=8, Output: 64', description: 'First dense block extracting multi-scale features.' },
            { type: 'pool', label: 'Transition Down 1', details: 'MaxPool 64x64', description: 'Spatial reduction to 64x64.' },
            { type: 'block', label: 'Dense Block 2', details: 'k=8, Output: 96', description: 'Second dense block.' },
            { type: 'pool', label: 'Transition Down 2', details: 'MaxPool 32x32', description: 'Spatial reduction to 32x32.' },
            { type: 'block', label: 'Dense Block 3', details: 'k=8, Output: 128', description: 'Third dense block.' },
            { type: 'pool', label: 'Transition Down 3', details: 'MaxPool 16x16', description: 'Spatial reduction to 16x16.' },
            { type: 'block', label: 'Dense Block 4', details: 'k=8, Output: 160', description: 'Fourth dense block.' },
            { type: 'pool', label: 'Transition Down 4', details: 'MaxPool 8x8', description: 'Spatial reduction to 8x8.' },
            
            { type: 'block', label: 'Bottleneck', details: 'Dense Block k=8', description: 'The deepest feature representation at 8x8 resolution.' },
            
            { type: 'upconv', label: 'Up-Conv 4', details: 'ConvTranspose 16x16', description: 'Upsampling step 4.' },
            { type: 'block', label: 'Dense Block 4', details: 'k=8', description: 'Fourth dense block in expanding path.' },
            { type: 'upconv', label: 'Up-Conv 3', details: 'ConvTranspose 32x32', description: 'Upsampling step 3.' },
            { type: 'block', label: 'Dense Block 3', details: 'k=8', description: 'Third expanding dense block.' },
            { type: 'upconv', label: 'Up-Conv 2', details: 'ConvTranspose 64x64', description: 'Upsampling step 2.' },
            { type: 'block', label: 'Dense Block 2', details: 'k=8', description: 'Second expanding dense block.' },
            { type: 'upconv', label: 'Up-Conv 1', details: 'ConvTranspose 128x128', description: 'Upsampling step 1.' },
            { type: 'block', label: 'Dense Block 1', details: 'k=8', description: 'First expanding dense block.' },
            { type: 'output', label: 'Global Residual', details: 'y = Λθ(x) + x', description: 'Identity mapping for artifact suppression.' }
        ] as Layer[]
    },
"""

content = content.replace("const architectures = {", "const architectures: Record<string, any> = {\n" + new_models)

# 2. Add 'upconv' to Layer interface and layerTypeMeta
content = content.replace("type: 'input' | 'conv' | 'relu' | 'pool' | 'flatten' | 'fc' | 'dropout' | 'output' | 'block';", "type: 'input' | 'conv' | 'relu' | 'pool' | 'flatten' | 'fc' | 'dropout' | 'output' | 'block' | 'upconv';")

upconv_meta = "    upconv: { icon: ActivityIcon, bg: \"bg-lime-50\", border: \"border-lime-200\", text: \"text-lime-900\", accent: \"bg-lime-400\", subtext: \"Up-Conv\", gradient: \"from-lime-400 to-lime-600\" },\n"
content = content.replace("    block: { icon: CpuIcon", upconv_meta + "    block: { icon: CpuIcon")

# 3. Add renderLayer helper inside ArchitecturePage
render_layer_func = """
    const renderLayer = (layer: any, idx: number, isUshapeItem: boolean = false, isUshapeRight: boolean = false) => (
        <div key={`${selectedModel}-${idx}`} className={`flex flex-col items-center w-full ${isUshapeItem ? 'px-2' : ''}`}>
            <motion.div
                onMouseEnter={() => setHoveredLayer(idx)}
                onMouseLeave={() => setHoveredLayer(null)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isUshapeItem ? (idx < 10 ? idx : 18 - idx) * 0.05 : idx * 0.05 }}
                whileHover={{ scale: 1.05, x: isUshapeItem ? (isUshapeRight ? -10 : 10) : 20 }}
                className={`
                    w-full ${isUshapeItem ? 'h-[104px] rounded-[32px] border-[4px] px-6' : 'max-w-[1000px] h-40 rounded-[48px] border-[6px] px-16'} flex items-center justify-between cursor-help transition-all duration-300 relative group
                    ${hoveredLayer === idx ? `shadow-[0_40px_100px_rgba(0,0,0,0.2)] border-slate-900 bg-white -translate-y-2 z-20` : `shadow-xl border-slate-100 ${(layerTypeMeta as any)[layer.type].bg}`}
                `}
            >
                <div className="flex items-center gap-4 md:gap-12 w-full">
                    <div className={`${isUshapeItem ? 'w-14 h-14 rounded-[20px] border-[3px]' : 'w-24 h-24 rounded-[32px] border-4'} flex-shrink-0 flex items-center justify-center shadow-xl bg-white ${(layerTypeMeta as any)[layer.type].border}`}>
                        {(() => {
                            const Meta = (layerTypeMeta as any)[layer.type];
                            return <Meta.icon className={`${isUshapeItem ? 'w-6 h-6' : 'w-12 h-12'} ${(layerTypeMeta as any)[layer.type].text}`} />;
                        })()}
                    </div>
                    <div className="flex-grow overflow-hidden flex flex-col justify-center">
                        <div className="flex items-center gap-2 md:gap-4 mb-1">
                            <span className={`${isUshapeItem ? 'text-[10px] px-2 py-0.5' : 'text-[12px] px-4 py-1.5'} font-black uppercase tracking-[0.2em] md:tracking-[0.4em] rounded-xl ${(layerTypeMeta as any)[layer.type].accent} text-white shadow-sm truncate`}>
                                {(layerTypeMeta as any)[layer.type].subtext}
                            </span>
                            {!isUshapeItem && (
                                <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-200 pl-4">
                                    Block #{idx + 1}
                                </span>
                            )}
                        </div>
                        <h3 className={`${isUshapeItem ? 'text-xl' : 'text-3xl md:text-5xl'} font-black tracking-tighter truncate ${hoveredLayer === idx ? "text-slate-900" : (layerTypeMeta as any)[layer.type].text}`}>
                            {layer.label}
                        </h3>
                    </div>
                </div>
                {!isUshapeItem && (
                    <div className="text-right flex-shrink-0 ml-4 hidden md:block">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Dimensions</span>
                            <p className="text-3xl font-black font-mono text-slate-900 opacity-90">{layer.details.split(',')[0]}</p>
                        </div>
                    </div>
                )}
                {/* Connection Line Indicator */}
                <div className={`absolute ${isUshapeItem && isUshapeRight ? '-right-6' : '-left-12'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <div className={`w-6 h-6 rounded-full border-4 border-slate-900 ${(layerTypeMeta as any)[layer.type].bg}`} />
                </div>
            </motion.div>
            
            {!isUshapeItem && idx < model.layers.length - 1 && (
                <div className="py-6 flex flex-col items-center gap-2">
                    <div className="w-1.5 h-16 bg-gradient-to-b from-slate-200 to-slate-400 rounded-full opacity-40" />
                    <ChevronDownIcon className="w-6 h-6 text-slate-300 animate-bounce" />
                </div>
            )}
            {isUshapeItem && !isUshapeRight && idx < 9 && (
                <div className="py-2 flex flex-col items-center gap-1">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-slate-200 to-slate-400 rounded-full opacity-40" />
                    <ChevronDownIcon className="w-4 h-4 text-slate-300 opacity-70" />
                </div>
            )}
            {isUshapeItem && isUshapeRight && idx > 10 && (
                <div className="py-2 flex flex-col items-center gap-1">
                    <div className="w-1.5 h-6 bg-gradient-to-t from-slate-200 to-slate-400 rounded-full opacity-40" />
                </div>
            )}
        </div>
    );
"""

# Insert renderLayer inside ArchitecturePage component
content = content.replace("const model = architectures[selectedModel];", "const model = architectures[selectedModel];\n" + render_layer_func)

# 4. Replace the Main Vertical Diagram rendering block
new_main_block = """
            {/* Main Vertical Diagram */}
            <main className="max-w-[1600px] mx-auto px-4 md:px-16 flex flex-col items-center relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={selectedModel}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center w-full"
                    >
                        {model.isUshaped ? (
                            <div className="flex w-full justify-between items-stretch relative px-10">
                                {/* Horizontal Skip Connections SVG */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                    {[0, 2, 4, 6].map((i, arrowIdx) => (
                                        <motion.path 
                                            key={i}
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.4 }}
                                            transition={{ delay: 1 + arrowIdx * 0.2, duration: 1 }}
                                            d={`M 35% ${5 + arrowIdx * 25}% L 65% ${5 + arrowIdx * 25}%`}
                                            stroke="#94a3b8" strokeWidth="4" strokeDasharray="10 10" fill="none"
                                        />
                                    ))}
                                </svg>
                                
                                {/* Left Column: Encoder (Top to Bottom) */}
                                <div className="flex flex-col w-[35%] z-10">
                                    {model.layers.slice(0, 9).map((layer: any, i: number) => renderLayer(layer, i, true, false))}
                                </div>
                                
                                {/* Middle Column: Bottleneck */}
                                <div className="flex flex-col justify-end w-[28%] z-10 pb-[24px]">
                                    {renderLayer(model.layers[9], 9, true, false)}
                                </div>
                                
                                {/* Right Column: Decoder (Bottom to Top) */}
                                <div className="flex flex-col-reverse w-[35%] z-10">
                                    {model.layers.slice(10).map((layer: any, i: number) => renderLayer(layer, 10 + i, true, true))}
                                </div>
                            </div>
                        ) : (
                            model.layers.map((layer: any, idx: number) => renderLayer(layer, idx, false, false))
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
"""

# Find the block to replace
start_idx = content.find("{/* Main Vertical Diagram */}")
end_idx = content.find("{/* Flashcard Style Overlay */}")

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_main_block + content[end_idx:]

with open(output_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated page.tsx successfully with perfect React boxes")
