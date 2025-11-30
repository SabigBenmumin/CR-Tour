"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon - use absolute URLs
const markerIcon = new L.Icon({
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

function LocationMarker({
	position,
	setPosition,
}: {
	position: [number, number] | null;
	setPosition: (pos: [number, number]) => void;
}) {
	const map = useMapEvents({
		click(e) {
			setPosition([e.latlng.lat, e.latlng.lng]);
		},
	});

	useEffect(() => {
		if (position) {
			map.flyTo(position, map.getZoom());
		}
	}, [position, map]);

	return position === null ? null : (
		<Marker position={position} icon={markerIcon} />
	);
}

export default function MapPicker({
	lat,
	lng,
	onLocationSelect,
}: {
	lat?: number;
	lng?: number;
	onLocationSelect: (lat: number, lng: number) => void;
}) {
	const [position, setPosition] = useState<[number, number] | null>(
		lat && lng ? [Number(lat), Number(lng)] : null
	);

	// Sync state with props only if significantly different
	useEffect(() => {
		if (lat !== undefined && lng !== undefined) {
			const newLat = Number(lat);
			const newLng = Number(lng);
			if (
				!position ||
				Math.abs(position[0] - newLat) > 0.00001 ||
				Math.abs(position[1] - newLng) > 0.00001
			) {
				setPosition([newLat, newLng]);
			}
		}
	}, [lat, lng, position]);

	// Default center (Bangkok) if no position
	const center: [number, number] = position || [13.7563, 100.5018];

	const handleSetPosition = (pos: [number, number]) => {
		setPosition(pos);
		onLocationSelect(pos[0], pos[1]);
	};

	return (
		<div className="h-[300px] w-full rounded-md overflow-hidden border">
			<MapContainer
				center={center}
				zoom={13}
				scrollWheelZoom={false}
				style={{ height: "100%", width: "100%" }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<LocationMarker
					position={position}
					setPosition={handleSetPosition}
				/>
			</MapContainer>
		</div>
	);
}
