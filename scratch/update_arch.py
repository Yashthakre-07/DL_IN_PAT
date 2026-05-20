import os
import re

file_path = r"c:\Users\Admin\Documents\DL_IN_PAT\localhost\stich\app\models\architecture\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add fdunet to architectures
fdunet_obj = """
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
            
            { type: 'conv', label: 'Up-Conv 4', details: 'ConvTranspose 16x16', description: 'Upsampling step 4.' },
            { type: 'block', label: 'Dense Block 4', details: 'k=8', description: 'Fourth dense block in expanding path.' },
            { type: 'conv', label: 'Up-Conv 3', details: 'ConvTranspose 32x32', description: 'Upsampling step 3.' },
            { type: 'block', label: 'Dense Block 3', details: 'k=8', description: 'Third expanding dense block.' },
            { type: 'conv', label: 'Up-Conv 2', details: 'ConvTranspose 64x64', description: 'Upsampling step 2.' },
            { type: 'block', label: 'Dense Block 2', details: 'k=8', description: 'Second expanding dense block.' },
            { type: 'conv', label: 'Up-Conv 1', details: 'ConvTranspose 128x128', description: 'Upsampling step 1.' },
            { type: 'block', label: 'Dense Block 1', details: 'k=8', description: 'First expanding dense block.' },
            { type: 'output', label: 'Global Residual', details: 'y = Λθ(x) + x', description: 'Identity mapping for artifact suppression.' }
        ] as Layer[]
    },
"""

content = content.replace("const architectures = {", "const architectures: Record<string, any> = {\n" + fdunet_obj)

# 2. Add renderLayer helper inside ArchitecturePage
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
                    w-full ${isUshapeItem ? 'h-24 rounded-[24px] border-[3px] px-6' : 'max-w-[1000px] h-40 rounded-[48px] border-[6px] px-16'} flex items-center justify-between cursor-help transition-all duration-300 relative group
                    ${hoveredLayer === idx ? `shadow-[0_40px_100px_rgba(0,0,0,0.2)] border-slate-900 bg-white -translate-y-2 z-20` : `shadow-xl border-slate-100 ${(layerTypeMeta as any)[layer.type].bg}`}
                `}
            >
                <div className="flex items-center gap-4 md:gap-12 w-full">
                    <div className={`${isUshapeItem ? 'w-12 h-12 rounded-[16px] border-2' : 'w-24 h-24 rounded-[32px] border-4'} flex-shrink-0 flex items-center justify-center shadow-xl bg-white ${(layerTypeMeta as any)[layer.type].border}`}>
                        {(() => {
                            const Meta = (layerTypeMeta as any)[layer.type];
                            return <Meta.icon className={`${isUshapeItem ? 'w-6 h-6' : 'w-12 h-12'} ${(layerTypeMeta as any)[layer.type].text}`} />;
                        })()}
                    </div>
                    <div className="flex-grow overflow-hidden">
                        <div className="flex items-center gap-2 md:gap-4 mb-1 md:mb-2">
                            <span className={`${isUshapeItem ? 'text-[8px] px-2 py-0.5' : 'text-[12px] px-4 py-1.5'} font-black uppercase tracking-[0.2em] md:tracking-[0.4em] rounded-xl ${(layerTypeMeta as any)[layer.type].accent} text-white shadow-sm truncate`}>
                                {(layerTypeMeta as any)[layer.type].subtext}
                            </span>
                        </div>
                        <h3 className={`${isUshapeItem ? 'text-lg md:text-xl' : 'text-3xl md:text-5xl'} font-black tracking-tighter truncate ${hoveredLayer === idx ? "text-slate-900" : (layerTypeMeta as any)[layer.type].text}`}>
                            {layer.label}
                        </h3>
                    </div>
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
                    <div className="w-1 h-6 bg-gradient-to-b from-slate-200 to-slate-400 rounded-full opacity-40" />
                </div>
            )}
            {isUshapeItem && isUshapeRight && idx > 10 && (
                <div className="py-2 flex flex-col items-center gap-1">
                    <div className="w-1 h-6 bg-gradient-to-t from-slate-200 to-slate-400 rounded-full opacity-40" />
                </div>
            )}
        </div>
    );
"""

# Insert renderLayer inside ArchitecturePage component
content = content.replace("const model = architectures[selectedModel];", "const model = architectures[selectedModel];\n" + render_layer_func)

# 3. Replace the Main Vertical Diagram rendering block
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
                            <div className="flex w-full justify-between items-stretch relative">
                                {/* Horizontal Skip Connections SVG */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ zIndex: 0 }}>
                                    {[1, 3, 5, 7].map((i, arrowIdx) => (
                                        <motion.path 
                                            key={i}
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.3 }}
                                            transition={{ delay: 1 + arrowIdx * 0.2, duration: 1 }}
                                            d={`M 35% ${10 + arrowIdx * 20}% L 65% ${10 + arrowIdx * 20}%`}
                                            stroke="#64748b" strokeWidth="4" strokeDasharray="10 10" fill="none"
                                        />
                                    ))}
                                </svg>
                                
                                <div className="flex flex-col w-[35%] z-10 pt-4">
                                    {model.layers.slice(0, 9).map((layer: any, i: number) => renderLayer(layer, i, true, false))}
                                </div>
                                <div className="flex flex-col justify-end w-[26%] pb-[8px] z-10">
                                    {renderLayer(model.layers[9], 9, true, false)}
                                </div>
                                <div className="flex flex-col-reverse w-[35%] z-10 pt-4">
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
else:
    print("Could not find the replace block")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated page.tsx successfully")
