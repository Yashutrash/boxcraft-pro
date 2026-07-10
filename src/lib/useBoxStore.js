import { create } from "zustand";

export const useBoxStore = create((set) => ({
  // Default Dimensions
  L: 4.7244,
  W: 2.3622,
  H: 6.2992,
  T: 0.0197, 
  glueFlapWidth: 0.625,
  bleed: 2 / 25.4,

  // Material Tracker (Paperboard vs Corrugated)
  materialType: "paperboard",
  setMaterialType: (type, defaultT) => set({ materialType: type, T: defaultT }),

  // Size Mode (manufacture, inner, outer)
  sizeMode: "manufacture",
  setSizeMode: (mode) => set({ sizeMode: mode }),

  // Line Colors
  trimColor: "#3b82f6",
  creaseColor: "#ef4444",
  bleedColor: "#10b981",
  dimColor: "#06b6d4",

  // Theme State
  theme: "dark",
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === "dark" ? "light" : "dark" 
  })),

  // Visibility
  showOverallDims: false,
  showBasicDims: true,
  showBleedLine: true,
  showAnnotations: true,

  // Actions
  setDim: (key, value) => set(() => ({ 
    [key]: Math.max(0.01, Number(value) || 0.01) 
  })),
  
  setColor: (key, value) => set(() => ({ 
    [key]: value 
  })),
  
  toggleView: (key) => set((state) => ({ 
    [key]: !state[key] 
  })),
  
  // Relaxed store setter to allow the UI to manage typing and clamping securely
  setMaterial: (thickness) => set({ 
    T: Number(thickness) || 0.0197 
  }),

  // Dieline Generator Method ("legacy" or "dxf")
  generatorMethod: "legacy",
  setGeneratorMethod: (method) => set({ generatorMethod: method }),
}));