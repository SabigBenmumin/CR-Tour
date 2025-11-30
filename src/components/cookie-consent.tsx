"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie } from "lucide-react";
import Link from "next/link";

export default function CookieConsent() {
	const [showBanner, setShowBanner] = useState(false);

	useEffect(() => {
		// Check if user has already accepted cookies
		const hasAccepted = localStorage.getItem("cr-tour-cookie-consent");
		if (!hasAccepted) {
			setShowBanner(true);
		}
	}, []);

	const acceptCookies = () => {
		localStorage.setItem("cr-tour-cookie-consent", "accepted");
		setShowBanner(false);
	};

	if (!showBanner) return null;

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/95 backdrop-blur-sm border-t border-white/10 text-white">
			<div className="container mx-auto max-w-6xl">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div className="flex items-start gap-3 flex-1">
						<Cookie className="h-5 w-5 mt-0.5 flex-shrink-0" />
						<div className="space-y-1">
							<p className="text-sm font-medium">
								เราใช้ Cookies เพื่อประสบการณ์ที่ดีที่สุด
							</p>
							<p className="text-xs text-gray-400">
								เราใช้ cookies ที่จำเป็นสำหรับการ login
								และความปลอดภัย{" "}
								<Link
									href="/privacy"
									className="underline hover:text-white"
								>
									เรียนรู้เพิ่มเติม
								</Link>
							</p>
						</div>
					</div>
					<div className="flex gap-2 w-full sm:w-auto">
						<Button
							onClick={acceptCookies}
							className="flex-1 sm:flex-none bg-white text-black hover:bg-gray-200"
						>
							ยอมรับ
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
