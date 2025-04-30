"use client"

import { useEffect, useRef, useState } from "react"
import FallbackMap from "./fallback-map"

export default function ServiceAreaMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    // This function will be called when the component mounts
    const loadMap = () => {
      if (!mapRef.current || !window.google) {
        setMapError(true)
        return
      }

      try {
        // Create a map centered on Edinburgh
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 55.9533, lng: -3.1883 }, // Edinburgh coordinates
          zoom: 10,
          mapTypeId: "roadmap",
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        })

        // Define the service area coordinates (polygon)
        // This is a rough outline covering Edinburgh, Musselburgh, Gorebridge, and Bonnyrigg
        const serviceAreaCoords = [
          { lat: 55.995, lng: -3.39 }, // Northwest Edinburgh
          { lat: 56.02, lng: -3.1 }, // Northeast (past Musselburgh)
          { lat: 55.83, lng: -2.95 }, // East
          { lat: 55.8, lng: -3.05 }, // Southeast (past Gorebridge)
          { lat: 55.85, lng: -3.25 }, // South (including Bonnyrigg)
          { lat: 55.9, lng: -3.4 }, // Southwest
        ]

        // Create the polygon
        const serviceArea = new window.google.maps.Polygon({
          paths: serviceAreaCoords,
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.1,
        })

        // Add the polygon to the map
        serviceArea.setMap(map)

        // Add markers for key locations
        const locations = [
          { name: "Edinburgh", position: { lat: 55.9533, lng: -3.1883 } },
          { name: "Musselburgh", position: { lat: 55.9422, lng: -3.0499 } },
          { name: "Gorebridge", position: { lat: 55.8352, lng: -3.0518 } },
          { name: "Bonnyrigg", position: { lat: 55.8738, lng: -3.1042 } },
          { name: "Dalkeith", position: { lat: 55.8954, lng: -3.0678 } },
        ]

        locations.forEach((location) => {
          const marker = new window.google.maps.Marker({
            position: location.position,
            map: map,
            title: location.name,
          })

          // Add info window for each marker
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div><strong>${location.name}</strong><br>Service Available</div>`,
          })

          marker.addListener("click", () => {
            infoWindow.open(map, marker)
          })
        })

        setMapLoaded(true)
      } catch (error) {
        console.error("Error loading map:", error)
        setMapError(true)
      }
    }

    // Load Google Maps script if it's not already loaded
    if (!window.google) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`
      script.async = true
      script.defer = true
      script.onerror = () => setMapError(true)
      window.initMap = loadMap
      document.head.appendChild(script)
    } else {
      loadMap()
    }

    // Set a timeout to show fallback if map doesn't load in 5 seconds
    const timeout = setTimeout(() => {
      if (!mapLoaded) {
        setMapError(true)
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [mapLoaded])

  if (mapError) {
    return <FallbackMap />
  }

  return <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" />
}
