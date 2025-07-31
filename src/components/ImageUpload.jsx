import { useState, useCallback, useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const ImageUpload = ({ onImageUpload, uploadedImage, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // handleDrag: จัดการเหตุการณ์ Drag and Drop (dragenter, dragover, dragleave)
  // เพื่ออัปเดตสถานะ dragActive สำหรับการแสดงผลทางสายตา
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // handleDrop: ประมวลผลไฟล์ที่ถูกลากมาวางบน Component
  // ป้องกันพฤติกรรมเริ่มต้นของเบราว์เซอร์และเรียก handleFile ด้วยไฟล์แรกที่ถูกวาง
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  // handleChange: ประมวลผลไฟล์ที่ถูกเลือกผ่าน input file
  // ป้องกันพฤติกรรมเริ่มต้นของเบราว์เซอร์และเรียก handleFile ด้วยไฟล์แรกที่ถูกเลือก
  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  // handleFile: ตรวจสอบประเภทไฟล์และเรียก onImageUpload หากเป็นรูปภาพ
  // แสดงข้อความแจ้งเตือนหากไฟล์ไม่ใช่รูปภาพ
  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      onImageUpload(file);
    } else {
      // ใช้ alert ง่ายๆ สำหรับการสาธิต ควรพิจารณาใช้ modal แบบกำหนดเองใน Production
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
    }
  };

  // clearImage: ล้างรูปภาพที่อัปโหลดปัจจุบันโดยเรียก onImageUpload ด้วย null
  const clearImage = () => {
    onImageUpload(null);
  };

  // handleButtonClick: กระตุ้นการคลิกบน input file ที่ซ่อนอยู่
  const handleButtonClick = () => {
    console.log("Button clicked!");
    if (fileInputRef.current) {
      console.log("fileInputRef.current exists, attempting click.");
      fileInputRef.current.click();
    } else {
      console.log("fileInputRef.current is null.");
    }
  };

  return (
    <Card className="w-full h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-4">อัพโหลดรูปภาพ</h3>

        {/* แสดงผลตามเงื่อนไขว่ามีรูปภาพอัปโหลดแล้วหรือไม่ */}
        {uploadedImage ? (
          // แสดงรูปภาพที่อัปโหลดและสถานะการประมวลผล
          <div className="flex-1 flex flex-col">
            <div className="relative flex-1 mb-4">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {isProcessing && (
              <div className="text-center text-sm text-muted-foreground">
                กำลังประมวลผล...
              </div>
            )}
          </div>
        ) : (
          // แสดงพื้นที่สำหรับลากและวางรูปภาพเพื่ออัปโหลด
          <div
            className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <div className="mb-4">
                {/* แสดงไอคอนตามสถานะ dragActive */}
                {dragActive ? (
                  <Upload className="h-12 w-12 text-primary mx-auto" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                )}
              </div>
              <p className="text-lg font-medium mb-2">
                {dragActive ? 'วางไฟล์ที่นี่' : 'ลากและวางรูปภาพ'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                หรือคลิกเพื่อเลือกไฟล์
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                id="file-upload"
                ref={fileInputRef}
              />
              <Button onClick={handleButtonClick}>
                <Upload className="h-4 w-4 mr-2" />
                เลือกไฟล์
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
