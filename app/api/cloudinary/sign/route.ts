import { NextResponse } from "next/server";
import crypto from "crypto";
import { userFromRequest } from "@/lib/admin";
const FOLDER = "buyers/products";
export async function POST(req: Request) {
  if (!(await userFromRequest(req))) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHash("sha1").update(`folder=${FOLDER}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`).digest("hex");
  return NextResponse.json({ signature, timestamp, folder: FOLDER, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
}
