// lib/checkUser.js
import { auth } from "@clerk/nextjs";
import connectDB from "./mongodb";

export async function checkUser() {
  try {
    await connectDB();
    const { userId } = auth();
    return userId || null;
  } catch (error) {
    console.error("Error in checkUser:", error);
    return null;
  }
}
