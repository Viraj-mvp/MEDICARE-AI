"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

interface MapProps {
    center: number[];
    zoom: number;
    markers?: any[];
    circles?: any[];
    enableSearch?: boolean;
    flyToLocation?: { lat: number; lng: number; zoom: number } | null;
    onSearch?: (result: any) => void;
    style?: React.CSSProperties;
    mapLayers?: any;
}

function MapController({ flyToLocation }: { flyToLocation: MapProps["flyToLocation"] }) {
    const map = useMap();
    useEffect(() => {
        if (flyToLocation) {
            map.flyTo([flyToLocation.lat, flyToLocation.lng], flyToLocation.zoom);
        }
    }, [flyToLocation, map]);
    return null;
}

export function AdvancedMap({ center, zoom, markers = [], circles = [], style }: MapProps) {
    return (
        <MapContainer center={center as any} zoom={zoom} style={style} className="z-0 relative rounded-xl overflow-hidden">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <MapController flyToLocation={null} />
            
            {markers.map((m, i) => (
                <Marker key={m.id || i} position={m.position}>
                    {m.popup && (
                        <Popup>
                            <strong>{m.popup.title}</strong>
                            <br />
                            {m.popup.content}
                        </Popup>
                    )}
                </Marker>
            ))}

            {circles.map((c, i) => (
                <Circle
                    key={i}
                    center={c.center}
                    radius={c.radius}
                    pathOptions={{ color: c.style.color, fillColor: c.style.fillColor, fillOpacity: c.style.fillOpacity, weight: 1 }}
                >
                    {c.popup && <Popup>{c.popup}</Popup>}
                </Circle>
            ))}
        </MapContainer>
    );
}
