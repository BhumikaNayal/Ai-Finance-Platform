import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Check if the current route is public
  if (isPublicRoute(req)) {
    return; // Allow access to public routes
  }

  // For protected routes, check authentication
  const { userId } = await auth();

  if (!userId) {
    // If user is not authenticated, redirect to sign-in
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return Response.redirect(signInUrl);
  }

  // Ensure user exists in MongoDB (fallback if webhook isn't working)
  try {
    await connectDB();
    const existingUser = await User.findOne({ clerkUserId: userId });

    if (!existingUser) {
      console.log("Creating user in MongoDB...");
      await User.create({
        clerkUserId: userId,
        name: "User", // Default name, will be updated via webhook or profile
        email: "", // Will be updated via webhook
      });
    }
  } catch (error) {
    console.error("Error ensuring user exists:", error);
  }

  // User is authenticated, continue to the route
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
