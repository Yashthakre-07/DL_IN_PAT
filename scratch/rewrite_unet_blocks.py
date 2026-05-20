import re

file_path = r"c:\Users\Admin\Documents\DL_IN_PAT\localhost\stich\app\models\architecture\page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_blocks = """const unetBlocks = [
    // Level 0 (Encoder) - h=400
    { id: 'e0_0', level: 0, x: 0, y: 0, w: 15, h: 400, channels: '1', spatial: '572x572', type: 'input', label: 'Input Image', desc: 'Raw Photoacoustic Image (1 channel).' },
    { id: 'e0_1', level: 0, x: 25, y: 0, w: 30, h: 400, channels: '64', spatial: '570x570', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'First convolution layer extracting basic structural features.' },
    { id: 'e0_2', level: 0, x: 65, y: 0, w: 30, h: 400, channels: '64', spatial: '568x568', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Second convolution layer, increasing receptive field.' },
    
    // Level 1 (Encoder) - h=200
    { id: 'e1_1', level: 1, x: 130, y: 500, w: 45, h: 200, channels: '128', spatial: '284x284', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Feature extraction at reduced spatial resolution.' },
    { id: 'e1_2', level: 1, x: 185, y: 500, w: 45, h: 200, channels: '128', spatial: '282x282', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Deepening feature hierarchy.' },
    
    // Level 2 (Encoder) - h=100
    { id: 'e2_1', level: 2, x: 270, y: 800, w: 60, h: 100, channels: '256', spatial: '140x140', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Mid-level feature extraction.' },
    { id: 'e2_2', level: 2, x: 340, y: 800, w: 60, h: 100, channels: '256', spatial: '138x138', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Capturing complex patterns.' },
    
    // Level 3 (Encoder) - h=50
    { id: 'e3_1', level: 3, x: 440, y: 1000, w: 80, h: 50, channels: '512', spatial: '68x68', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'High-level feature extraction.' },
    { id: 'e3_2', level: 3, x: 530, y: 1000, w: 80, h: 50, channels: '512', spatial: '66x66', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Final encoder block before bottleneck.' },
    
    // Level 4 (Bottleneck) - h=25
    { id: 'b_1', level: 4, x: 650, y: 1150, w: 110, h: 25, channels: '1024', spatial: '32x32', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Deepest latent space representation.' },
    { id: 'b_2', level: 4, x: 770, y: 1150, w: 110, h: 25, channels: '1024', spatial: '30x30', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Bottleneck core feature processing.' },
    
    // Level 3 (Decoder) - h=50
    { id: 'd3_up', level: 3, x: 920, y: 1000, w: 80, h: 50, channels: '512', spatial: '56x56', type: 'upconv', label: 'Up-Conv 2x2', desc: 'Upsampling features to higher resolution.' },
    { id: 'd3_1', level: 3, x: 1010, y: 1000, w: 160, h: 50, channels: '1024', spatial: '56x56', type: 'conv', label: 'Concatenation', desc: 'Merging upsampled features with encoder skip connections.' },
    { id: 'd3_2', level: 3, x: 1180, y: 1000, w: 80, h: 50, channels: '512', spatial: '54x54', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Decoder feature synthesis.' },
    { id: 'd3_3', level: 3, x: 1270, y: 1000, w: 80, h: 50, channels: '512', spatial: '52x52', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Refining spatial details.' },
    
    // Level 2 (Decoder) - h=100
    { id: 'd2_up', level: 2, x: 1390, y: 800, w: 60, h: 100, channels: '256', spatial: '104x104', type: 'upconv', label: 'Up-Conv 2x2', desc: 'Upsampling step.' },
    { id: 'd2_1', level: 2, x: 1460, y: 800, w: 120, h: 100, channels: '512', spatial: '104x104', type: 'conv', label: 'Concatenation', desc: 'Skip connection fusion.' },
    { id: 'd2_2', level: 2, x: 1590, y: 800, w: 60, h: 100, channels: '256', spatial: '102x102', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Decoder feature synthesis.' },
    { id: 'd2_3', level: 2, x: 1660, y: 800, w: 60, h: 100, channels: '256', spatial: '100x100', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Refining spatial details.' },
    
    // Level 1 (Decoder) - h=200
    { id: 'd1_up', level: 1, x: 1760, y: 500, w: 45, h: 200, channels: '128', spatial: '200x200', type: 'upconv', label: 'Up-Conv 2x2', desc: 'Upsampling step.' },
    { id: 'd1_1', level: 1, x: 1815, y: 500, w: 90, h: 200, channels: '256', spatial: '200x200', type: 'conv', label: 'Concatenation', desc: 'Skip connection fusion.' },
    { id: 'd1_2', level: 1, x: 1915, y: 500, w: 45, h: 200, channels: '128', spatial: '198x198', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Decoder feature synthesis.' },
    { id: 'd1_3', level: 1, x: 1970, y: 500, w: 45, h: 200, channels: '128', spatial: '196x196', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Refining spatial details.' },
    
    // Level 0 (Decoder) - h=400
    { id: 'd0_up', level: 0, x: 2055, y: 0, w: 30, h: 400, channels: '64', spatial: '392x392', type: 'upconv', label: 'Up-Conv 2x2', desc: 'Final upsampling step.' },
    { id: 'd0_1', level: 0, x: 2095, y: 0, w: 60, h: 400, channels: '128', spatial: '392x392', type: 'conv', label: 'Concatenation', desc: 'Final skip connection fusion.' },
    { id: 'd0_2', level: 0, x: 2165, y: 0, w: 30, h: 400, channels: '64', spatial: '390x390', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Final feature synthesis.' },
    { id: 'd0_3', level: 0, x: 2205, y: 0, w: 30, h: 400, channels: '64', spatial: '388x388', type: 'conv', label: 'Conv 3x3 + ReLU', desc: 'Final refinement.' },
    
    // Output
    { id: 'out', level: 0, x: 2245, y: 0, w: 15, h: 400, channels: '2', spatial: '388x388', type: 'output', label: 'Conv 1x1', desc: 'Output segmentation or reconstruction map.' }
];"""

content = re.sub(r'const unetBlocks = \[\s*// Level 0 \(Encoder\).*?\];', new_blocks, content, flags=re.DOTALL)

# Adjust the default scale so it fits nicely
content = re.sub(r'const \[scale, setScale\] = useState\(0\.25\);', r'const [scale, setScale] = useState(0.45);', content)
# Adjust the canvas default viewport
content = re.sub(r'const \[position, setPosition\] = useState\(\{ x: 100, y: 150 \}\);', r'const [position, setPosition] = useState({ x: 50, y: 50 });', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
