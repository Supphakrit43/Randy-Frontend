import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Maximize2, RotateCcw } from 'lucide-react'

const ThreeScene = ({ 
  originalImage, 
  depthMap, 
  normalMap, 
  lightingData, 
  isDayMode = true,
  onFullscreen 
}) => {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const lightRef = useRef(null)
  const planeRef = useRef(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current || isInitialized) return

    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(isDayMode ? 0xf0f0f0 : 0x1a1a1a)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 0, 5)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    mountRef.current.appendChild(renderer.domElement)

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, isDayMode ? 0.6 : 0.2)
    scene.add(ambientLight)

    // Main light (controllable)
    const light = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 6, 0.5, 2)
    light.position.set(0, 5, 5)
    light.castShadow = true
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048
    lightRef.current = light
    scene.add(light)

    // Light helper (cone visualization)
    const lightHelper = new THREE.SpotLightHelper(light)
    scene.add(lightHelper)

    setIsInitialized(true)

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [isDayMode])

  // Update scene when image data changes
  useEffect(() => {
    if (!isInitialized || !originalImage || !sceneRef.current) return

    // Remove existing plane
    if (planeRef.current) {
      sceneRef.current.remove(planeRef.current)
    }

    // Create texture from original image
    const loader = new THREE.TextureLoader()
    loader.load(originalImage, (texture) => {
      // Create geometry
      const geometry = new THREE.PlaneGeometry(8, 6, 100, 100)
      
      // Create material
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide
      })

      // Apply normal map if available
      if (normalMap) {
        loader.load(normalMap, (normalTexture) => {
          material.normalMap = normalTexture
          material.needsUpdate = true
        })
      }

      // Create displacement if depth map is available
      if (depthMap) {
        loader.load(depthMap, (depthTexture) => {
          material.displacementMap = depthTexture
          material.displacementScale = 0.5
          material.needsUpdate = true
        })
      }

      // Create mesh
      const plane = new THREE.Mesh(geometry, material)
      plane.rotation.x = -Math.PI / 2 // Lay flat
      plane.receiveShadow = true
      planeRef.current = plane
      sceneRef.current.add(plane)

      // Render
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    })
  }, [originalImage, depthMap, normalMap, isInitialized])

  // Update lighting
  useEffect(() => {
    if (!lightRef.current || !lightingData) return

    const { light_info, lighting_data } = lightingData
    
    if (light_info && light_info.position) {
      // Convert normalized position to 3D coordinates
      const x = (light_info.position.x - 0.5) * 8 // Scale to scene size
      const z = (light_info.position.y - 0.5) * 6
      const y = light_info.position.z * 8 + 2 // Height above plane
      
      lightRef.current.position.set(x, y, z)
      
      // Update intensity based on lumens
      const normalizedIntensity = (light_info.lumens || 2000) / 5000 // Normalize to reasonable range
      lightRef.current.intensity = Math.max(0.1, Math.min(2, normalizedIntensity))
    }

    // Render
    if (rendererRef.current && cameraRef.current && sceneRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current)
    }
  }, [lightingData])

  // Update day/night mode
  useEffect(() => {
    if (!sceneRef.current) return

    sceneRef.current.background = new THREE.Color(isDayMode ? 0xf0f0f0 : 0x1a1a1a)
    
    // Update ambient light
    const ambientLight = sceneRef.current.children.find(child => child.type === 'AmbientLight')
    if (ambientLight) {
      ambientLight.intensity = isDayMode ? 0.6 : 0.2
    }

    // Render
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current)
    }
  }, [isDayMode])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return

      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight

      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
      
      if (sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 5)
      cameraRef.current.lookAt(0, 0, 0)
      
      if (rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
  }

  return (
    <Card className="w-full h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">3D Visualization</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetCamera}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div 
          ref={mountRef} 
          className="flex-1 bg-muted rounded-lg overflow-hidden"
          style={{ minHeight: '400px' }}
        />
        
        {!originalImage && (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <p className="text-lg text-muted-foreground">อัพโหลดรูปภาพเพื่อเริ่มต้น</p>
  </div>
)}
      </CardContent>
    </Card>
  )
}

export default ThreeScene

