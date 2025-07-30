import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import ImageUpload from './components/ImageUpload'
import ThreeScene from './components/ThreeScene'
import LightingControls from './components/LightingControls'
import './App.css'

function App() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [depthMap, setDepthMap] = useState(null)
  const [normalMap, setNormalMap] = useState(null)
  const [lightingData, setLightingData] = useState(null)
  const [isDayMode, setIsDayMode] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleImageUpload = async (file) => {
    if (!file) {
      setUploadedImage(null)
      setDepthMap(null)
      setNormalMap(null)
      setLightingData(null)
      return
    }

    setIsProcessing(true)
    
    try {
      // Create preview URL
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)

      // Upload to backend for processing
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('http://localhost:5001/api/image/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        setDepthMap(data.depth_map)
        setNormalMap(data.normal_map)
      } else {
        console.error('Image processing failed:', data.error)
        alert('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLightingChange = (data) => {
    setLightingData(data)
  }

  const handleDayNightToggle = (dayMode) => {
    setIsDayMode(dayMode)
  }

  const handleFullscreen = () => {
    // Could implement fullscreen mode for 3D view
    console.log('Fullscreen mode')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Randy Thailand</h1>
                <p className="text-sm text-muted-foreground">Lighting Simulator</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Real-time Interactive Simulation
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - Image Upload */}
          <div className="lg:col-span-1">
            <ImageUpload 
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              isProcessing={isProcessing}
            />
          </div>

          {/* Center Panel - 3D Scene */}
          <div className="lg:col-span-2">
            <ThreeScene
              originalImage={uploadedImage}
              depthMap={depthMap}
              normalMap={normalMap}
              lightingData={lightingData}
              isDayMode={isDayMode}
              onFullscreen={handleFullscreen}
            />
          </div>

          {/* Right Panel - Lighting Controls */}
          <div className="lg:col-span-1">
            <LightingControls
              onLightingChange={handleLightingChange}
              onDayNightToggle={handleDayNightToggle}
              isDayMode={isDayMode}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  )
}

export default App
