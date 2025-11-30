"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Trophy, User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
	const { data: session } = useSession();

	return (
		<header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white dark:bg-gray-950">
			<Link className="flex items-center justify-center" href="/">
				<Trophy className="h-6 w-6 mr-2" />
				<span className="font-bold">CR-Tour</span>
			</Link>
			<nav className="ml-auto flex items-center gap-4 sm:gap-6">
				<Link
					className="text-sm font-medium hover:underline underline-offset-4"
					href="/tournaments"
				>
					Tournaments
				</Link>
				<Link
					className="text-sm font-medium hover:underline underline-offset-4"
					href="/rankings"
				>
					Rankings
				</Link>

				{session ? (
					<>
						<Link
							className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block"
							href="/dashboard"
						>
							Dashboard
						</Link>
						{session.user.role === "ADMIN" && (
							<Link
								className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block text-red-600"
								href="/admin"
							>
								Admin
							</Link>
						)}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="rounded-full"
								>
									{session.user.image ? (
										<img
											src={session.user.image}
											alt={session.user.name || "User"}
											className="h-8 w-8 rounded-full object-cover"
										/>
									) : (
										<User className="h-5 w-5" />
									)}
									<span className="sr-only">User menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>
									My Account
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link
										href="/dashboard"
										className="cursor-pointer"
									>
										<LayoutDashboard className="mr-2 h-4 w-4" />
										Dashboard
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link
										href={`/users/${session.user.id}`}
										className="cursor-pointer"
									>
										<User className="mr-2 h-4 w-4" />
										Profile
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link
										href="/settings"
										className="cursor-pointer"
									>
										<Settings className="mr-2 h-4 w-4" />
										Settings
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="cursor-pointer text-red-600 focus:text-red-600"
									onClick={() =>
										signOut({ callbackUrl: "/" })
									}
								>
									<LogOut className="mr-2 h-4 w-4" />
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</>
				) : (
					<>
						<Link
							className="text-sm font-medium hover:underline underline-offset-4"
							href="/login"
						>
							Login
						</Link>
						<Link
							className="text-sm font-medium hover:underline underline-offset-4"
							href="/register"
						>
							Register
						</Link>
					</>
				)}
			</nav>
		</header>
	);
}
