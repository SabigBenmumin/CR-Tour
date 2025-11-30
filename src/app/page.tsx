import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Activity, ArrowRight } from "lucide-react";
import Leaderboard from "@/components/leaderboard";

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col">
			<main className="flex-1">
				{/* Hero Section */}
				<section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black text-white">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center space-y-4 text-center">
							<div className="space-y-2">
								<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
									Elevate Your Tennis Game
								</h1>
								<p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
									Join the premier tennis tournament platform.
									Compete, rank up, and manage your tennis
									journey with CR-Tour.
								</p>
							</div>
							<div className="flex flex-col sm:flex-row gap-4">
								<Link href="/register">
									<Button
										size="lg"
										className="bg-white text-black hover:bg-gray-200 font-semibold"
									>
										Get Started
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</Link>
								<Link href="/tournaments">
									<Button
										size="lg"
										variant="outline"
										className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-black font-semibold transition-all"
									>
										View Tournaments
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
					<div className="container px-4 md:px-6">
						<div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
							<Card className="transition-all hover:shadow-lg hover:scale-105">
								<CardHeader>
									<Trophy className="h-10 w-10 mb-2 text-primary" />
									<CardTitle>Tournament Management</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-gray-500 dark:text-gray-400">
										Easily create, join, and manage tennis
										tournaments. Automated grouping and
										match generation.
									</p>
								</CardContent>
							</Card>
							<Card className="transition-all hover:shadow-lg hover:scale-105">
								<CardHeader>
									<Activity className="h-10 w-10 mb-2 text-primary" />
									<CardTitle>Stamina System</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-gray-500 dark:text-gray-400">
										Strategic gameplay with our unique
										stamina system. Earn stamina by
										officiating matches.
									</p>
								</CardContent>
							</Card>
							<Card className="transition-all hover:shadow-lg hover:scale-105">
								<CardHeader>
									<Users className="h-10 w-10 mb-2 text-primary" />
									<CardTitle>Community & Rankings</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-gray-500 dark:text-gray-400">
										Climb the leaderboards, view player
										profiles, and compete against the best
										in your region.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* Leaderboard Preview Section */}
				<section className="w-full py-12 md:py-24 lg:py-32 bg-white">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center space-y-4 text-center mb-8">
							<div className="space-y-2">
								<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
									Top Players
								</h2>
								<p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
									The best of the best. Can you make it to the
									top?
								</p>
							</div>
						</div>
						<div className="max-w-3xl mx-auto">
							<Leaderboard limit={5} />
							<div className="mt-8 text-center">
								<Link href="/rankings">
									<Button variant="outline" className="gap-2">
										View Full Rankings
										<ArrowRight className="h-4 w-4" />
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</section>
			</main>
			<footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
				<p className="text-xs text-gray-500 dark:text-gray-400">
					© 2024 CR-Tour. All rights reserved.
				</p>
				<nav className="sm:ml-auto flex gap-4 sm:gap-6">
					<Link
						className="text-xs hover:underline underline-offset-4"
						href="/privacy"
					>
						Terms of Service
					</Link>
					<Link
						className="text-xs hover:underline underline-offset-4"
						href="/privacy"
					>
						Privacy
					</Link>
				</nav>
			</footer>
		</div>
	);
}
