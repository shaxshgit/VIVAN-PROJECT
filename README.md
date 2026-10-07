# Life Cycle Assessment of Electronic Devices
## From Manufacturing to End-of-Life Management

An interactive educational and research web platform demonstrating the complete cradle-to-grave Life Cycle Assessment (LCA) of modern consumer and enterprise electronics, developed according to the **ISO 14040 and ISO 14044** environmental management standards.

---

### Key Features & Scientific Modules

1. **Cinematic Hero & Transformation Preview**
   - Stage scrubber visualizing the device's metamorphosis from raw underground ore to refined micro-components, everyday operation, repair, and circular recovery.
   - Verified telemetry metrics and ISO 14040/14044 foundational framing.

2. **The 10-Stage Life Cycle Journey (Centerpiece)**
   - Interactive, non-linear navigation across all 10 life cycle phases:
     - 01 Raw Material Extraction
     - 02 Material Refining & Smelting
     - 03 Semiconductor Fabrication & Component Manufacturing
     - 04 Device Assembly & Automated Testing
     - 05 Global Logistics & Multimodal Freight
     - 06 Consumer Use Phase & Operational Energy
     - 07 Repair, Maintenance & Reuse
     - 08 Collection & Reverse Logistics
     - 09 Industrial Disassembly & Hydrometallurgical Recycling
     - 10 End-of-Life & Circular Re-integration
   - Each phase delivers verified resource inputs, emissions/waste profiles, reduction levers, and authentic photographic imagery.

3. **The Periodic Table of Electronics & Supply Chain Map**
   - Interactive 12-element material matrix (Copper, Gold, Lithium, Cobalt, Aluminum, Silicon, Neodymium, Tin, Tantalum, Silver, Nickel, Indium).
   - Dynamic inspector providing atomic numbers, usage quantities, primary mining hubs, carbon intensities (kg CO₂e / kg metal), water intensity, and recyclability yields.
   - Interactive Canvas-based World Map depicting global supply routes (Katanga cobalt, Atacama lithium, Hsinchu fabs, Gyeonggi memory, Shenzhen assembly, and European circular smelters) with animated freight pulses and hover tooltips.

4. **High-Precision Semiconductor Fabrication Pipeline**
   - Step-by-step breakdown from metallurgical quartz sand to Czochralski single-crystal ingots, 300mm wafer slicing, EUV photolithography, cleanroom etching, multi-layer PCB lamination, and SMT assembly.

5. **Environmental Impact Dashboard & Visualizations**
   - Device comparative selector: Flagship Smartphone, 14" Business Laptop, 11" Mid-Range Tablet, Desktop Workstation.
   - Interactive SVG Donut Chart showing lifecycle carbon distribution (70–80% embodied in manufacturing).
   - Stacked Bar Chart comparing embodied vs operational emissions across device categories.

6. **Interactive Device Anatomy (Exploded View)**
   - Multi-layer visual breakdown of internal smartphone hardware: OLED display, lithium battery, processor SoC, multi-layer logic board, optical camera modules, and aluminum chassis.

7. **Consumer Use Phase & Grid Carbon Intensity Simulator**
   - Real-time calculator evaluating how regional electricity grids (from 20 g/kWh clean renewables to 800 g/kWh coal-heavy) and daily usage hours impact operational emissions.

8. **Device Longevity & Lifetime Extension Simulator**
   - Interactive slider demonstrating the climate impact of keeping a smartphone for 4 to 7 years instead of 2.5 years, computing annualized carbon savings (~38% to 55%) and virgin ore conserved.

9. **UN Global E-Waste Monitor Telemetry**
   - Verified 2024 UN statistics: 62 million metric tonnes generated, 22.3% formal recycling rate, and \$62 billion in discarded recoverable metals.
   - Toxicological profiles of mercury, lead, cadmium, and brominated flame retardants (BFRs).

10. **8-Step Industrial Recycling Pipeline**
    - Step-by-step flowchart: Collection, de-pollution, modular dismantling, rotary shredding, eddy current separation, optical sorting, pyrometallurgical smelting, and hydrometallurgical electrolytic refining.

11. **Linear vs Circular Economy Comparison**
    - Comparative analysis of linear 'Take-Make-Waste' against regenerative inner, middle, and outer circular loops.

12. **Educational LCA Explorer / Scenario Calculator**
    - Side-by-side comparison of rapid replacement (Scenario A) vs extended repair (Scenario B) with tree-seedling absorption equivalents and scientific disclaimer.

13. **Stakeholder Action Framework**
    - Targeted recommendations for Consumers, Hardware Manufacturers, and Regulators.

14. **Searchable Academic Bibliography**
    - Verified references from UNITAR/ITU, IEA, Fraunhofer IZM, EEA, Apple/Dell Environmental Reports, and the U.S. EPA.

---

### Project Structure

```
lca-electronics-website/
├── index.html            # Semantic HTML5 architecture & accessible markup
├── css/
│   └── styles.css        # Academic/research design system & responsive styling
├── js/
│   ├── data.js           # Verified research database & material inventories
│   ├── charts.js         # Custom SVG/Canvas charts & supply chain world map
│   └── app.js            # Interactive state manager & DOM event controller
└── README.md             # Documentation & methodology overview
```

---

### How to Run Locally

You can open the project directly in your browser:
```bash
open /Users/vivandakshpandey/.gemini/antigravity/scratch/lca-electronics-website/index.html
```
Or serve it via any local web server:
```bash
cd /Users/vivandakshpandey/.gemini/antigravity/scratch/lca-electronics-website
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.
