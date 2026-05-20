import re

file_path = r"c:\Users\Admin\Documents\DL_IN_PAT\localhost\stich\app\models\architecture\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's replace the renderLayer function to accept an `indent` parameter and apply it
new_render_layer = """
    const renderLayer = (layer: any, idx: number, isUshapeItem: boolean = false, isUshapeRight: boolean = false, indent: number = 0) => (
        <div key={`${selectedModel}-${idx}`} className={`flex flex-col ${isUshapeRight ? 'items-end' : 'items-start'} w-full`} style={{ paddingLeft: isUshapeItem && !isUshapeRight ? `${indent * 40}px` : 0, paddingRight: isUshapeItem && isUshapeRight ? `${indent * 40}px` : 0 }}>
            <motion.div
                onMouseEnter={() => setHoveredLayer(idx)}
                onMouseLeave={() => setHoveredLayer(null)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isUshapeItem ? (idx < 10 ? idx : 18 - idx) * 0.05 : idx * 0.05 }}
                whileHover={{ scale: 1.05, x: isUshapeItem ? (isUshapeRight ? -10 : 10) : 20 }}
                className={`
                    w-full ${isUshapeItem ? 'max-w-[400px] h-[104px] rounded-[32px] border-[4px] px-4 md:px-6' : 'max-w-[1000px] h-40 rounded-[48px] border-[6px] px-16'} flex items-center justify-between cursor-help transition-all duration-300 relative group
                    ${hoveredLayer === idx ? `shadow-[0_40px_100px_rgba(0,0,0,0.2)] border-slate-900 bg-white -translate-y-2 z-20` : `shadow-xl border-slate-100 ${(layerTypeMeta as any)[layer.type].bg}`}
                `}
            >
                <div className={`flex items-center gap-3 md:gap-6 w-full ${isUshapeRight ? 'flex-row-reverse text-right' : ''}`}>
                    <div className={`${isUshapeItem ? 'w-14 h-14 rounded-[20px] border-[3px]' : 'w-24 h-24 rounded-[32px] border-4'} flex-shrink-0 flex items-center justify-center shadow-xl bg-white ${(layerTypeMeta as any)[layer.type].border}`}>
                        {(() => {
                            const Meta = (layerTypeMeta as any)[layer.type];
                            return <Meta.icon className={`${isUshapeItem ? 'w-6 h-6' : 'w-12 h-12'} ${(layerTypeMeta as any)[layer.type].text}`} />;
                        })()}
                    </div>
                    <div className={`flex-grow overflow-hidden flex flex-col justify-center ${isUshapeRight ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-center gap-2 md:gap-4 mb-1 ${isUshapeRight ? 'flex-row-reverse' : ''}`}>
                            <span className={`${isUshapeItem ? 'text-[10px] px-2 py-0.5' : 'text-[12px] px-4 py-1.5'} font-black uppercase tracking-[0.2em] md:tracking-[0.4em] rounded-xl ${(layerTypeMeta as any)[layer.type].accent} text-white shadow-sm truncate`}>
                                {(layerTypeMeta as any)[layer.type].subtext}
                            </span>
                            {!isUshapeItem && (
                                <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-200 pl-4">
                                    Block #{idx + 1}
                                </span>
                            )}
                        </div>
                        <h3 className={`${isUshapeItem ? 'text-lg md:text-xl' : 'text-3xl md:text-5xl'} font-black tracking-tighter truncate ${hoveredLayer === idx ? "text-slate-900" : (layerTypeMeta as any)[layer.type].text}`}>
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
                <div className={`absolute ${isUshapeItem && isUshapeRight ? '-left-6' : '-right-6'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <div className={`w-6 h-6 rounded-full border-4 border-slate-900 ${(layerTypeMeta as any)[layer.type].bg}`} />
                </div>
            </motion.div>
            
            {!isUshapeItem && idx < model.layers.length - 1 && (
                <div className="py-6 flex flex-col items-center gap-2 w-full max-w-[1000px]">
                    <div className="w-1.5 h-16 bg-gradient-to-b from-slate-200 to-slate-400 rounded-full opacity-40 mx-auto" />
                    <ChevronDownIcon className="w-6 h-6 text-slate-300 animate-bounce mx-auto" />
                </div>
            )}
            {isUshapeItem && !isUshapeRight && idx < 9 && (
                <div className={`py-1.5 flex flex-col items-center gap-1 w-full max-w-[400px]`} style={{ paddingLeft: `${indent * 40}px` }}>
                    <div className={`w-1.5 h-5 bg-gradient-to-b from-slate-200 to-slate-400 rounded-full opacity-40 ${indent !== Math.floor(idx/2) ? 'ml-6' : ''}`} />
                </div>
            )}
            {isUshapeItem && isUshapeRight && idx > 10 && (
                <div className={`py-1.5 flex flex-col items-center gap-1 w-full max-w-[400px]`} style={{ paddingRight: `${indent * 40}px` }}>
                    <div className={`w-1.5 h-5 bg-gradient-to-t from-slate-200 to-slate-400 rounded-full opacity-40 ${indent !== Math.floor((18-idx)/2) ? 'mr-6' : ''}`} />
                </div>
            )}
        </div>
    );
"""

