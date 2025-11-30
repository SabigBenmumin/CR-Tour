import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import DeleteAccountButton from "@/components/delete-account-button";
import { ArrowLeft, User, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
	const session = await getServerSession(authOptions);

	if (!session || !session.user) {
		redirect("/login");
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<Link href="/dashboard">
				<Button variant="ghost" className="mb-6">
					<ArrowLeft className="mr-2 h-4 w-4" />
					กลับ Dashboard
				</Button>
			</Link>

			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Settings</h1>
					<p className="text-gray-500 mt-1">
						จัดการการตั้งค่าบัญชีของคุณ
					</p>
				</div>

				{/* Account Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							ข้อมูลบัญชี
						</CardTitle>
						<CardDescription>
							ข้อมูลพื้นฐานของบัญชีของคุณ
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-gray-500">ชื่อ</p>
								<p className="font-medium">
									{session.user.name}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">อีเมล</p>
								<p className="font-medium">
									{session.user.email}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Role</p>
								<p className="font-medium">
									{session.user.role}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">
									Email Verified
								</p>
								<p className="font-medium">
									{session.user.emailVerified ? (
										<span className="text-green-600">
											✓ Verified
										</span>
									) : (
										<span className="text-gray-400">
											Not verified
										</span>
									)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Privacy */}
				<Card>
					<CardHeader>
						<CardTitle>ความเป็นส่วนตัว</CardTitle>
						<CardDescription>
							จัดการข้อมูลส่วนตัวและความเป็นส่วนตัวของคุณ
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Link href="/privacy">
							<Button
								variant="outline"
								className="w-full justify-start"
							>
								อ่านนโยบายความเป็นส่วนตัว
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Danger Zone */}
				<Card className="border-red-300 bg-red-50">
					<CardHeader>
						<CardTitle className="text-red-800 flex items-center gap-2">
							<Trash2 className="h-5 w-5" />
							Danger Zone
						</CardTitle>
						<CardDescription className="text-red-700">
							การกระทำเหล่านี้ไม่สามารถย้อนกลับได้
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="bg-white border-2 border-red-200 p-4 rounded-md">
							<h3 className="font-bold text-red-800 mb-2">
								ลบบัญชีถาวร
							</h3>
							<p className="text-sm text-gray-700 mb-4">
								เมื่อคุณลบบัญชี
								ข้อมูลทั้งหมดของคุณจะถูกลบอย่างถาวร
								รวมถึงประวัติการแข่งขัน ทัวร์นาเมนต์
								และข้อมูลอื่นๆ
								<strong className="text-red-800">
									{" "}
									การกระทำนี้ไม่สามารถย้อนกลับได้
								</strong>
							</p>
							<DeleteAccountButton />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
