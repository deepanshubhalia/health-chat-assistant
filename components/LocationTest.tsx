"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const LocationTest = () => {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testLocation = () => {
    setLoading(true)
    setError(null)
    setLocation(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location success:', position)
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setLoading(false)
      },
      (error) => {
        console.error('Location error:', error)
        let errorMessage = 'Unable to access location'
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please allow location access.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
          default:
            errorMessage = 'An unknown error occurred.'
        }
        
        setError(errorMessage)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-xl font-bold">Location Test</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testLocation} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Getting Location...' : 'Test Location Access'}
        </Button>

        {location && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Location Retrieved Successfully!</h3>
            <p className="text-sm text-green-700">
              Latitude: {location.lat.toFixed(6)}
            </p>
            <p className="text-sm text-green-700">
              Longitude: {location.lng.toFixed(6)}
            </p>
            <a 
              href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              View on Google Maps
            </a>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>This test will help us debug the location access issue.</p>
          <p>Make sure to allow location access when prompted.</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default LocationTest 