'use client'

import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QRCodeProps {
  value: string
  size?: number
}

export const QRCodeComponent: React.FC<QRCodeProps> = ({ value, size = 200 }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        })
        setQrCodeUrl(url)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    generateQR()
  }, [value, size])

  if (!qrCodeUrl) {
    return (
      <div
        className="bg-white rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <img
        src={qrCodeUrl}
        alt="QR Code"
        width={size}
        height={size}
        className="rounded"
      />
    </div>
  )
}
