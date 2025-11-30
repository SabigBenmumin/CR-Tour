"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

export default function MapViewer({
	lat,
	lng,
	popupText,
}: {
	lat: number;
	lng: number;
	popupText?: string;
}) {
	const position: [number, number] = [lat, lng];

	return (
		<div className="h-[300px] w-full rounded-md overflow-hidden border z-0">
			<MapContainer
				center={position}
				zoom={15}
				scrollWheelZoom={false}
				style={{ height: "100%", width: "100%" }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker position={position} icon={markerIcon}>
					{popupText && <Popup>{popupText}</Popup>}
				</Marker>
			</MapContainer>
		</div>
	);
}
