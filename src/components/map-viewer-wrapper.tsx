"use client";

import dynamic from "next/dynamic";

const MapViewer = dynamic(() => import("@/components/map-viewer"), {
	ssr: false,
	loading: () => (
		<div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
			Loading Map...
		</div>
	),
});

export default function MapViewerWrapper(props: {
	lat: number;
	lng: number;
	popupText?: string;
}) {
	return <MapViewer {...props} />;
}
