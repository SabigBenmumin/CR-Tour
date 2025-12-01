"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toggleSystemConfig } from "@/app/actions/system-config";
import { CONFIG_KEYS } from "@/lib/config-keys";
import { useRouter } from "next/navigation";

interface SystemConfigSectionProps {
	requireStamina: boolean;
	requireVerification: boolean;
}

export default function SystemConfigSection({
	requireStamina,
	requireVerification,
}: SystemConfigSectionProps) {
	const router = useRouter();
	const [loading, setLoading] = useState<string | null>(null);

	const handleToggle = async (key: string) => {
		setLoading(key);
		try {
			await toggleSystemConfig(key);
			router.refresh();
		} catch (error) {
			console.error("Failed to toggle config:", error);
		} finally {
			setLoading(null);
		}
	};

	return (
		<Card className="border-purple-300 bg-purple-50">
			<CardHeader className="bg-purple-100 border-b border-purple-200">
				<CardTitle className="text-purple-800 flex items-center gap-2">
					<span className="text-2xl">⚙️</span>
					System Configuration
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-6">
				<div className="space-y-6">
					<div className="flex items-center justify-between space-x-2 bg-white p-4 rounded-lg border border-purple-200">
						<div className="space-y-1">
							<Label
								htmlFor="stamina-toggle"
								className="text-base font-medium"
							>
								Require Stamina to Join
							</Label>
							<p className="text-sm text-gray-500">
								If enabled, users must have enough stamina to
								join tournaments.
							</p>
						</div>
						<Switch
							id="stamina-toggle"
							checked={requireStamina}
							onCheckedChange={() =>
								handleToggle(
									CONFIG_KEYS.REQUIRE_STAMINA_TO_JOIN
								)
							}
							disabled={
								loading === CONFIG_KEYS.REQUIRE_STAMINA_TO_JOIN
							}
						/>
					</div>

					<div className="flex items-center justify-between space-x-2 bg-white p-4 rounded-lg border border-purple-200">
						<div className="space-y-1">
							<Label
								htmlFor="verification-toggle"
								className="text-base font-medium"
							>
								Require Match Verification
							</Label>
							<p className="text-sm text-gray-500">
								If enabled, matches require witness
								verification. If disabled, matches are
								auto-confirmed.
							</p>
						</div>
						<Switch
							id="verification-toggle"
							checked={requireVerification}
							onCheckedChange={() =>
								handleToggle(
									CONFIG_KEYS.REQUIRE_MATCH_VERIFICATION
								)
							}
							disabled={
								loading ===
								CONFIG_KEYS.REQUIRE_MATCH_VERIFICATION
							}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
