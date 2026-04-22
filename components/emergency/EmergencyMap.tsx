"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { NearestHospital } from "@/lib/db/schemas";

// Fix missing Leaflet marker icons in Next.js
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icon for the user
const userIcon = L.divIcon({
    className: 'bg-transparent',
    html: '<div class="w-4 h-4 rounded-full border-2 border-white bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

// Custom icon for hospitals
const hospitalIcon = L.divIcon({
    className: 'bg-transparent',
    html: '<div class="w-8 h-8 -ml-4 -mt-8 font-xl drop-shadow-md text-center leading-8 bg-white border border-red-500 rounded-full flex items-center justify-center">🏥</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

interface Props {
    userLat: number;
    userLng: number;
    hospitals: NearestHospital[];
}

// Map inner component for useMap hook
function MapContents({ userLat, userLng, hospitals }: Props) {
    const map = useMap();
    
    useEffect(() => {
        map.setView([userLat, userLng], 13);
        const timer = setTimeout(() => map.invalidateSize(), 400);
        return () => clearTimeout(timer);
    }, [userLat, userLng, map]);

    return (
        <>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

            {/* User Location */}
            <Marker position={[userLat, userLng]} icon={userIcon}>
                <Popup className="text-zinc-900 font-medium whitespace-nowrap">You are here</Popup>
            </Marker>

            {/* Hospitals */}
            {hospitals.map((h, i) => {
                const lat = (h as any).coordinates?.lat || userLat + (Math.random() - 0.5) * 0.05;
                const lng = (h as any).coordinates?.lng || userLng + (Math.random() - 0.5) * 0.05;

                return (
                    <Marker key={i} position={[lat, lng]} icon={hospitalIcon}>
                        <Popup className="text-zinc-900">
                            <strong>{h.name}</strong><br />
                            {h.distanceKm.toFixed(1)} km (~{h.etaMinutes} min)
                        </Popup>
                    </Marker>
                );
            })}
        </>
    );
}

export default function EmergencyMap({ userLat, userLng, hospitals }: Props) {
    return (
        <MapContainer
            center={[userLat, userLng]}
            zoom={13}
            className="w-full h-full rounded-xl z-0"
            zoomControl={false}
            attributionControl={false}
        >
            <MapContents userLat={userLat} userLng={userLng} hospitals={hospitals} />
        </MapContainer>
    );
}
