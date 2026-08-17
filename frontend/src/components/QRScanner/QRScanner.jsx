import { useState, useRef, useEffect, useCallback } from 'react'
import jsQR from 'jsqr'
import Modal from '../Modal/Modal'
import Button from '../Button/Button'
import './QRScanner.css'

const CAMERA_TIMEOUT_MS = 10000
const SCAN_INTERVAL_MS = 250

function getUserMediaWithTimeout(constraints, timeoutMs) {
  return Promise.race([
    navigator.mediaDevices.getUserMedia(constraints),
    new Promise((_, reject) => {
      setTimeout(() => reject(new DOMException('Camera request timed out', 'TimeoutError')), timeoutMs)
    }),
  ])
}

export default function QRScanner({ isOpen, onClose, onScan }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const scanningRef = useRef(false)
  const animFrameRef = useRef(null)
  const mountedRef = useRef(false)

  const [cameraState, setCameraState] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [facingMode, setFacingMode] = useState('environment')

  const stopCamera = useCallback(() => {
    scanningRef.current = false
    if (animFrameRef.current) {
      clearInterval(animFrameRef.current)
      animFrameRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startScanning = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) {
      setTimeout(startScanning, 100)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setTimeout(startScanning, 100)
      return
    }

    scanningRef.current = true

    const intervalId = setInterval(() => {
      if (!scanningRef.current) {
        clearInterval(intervalId)
        return
      }

      const vw = video.videoWidth
      const vh = video.videoHeight

      if (vw === 0 || vh === 0) return

      if (canvas.width !== vw || canvas.height !== vh) {
        canvas.width = vw
        canvas.height = vh
      }

      try {
        ctx.drawImage(video, 0, 0, vw, vh)
        const imageData = ctx.getImageData(0, 0, vw, vh)
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' })

        if (code) {
          scanningRef.current = false
          clearInterval(intervalId)
          try {
            const parsed = JSON.parse(code.data)
            if (parsed.merchantCode) {
              onScan(parsed.merchantCode)
              return
            }
          } catch {
            if (/^CP\d+$/.test(code.data)) {
              onScan(code.data)
              return
            }
          }
          scanningRef.current = true
        }
      } catch {
        // Canvas read error — try again next frame
      }
    }, SCAN_INTERVAL_MS)

    animFrameRef.current = intervalId
  }, [onScan])

  const startCamera = useCallback(async () => {
    if (!mountedRef.current) return
    setCameraState('loading')
    setErrorMessage('')

    try {
      const stream = await getUserMediaWithTimeout(
        { video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } } },
        CAMERA_TIMEOUT_MS
      )

      if (!mountedRef.current || !videoRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      if (mountedRef.current) {
        setCameraState('active')
        startScanning()
      }
    } catch (err) {
      if (!mountedRef.current) return
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        setErrorMessage('Camera access denied. Please allow camera access in your browser settings and try again.')
      } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
        setErrorMessage('No camera found on this device.')
      } else if (err.name === 'TimeoutError') {
        setErrorMessage('Camera did not respond. Check if another app is using the camera, then try again.')
      } else {
        setErrorMessage(`Camera error: ${err.message || err}`)
      }
      setCameraState('error')
    }
  }, [facingMode, startScanning])

  const switchCamera = useCallback(() => {
    stopCamera()
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }, [stopCamera])

  useEffect(() => {
    mountedRef.current = true
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
      setCameraState('idle')
      setErrorMessage('')
    }
    return () => {
      mountedRef.current = false
      stopCamera()
    }
  }, [isOpen, startCamera, stopCamera])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan QR Code" className="qr-scanner-modal">
      <div className="qr-scanner">
        <div className="qr-scanner-viewport">
          <video ref={videoRef} className="qr-scanner-video" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="qr-scanner-canvas" />

          {cameraState === 'loading' && (
            <div className="qr-scanner-overlay">
              <div className="qr-scanner-spinner" />
              <p>Starting camera...</p>
            </div>
          )}

          {cameraState === 'error' && (
            <div className="qr-scanner-overlay">
              <div className="qr-scanner-error-icon">!</div>
              <p className="qr-scanner-error-text">{errorMessage}</p>
              <Button size="sm" onClick={startCamera}>Try Again</Button>
            </div>
          )}

          {cameraState === 'active' && (
            <>
              <div className="qr-scanner-finder">
                <div className="qr-scanner-finder-corner qr-scanner-finder-corner--tl" />
                <div className="qr-scanner-finder-corner qr-scanner-finder-corner--tr" />
                <div className="qr-scanner-finder-corner qr-scanner-finder-corner--bl" />
                <div className="qr-scanner-finder-corner qr-scanner-finder-corner--br" />
                <div className="qr-scanner-finder-line" />
              </div>
              <p className="qr-scanner-hint">Point the camera at a merchant QR code</p>
            </>
          )}
        </div>

        <div className="qr-scanner-actions">
          {cameraState === 'active' && (
            <Button variant="ghost" size="sm" onClick={switchCamera}>
              Switch Camera
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