# Extract the old renderLayer to replace it
start_idx_rl = content.find("const renderLayer =")
end_idx_rl = content.find("const model = architectures[selectedModel];", start_idx_rl)
if end_idx_rl == -1:
    end_idx_rl = content.find("{/* Main Vertical Diagram */}")

if start_idx_rl != -1:
    # We need to find the exact end of renderLayer
    # Let's just use regex to replace everything between const renderLayer and the end of the function.
    content = re.sub(r'const renderLayer =.*?\);\n    };\n' if '};\n' in content[start_idx_rl:start_idx_rl+5000] else r'const renderLayer =.*?\);\n', new_render_layer, content, flags=re.DOTALL)
else:
    print("Could not find renderLayer")

# Now update the main layout block
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
                                    {[0, 1, 2, 3].map((arrowIdx) => (
                                        <motion.path 
                                            key={arrowIdx}
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.4 }}
                                            transition={{ delay: 1 + arrowIdx * 0.2, duration: 1 }}
                                            d={`M ${30 + arrowIdx * 3}% ${5 + arrowIdx * 25}% L ${70 - arrowIdx * 3}% ${5 + arrowIdx * 25}%`}
                                            stroke="#94a3b8" strokeWidth="3" strokeDasharray="8 8" fill="none"
                                        />
                                    ))}
                                </svg>
                                
                                {/* Left Column: Encoder (Top to Bottom) */}
                                <div className="flex flex-col w-[45%] z-10 items-start">
                                    {model.layers.slice(0, 9).map((layer: any, i: number) => {
                                        // Calculate indent depth (staircase effect)
                                        // i=0,1 (depth 0), i=2,3 (depth 1), i=4,5 (depth 2), i=6,7 (depth 3), i=8 (depth 4)
                                        const depth = Math.floor(i / 2);
                                        return renderLayer(layer, i, true, false, depth);
                                    })}
                                </div>
                                
                                {/* Middle Column: Bottleneck */}
                                <div className="flex flex-col justify-end w-[10%] z-10 pb-[12px] items-center">
                                    {renderLayer(model.layers[9], 9, true, false, 0)}
                                </div>
                                
                                {/* Right Column: Decoder (Bottom to Top) */}
                                <div className="flex flex-col-reverse w-[45%] z-10 items-end">
                                    {model.layers.slice(10).map((layer: any, i: number) => {
                                        // Calculate indent depth mirroring the left side
                                        // i=0 corresponds to layer 10 (bottom of decoder). 
                                        // We have layers 10-18 (9 layers).
                                        // 18,17 (depth 0)
                                        // 16,15 (depth 1)
                                        // 14,13 (depth 2)
                                        // 12,11 (depth 3)
                                        // 10 (depth 4)
                                        const reverseI = 8 - i; // 8 to 0
                                        const depth = Math.floor(reverseI / 2);
                                        return renderLayer(layer, 10 + i, true, true, depth);
                                    })}
                                </div>
                            </div>
                        ) : (
                            model.layers.map((layer: any, idx: number) => renderLayer(layer, idx, false, false, 0))
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
"""

# Replace main block
start_idx = content.find("{/* Main Vertical Diagram */}")
end_idx = content.find("{/* Flashcard Style Overlay */}")
if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_main_block + content[end_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
