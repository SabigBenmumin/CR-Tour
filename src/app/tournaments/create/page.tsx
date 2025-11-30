"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/map-picker"), {
	ssr: false,
	loading: () => (
		<div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
			Loading Map...
		</div>
	),
});

const tournamentSchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters"),
	description: z.string().optional(),
	location: z.string().optional(),
	lat: z.coerce.number().optional(),
	lng: z.coerce.number().optional(),
	startDate: z.string().refine((date) => new Date(date) > new Date(), {
		message: "Start date must be in the future",
	}),
	minPlayers: z.coerce.number().min(4).max(32),
	maxPlayers: z.coerce.number().min(4).max(32),
});

type TournamentFormValues = z.infer<typeof tournamentSchema>;

export default function CreateTournamentPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [gettingLocation, setGettingLocation] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<TournamentFormValues>({
		resolver: zodResolver(tournamentSchema) as any,
		defaultValues: {
			minPlayers: 8,
			maxPlayers: 32,
		},
	});

	const minPlayers = watch("minPlayers");

	// Ensure maxPlayers is valid when minPlayers changes
	useEffect(() => {
		const currentMax = watch("maxPlayers");
		if (currentMax < minPlayers) {
			setValue("maxPlayers", minPlayers);
		}
	}, [minPlayers, setValue, watch]);

	const handleGetLocation = () => {
		if (!navigator.geolocation) {
			setError("Geolocation is not supported by your browser");
			return;
		}

		setGettingLocation(true);
		setError(null);

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;

				setValue("lat", lat);
				setValue("lng", lng);

				// Reverse geocoding with LocationIQ
				try {
					const token = process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN;
					if (token) {
						const response = await fetch(
							`https://us1.locationiq.com/v1/reverse?key=${token}&lat=${lat}&lon=${lng}&format=json&accept-language=th,en`
						);

						if (response.ok) {
							const data = await response.json();
							if (data && data.display_name) {
								setValue("location", data.display_name);
							}
						}
					}
				} catch (err) {
					console.error("Failed to get location name:", err);
				}

				setGettingLocation(false);
			},
			(err) => {
				setError(
					"Unable to retrieve your location. Please allow location access."
				);
				setGettingLocation(false);
			}
		);
	};

	const handleSearchLocation = async () => {
		const locationQuery = watch("location");
		if (!locationQuery || locationQuery.trim() === "") {
			setError("Please enter a location to search");
			return;
		}

		const token = process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN;
		if (!token) {
			setError(
				"LocationIQ API token not configured. Please add NEXT_PUBLIC_LOCATIONIQ_TOKEN to .env.local"
			);
			return;
		}

		setGettingLocation(true);
		setError(null);

		try {
			const response = await fetch(
				`https://us1.locationiq.com/v1/search?key=${token}&q=${encodeURIComponent(
					locationQuery
				)}&format=json&limit=1&accept-language=th,en`
			);

			if (!response.ok) {
				throw new Error("Failed to search location");
			}

			const data = await response.json();

			if (data && data.length > 0) {
				const result = data[0];
				setValue("lat", parseFloat(result.lat));
				setValue("lng", parseFloat(result.lon));
				setValue("location", result.display_name);
			} else {
				setError(
					"Location not found. Please try a different search term."
				);
			}
		} catch (err) {
			setError("Unable to search location. Please try again.");
		} finally {
			setGettingLocation(false);
		}
	};

	const handleLocationSelect = (lat: number, lng: number) => {
		setValue("lat", lat);
		setValue("lng", lng);
	};

	const onSubmit = async (data: TournamentFormValues) => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/tournaments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to create tournament"
				);
			}

			router.push("/dashboard");
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("An unknown error occurred");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const minPlayerOptions = [4, 8, 16, 32];
	const maxPlayerOptions = [4, 8, 16, 32].filter((n) => n >= minPlayers);

	return (
		<div className="container mx-auto p-6 max-w-2xl">
			<Card>
				<CardHeader>
					<CardTitle>Create Tournament</CardTitle>
					<CardDescription>
						Organize a new tennis tournament. Cost: 2 Stamina.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<div className="space-y-2">
							<Label htmlFor="title">Tournament Title</Label>
							<Input
								id="title"
								placeholder="Summer Open 2025"
								{...register("title")}
							/>
							{errors.title && (
								<p className="text-sm text-red-500">
									{errors.title.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								placeholder="Details about the tournament..."
								{...register("description")}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="location">Location</Label>
							<div className="flex gap-2">
								<Input
									id="location"
									placeholder="Search location (e.g. Lumpini Park, Bangkok)"
									{...register("location")}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleSearchLocation();
										}
									}}
								/>
								<Button
									type="button"
									variant="outline"
									onClick={handleSearchLocation}
									disabled={gettingLocation}
									title="Search Location"
								>
									Search
								</Button>
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={handleGetLocation}
									disabled={gettingLocation}
									title="Use Current GPS Location"
								>
									<MapPin className="h-4 w-4" />
								</Button>
							</div>

							{gettingLocation && (
								<p className="text-sm text-blue-500">
									Searching...
								</p>
							)}

							<div className="mt-2">
								<Label className="mb-2 block">
									Pin Location on Map (Default: Bangkok)
								</Label>
								<MapPicker
									lat={watch("lat")}
									lng={watch("lng")}
									onLocationSelect={handleLocationSelect}
								/>
							</div>

							<div className="grid grid-cols-2 gap-2 mt-2">
								<Input
									{...register("lat")}
									placeholder="Latitude"
									readOnly
									className="bg-gray-50"
								/>
								<Input
									{...register("lng")}
									placeholder="Longitude"
									readOnly
									className="bg-gray-50"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="startDate">Start Date</Label>
							<Input
								id="startDate"
								type="datetime-local"
								{...register("startDate")}
							/>
							{errors.startDate && (
								<p className="text-sm text-red-500">
									{errors.startDate.message}
								</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="minPlayers">Min Players</Label>
								<Select
									onValueChange={(val) =>
										setValue("minPlayers", parseInt(val))
									}
									defaultValue={String(8)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select min players" />
									</SelectTrigger>
									<SelectContent>
										{minPlayerOptions.map((num) => (
											<SelectItem
												key={num}
												value={String(num)}
											>
												{num}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.minPlayers && (
									<p className="text-sm text-red-500">
										{errors.minPlayers.message}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="maxPlayers">Max Players</Label>
								<Select
									onValueChange={(val) =>
										setValue("maxPlayers", parseInt(val))
									}
									defaultValue={String(32)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select max players" />
									</SelectTrigger>
									<SelectContent>
										{maxPlayerOptions.map((num) => (
											<SelectItem
												key={num}
												value={String(num)}
											>
												{num}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.maxPlayers && (
									<p className="text-sm text-red-500">
										{errors.maxPlayers.message}
									</p>
								)}
							</div>
						</div>

						{error && (
							<p className="text-sm text-red-500">{error}</p>
						)}

						<div className="flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading
									? "Creating..."
									: "Create Tournament (2 Stamina)"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
