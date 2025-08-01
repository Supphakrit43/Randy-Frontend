import { useState, useEffect } from 'react'
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Minus,
  Sun,
  Moon,
  Lightbulb,
  Home,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const LightingControls = ({ 
  onLightingChange, 
  onDayNightToggle, 
  isDayMode = true,
  isProcessing = false 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [position, setPosition] = useState({ x: 0.5, y: 0.5, z: 0.8 })
  const [intensity, setIntensity] = useState([100])
  
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [models, setModels] = useState([])
  const [currentModel, setCurrentModel] = useState(null)

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://randy-backend.onrender.com')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async (categoryId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/products/category/${categoryId}/products`)
      const data = await response.json()
      if (data.success) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchModels = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/products/product/${productId}/models`)
      const data = await response.json()
      if (data.success) {
        setModels(data.models)
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    }
  }

  const fetchModelDetails = async (modelId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/products/model/${modelId}`)
      const data = await response.json()
      if (data.success) {
        setCurrentModel(data.model)
        // Trigger lighting calculation
        calculateLighting(data.model)
      }
    } catch (error) {
      console.error('Error fetching model details:', error)
    }
  }

  const calculateLighting = async (model = currentModel) => {
    if (!model) return

    try {
      const response = await fetch('http://localhost:5001/api/image/lighting/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          light_type: selectedProduct,
          wattage: model.wattage,
          lumens: model.lumens,
          position: position,
          image_width: 800,
          image_height: 600
        })
      })
      
      const data = await response.json()
      if (data.success) {
        onLightingChange(data)
      }
    } catch (error) {
      console.error('Error calculating lighting:', error)
    }
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setSelectedProduct('')
    setSelectedModel('')
    setProducts([])
    setModels([])
    setCurrentModel(null)
    
    if (categoryId) {
      fetchProducts(categoryId)
    }
  }

  const handleProductChange = (productId) => {
    setSelectedProduct(productId)
    setSelectedModel('')
    setModels([])
    setCurrentModel(null)
    
    if (productId) {
      fetchModels(productId)
    }
  }

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId)
    if (modelId) {
      fetchModelDetails(modelId)
    }
  }

  const updatePosition = (axis, delta) => {
    setPosition(prev => {
      const newPos = {
        ...prev,
        [axis]: Math.max(0, Math.min(1, prev[axis] + delta))
      }
      
      // Trigger lighting recalculation
      setTimeout(() => calculateLighting(), 100)
      
      return newPos
    })
  }

  const handleIntensityChange = (value) => {
    setIntensity(value)
    // Could be used to modify lighting intensity
  }

  const getCategoryIcon = (categoryId) => {
    switch (categoryId) {
      case 'spotlight_solar':
        return <Lightbulb className="h-4 w-4" />
      case 'home_lights':
        return <Home className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          ควบคุมแสง
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Selection */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">หมวดหมู่ผลิตภัณฑ์</Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category.id)}
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {products.length > 0 && (
            <div>
              <Label className="text-sm font-medium">ผลิตภัณฑ์</Label>
              <Select value={selectedProduct} onValueChange={handleProductChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกผลิตภัณฑ์" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {models.length > 0 && (
            <div>
              <Label className="text-sm font-medium">รุ่น</Label>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกรุ่น" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col items-start">
                        <span>{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.wattage}W • {model.lumens} Lumens
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {currentModel && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium">{currentModel.name}</div>
              <div className="text-xs text-muted-foreground">
                {currentModel.wattage}W • {currentModel.lumens} Lumens
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {currentModel.description}
              </div>
            </div>
          )}
        </div>

        {/* Position Controls */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">ตำแหน่งไฟ</Label>
          
          {/* Horizontal/Vertical Movement */}
          <div className="grid grid-cols-3 gap-2">
            <div></div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updatePosition('y', -0.1)}
              disabled={isProcessing}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <div></div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updatePosition('x', -0.1)}
              disabled={isProcessing}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center text-xs text-muted-foreground self-center">
              {Math.round(position.x * 100)}, {Math.round(position.y * 100)}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updatePosition('x', 0.1)}
              disabled={isProcessing}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <div></div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updatePosition('y', 0.1)}
              disabled={isProcessing}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <div></div>
          </div>

          {/* Near/Far Movement */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updatePosition('z', -0.1)}
              disabled={isProcessing}
            >
              <Minus className="h-4 w-4 mr-1" />
              ใกล้
            </Button>
            <span className="text-xs text-muted-foreground">
              ความสูง: {Math.round(position.z * 100)}%
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updatePosition('z', 0.1)}
              disabled={isProcessing}
            >
              ไกล
              <Plus className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Intensity Control */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            ความเข้มแสง {currentModel ? `${Math.round(currentModel.lumens * intensity[0] / 100)} Lumens` : ''}
          </Label>
          <Slider
            value={intensity}
            onValueChange={handleIntensityChange}
            max={100}
            step={1}
            className="w-full"
            disabled={isProcessing}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>{intensity[0]}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Day/Night Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            {isDayMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDayMode ? 'กลางวัน' : 'กลางคืน'}
          </Label>
          <Switch
            checked={!isDayMode}
            onCheckedChange={(checked) => onDayNightToggle(!checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default LightingControls

