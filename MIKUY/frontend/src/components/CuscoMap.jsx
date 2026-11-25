import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const DISTRICTS = [
  { name: 'Cusco', lat: -13.5192, lng: -71.9767 },
  { name: 'Santiago', lat: -13.5258, lng: -71.9831 },
  { name: 'Wanchaq', lat: -13.5214, lng: -71.9667 },
  { name: 'San Sebastián', lat: -13.5303, lng: -71.9369 },
  { name: 'San Jerónimo', lat: -13.5444, lng: -71.8836 },
  { name: 'Poroy', lat: -13.4944, lng: -72.0447 },
  { name: 'Saylla', lat: -13.57, lng: -71.8278 },
];

export default function CuscoMap({ donations = [], onSelectDistrict }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView([-13.528, -71.955], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const layer = L.layerGroup().addTo(map);
    DISTRICTS.forEach((d) => {
      const lots = donations.filter((x) => x.district === d.name && x.status === 'available');
      const totalKg = lots.reduce((sum, x) => sum + Number(x.qty || 0), 0);

      const marker = L.circleMarker([d.lat, d.lng], {
        radius: Math.max(10, Math.min(24, 10 + lots.length * 3)),
        color: '#9F9EF0',
        fillColor: '#9ED1F0',
        fillOpacity: 0.82,
        weight: 2,
      }).addTo(layer);

      marker.bindPopup(
        `<strong>${d.name}</strong><br/>Lotes disponibles: ${lots.length}<br/>Total aprox.: ${totalKg} kg`
      );
      marker.on('click', () => onSelectDistrict && onSelectDistrict(d.name));
    });

    return () => {
      layer.clearLayers();
      map.removeLayer(layer);
    };
  }, [donations, onSelectDistrict]);

  return <div ref={containerRef} className="mk-map-canvas" aria-label="Mapa interactivo de Cusco" />;
}
