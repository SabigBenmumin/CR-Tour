import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Shield, Database, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<Link href="/">
				<Button variant="ghost" className="mb-6">
					<ArrowLeft className="mr-2 h-4 w-4" />
					กลับหน้าหลัก
				</Button>
			</Link>

			<div className="space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold">
						นโยบายความเป็นส่วนตัว
					</h1>
					<p className="text-gray-500">Privacy Policy</p>
					<p className="text-sm text-gray-400">
						อัพเดทล่าสุด: 1 ธันวาคม 2024
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Database className="h-5 w-5" />
							ข้อมูลที่เราเก็บรวบรวม
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h3 className="font-semibold mb-2">
								1. ข้อมูลส่วนบุคคล
							</h3>
							<ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
								<li>อีเมล (Email) - สำหรับการเข้าสู่ระบบ</li>
								<li>ชื่อ (Name) - สำหรับแสดงในระบบ</li>
								<li>รูปโปรไฟล์ - จาก Google OAuth (ถ้ามี)</li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold mb-2">
								2. ข้อมูลการใช้งาน
							</h3>
							<ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
								<li>ข้อมูลทัวร์นาเมนต์ที่เข้าร่วม</li>
								<li>ประวัติการแข่งขัน</li>
								<li>ข้อมูล Stamina</li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold mb-2">
								3. ข้อมูลตำแหน่ง (ถ้าใช้งาน)
							</h3>
							<ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
								<li>
									GPS Location - เมื่อใช้ฟีเจอร์ค้นหาสถานที่
								</li>
							</ul>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							วัตถุประสงค์ในการใช้ข้อมูล
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-gray-600">
						<p>เราใช้ข้อมูลของคุณเพื่อ:</p>
						<ul className="list-disc list-inside space-y-1">
							<li>จัดการบัญชีผู้ใช้และการเข้าสู่ระบบ</li>
							<li>จัดการทัวร์นาเมนต์และการแข่งขัน</li>
							<li>แสดงข้อมูลสถิติและอันดับ</li>
							<li>ปรับปรุงการให้บริการ</li>
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Cookies และเทคโนโลยีที่คล้ายกัน
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-gray-600">
						<p>เราใช้ Cookies ประเภทต่อไปนี้:</p>
						<div className="space-y-3">
							<div>
								<p className="font-semibold">
									Cookies ที่จำเป็น (Strictly Necessary)
								</p>
								<ul className="list-disc list-inside ml-4">
									<li>Session Cookies - สำหรับการ login</li>
									<li>CSRF Tokens - สำหรับความปลอดภัย</li>
								</ul>
							</div>
							<div>
								<p className="font-semibold">
									Cookies จาก Google OAuth
								</p>
								<ul className="list-disc list-inside ml-4">
									<li>ใช้เมื่อ login ด้วย Google</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Trash2 className="h-5 w-5" />
							ระยะเวลาการเก็บข้อมูล
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-gray-600">
						<ul className="list-disc list-inside space-y-1">
							<li>ข้อมูลบัญชี: เก็บตราบเท่าที่คุณยังใช้งาน</li>
							<li>ข้อมูลทัวร์นาเมนต์: 1-2 ปี</li>
							<li>Session Logs: 90 วัน</li>
							<li>ข้อมูลบัญชีที่ลบแล้ว: ลบภายใน 30 วัน</li>
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>สิทธิของคุณ</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-gray-600">
						<p>คุณมีสิทธิ์ในการ:</p>
						<ul className="list-disc list-inside space-y-1">
							<li>เข้าถึงข้อมูลส่วนบุคคลของคุณ</li>
							<li>แก้ไขข้อมูลที่ไม่ถูกต้อง</li>
							<li>ลบบัญชีและข้อมูลของคุณ (ในหน้า Profile)</li>
							<li>คัดค้านการประมวลผลข้อมูล</li>
							<li>ขอรับสำเนาข้อมูลของคุณ</li>
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>การแชร์ข้อมูล</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-gray-600">
						<p>เราแชร์ข้อมูลของคุณกับ:</p>
						<ul className="list-disc list-inside space-y-1">
							<li>Google - เมื่อคุณ login ด้วย Google OAuth</li>
							<li>LocationIQ - เมื่อคุณใช้ฟีเจอร์แผนที่</li>
						</ul>
						<p className="mt-2">
							เราไม่ขายหรือแชร์ข้อมูลของคุณให้กับบุคคลที่สามอื่นๆ
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>ความปลอดภัย</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-gray-600">
						<p>เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสม เช่น:</p>
						<ul className="list-disc list-inside space-y-1 mt-2">
							<li>การเข้ารหัสรหัสผ่าน (bcrypt)</li>
							<li>HTTPS สำหรับการส่งข้อมูล</li>
							<li>Session tokens ที่ปลอดภัย</li>
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>ติดต่อเรา</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-gray-600">
						<p>
							หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้
							กรุณาติดต่อ:
						</p>
						<p className="mt-2">Email: privacy@cr-tour.com</p>
					</CardContent>
				</Card>

				<div className="text-center text-sm text-gray-500 pt-8 border-t">
					<p>
						นโยบายนี้อาจมีการปรับปรุงเป็นครั้งคราว
						<br />
						โปรดตรวจสอบหน้านี้เป็นประจำเพื่อรับทราบการเปลี่ยนแปลง
					</p>
				</div>
			</div>
		</div>
	);
}
