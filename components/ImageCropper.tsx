'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Cropper from 'react-easy-crop'
import { X, RotateCw, ZoomIn, ZoomOut, Check, Maximize2 } from 'lucide-react'
import { Point, Area } from 'react-easy-crop'

interface ImageCropperProps {
  image: string
  fileName: string
  isOpen: boolean
  onClose: () => void
  onCropComplete: (croppedFile: File) => void
}

export function ImageCropper({ image, fileName, isOpen, onClose, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropChange = (location: Point) => {
    setCrop(location)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const createCroppedImage = async (): Promise<File> => {
    if (!croppedAreaPixels) {
      throw new Error('No crop area defined')
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    const imageElement = new Image()
    imageElement.src = image

    await new Promise((resolve, reject) => {
      imageElement.onload = resolve
      imageElement.onerror = reject
    })

    const { width, height } = croppedAreaPixels

    canvas.width = width
    canvas.height = height

    // Apply rotation
    if (rotation !== 0) {
      ctx.translate(width / 2, height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-width / 2, -height / 2)
    }

    ctx.drawImage(
      imageElement,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      width,
      height,
      0,
      0,
      width,
      height
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'))
          return
        }
        
        // Create file from blob
        const file = new File([blob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        })
        
        resolve(file)
      }, 'image/jpeg', 0.95)
    })
  }

  const handleSave = async () => {
    try {
      setProcessing(true)
      const croppedFile = await createCroppedImage()
      onCropComplete(croppedFile)
      handleClose()
    } catch (error) {
      console.error('Error creating cropped image:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-white">Crop Image</h2>
          <p className="text-sm text-gray-400">{fileName}</p>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Cropper Area */}
      <div className="relative flex-1">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={4 / 3}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteCallback}
          objectFit="contain"
        />
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border-t border-gray-700 p-6 space-y-4">
        {/* Zoom Slider */}
        <div className="flex items-center gap-4">
          <ZoomOut className="w-5 h-5 text-gray-400" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <ZoomIn className="w-5 h-5 text-gray-400" />
          <span className="text-white text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Rotation Slider */}
        <div className="flex items-center gap-4">
          <RotateCw className="w-5 h-5 text-gray-400" />
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <span className="text-white text-sm font-medium min-w-[60px] text-center">
            {rotation}°
          </span>
          <button
            onClick={handleRotate}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition text-sm"
          >
            Rotate 90°
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 border-2 border-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={processing}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>Processing...</>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Crop & Continue
              </>
            )}
          </button>
        </div>

        {/* Tips */}
        <div className="text-center text-sm text-gray-400 pt-2">
          Tip: Drag to reposition • Pinch or scroll to zoom • Crop to important parts only
        </div>
      </div>
    </motion.div>
  )
}
