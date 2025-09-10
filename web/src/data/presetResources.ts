export interface PresetResource {
  id: string
  name: string
  type: "model" | "extension" | "script"
  size: string
  description: string
  category?: string
  tags?: string[]
  version?: string
  author?: string
  license?: string
  requirements?: string[]
  compatibility?: string[]
  url?: string
}

export const presetResources: PresetResource[] = [
  {
    id: "stable-diffusion-xl",
    name: "Stable Diffusion XL",
    type: "model",
    size: "6.6 GB",
    description: "High-quality image generation model with improved resolution and detail",
    category: "Image Generation",
    tags: ["image-generation", "ai", "diffusion"],
    version: "1.0",
    author: "Stability AI",
    license: "CreativeML Open RAIL++-M",
    requirements: ["CUDA 11.8+", "16GB+ VRAM"],
    compatibility: ["AUTOMATIC1111", "ComfyUI", "InvokeAI"]
  },
  {
    id: "controlnet",
    name: "ControlNet Extension",
    type: "extension",
    size: "2.1 GB",
    description: "Extension for controlling image structure and composition",
    category: "Control",
    tags: ["control", "pose", "depth", "canny"],
    version: "1.1.4",
    author: "lllyasviel",
    license: "Apache 2.0",
    requirements: ["AUTOMATIC1111", "ControlNet models"],
    compatibility: ["AUTOMATIC1111"]
  },
  {
    id: "face-restore",
    name: "Face Restoration Script",
    type: "script",
    size: "150 MB",
    description: "Script for enhancing and restoring facial features in images",
    category: "Enhancement",
    tags: ["face", "restoration", "enhancement"],
    version: "1.0.2",
    author: "xinntao",
    license: "MIT",
    requirements: ["AUTOMATIC1111", "GFPGAN model"],
    compatibility: ["AUTOMATIC1111"]
  },
  {
    id: "anime-model",
    name: "Anime Style Model",
    type: "model",
    size: "4.2 GB",
    description: "Specialized model for anime-style image generation",
    category: "Art Style",
    tags: ["anime", "manga", "art-style"],
    version: "2.0",
    author: "Anime Community",
    license: "Creative Commons",
    requirements: ["CUDA 11.8+", "8GB+ VRAM"],
    compatibility: ["AUTOMATIC1111", "ComfyUI"]
  },
  {
    id: "lora-trainer",
    name: "LoRA Training Script",
    type: "script",
    size: "50 MB",
    description: "Script for training custom LoRA models with your own data",
    category: "Training",
    tags: ["training", "lora", "custom"],
    version: "1.0.0",
    author: "kohya-ss",
    license: "MIT",
    requirements: ["Python 3.8+", "CUDA 11.8+"],
    compatibility: ["AUTOMATIC1111"]
  },
  {
    id: "upscaler-esrgan",
    name: "ESRGAN Upscaler",
    type: "model",
    size: "67 MB",
    description: "Enhanced Super-Resolution GAN for image upscaling",
    category: "Upscaling",
    tags: ["upscaling", "super-resolution", "gan"],
    version: "1.0",
    author: "xinntao",
    license: "Apache 2.0",
    requirements: ["AUTOMATIC1111"],
    compatibility: ["AUTOMATIC1111", "ComfyUI"]
  }
]

export const getPresetResourceById = (id: string): PresetResource | undefined => {
  return presetResources.find(resource => resource.id === id)
}

export const getPresetResourcesByType = (type: "model" | "extension" | "script"): PresetResource[] => {
  return presetResources.filter(resource => resource.type === type)
}

export const getPresetResourcesByCategory = (category: string): PresetResource[] => {
  return presetResources.filter(resource => resource.category === category)
}

export const searchPresetResources = (query: string): PresetResource[] => {
  const lowercaseQuery = query.toLowerCase()
  return presetResources.filter(resource => 
    resource.name.toLowerCase().includes(lowercaseQuery) ||
    resource.description.toLowerCase().includes(lowercaseQuery) ||
    resource.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    resource.category?.toLowerCase().includes(lowercaseQuery)
  )
}
