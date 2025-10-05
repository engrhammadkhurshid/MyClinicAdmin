'use client'

import { useState } from 'react'
import dayjs from 'dayjs'
import { Lightbox } from '@/components/Lightbox'
import { ImageIcon } from 'lucide-react'

interface MedicalRecordsGalleryProps {
  attachments: Array<{
    id: string
    file_url: string
    file_name: string
    created_at: string
  }>
}

export function MedicalRecordsGallery({ attachments }: MedicalRecordsGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleImageClick = (index: number) => {
    setSelectedIndex(index)
    setLightboxOpen(true)
  }

  const lightboxImages = attachments.map((attachment) => ({
    id: attachment.id,
    url: attachment.file_url,
    name: attachment.file_name,
    date: dayjs(attachment.created_at).format('MMMM D, YYYY'),
  }))

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Medical Records ({attachments.length})
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {attachments.map((attachment, index) => (
            <button
              key={attachment.id}
              onClick={() => handleImageClick(index)}
              className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-500 transition-all duration-300 cursor-pointer"
            >
              <img
                src={attachment.file_url}
                alt={attachment.file_name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-medium truncate">
                    {attachment.file_name}
                  </p>
                  <p className="text-white/80 text-xs">
                    {dayjs(attachment.created_at).format('MMM D, YYYY')}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        initialIndex={selectedIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
