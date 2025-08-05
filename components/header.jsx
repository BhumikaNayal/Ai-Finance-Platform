"use client";
import { Suspense } from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import Image from "next/image";

function UserSection() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />;
  }

  return (
    <>
      <SignedIn>
        <Link
          href="/dashboard"
          className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
        >
          <Button variant="outline">
            <LayoutDashboard size={18} />
            <span className="hidden md:inline">Dashboard</span>
          </Button>
        </Link>
        <a href="/transaction/create">
          <Button className="flex items-center gap-2">
            <PenBox size={18} />
            <span className="hidden md:inline">Add Transaction</span>
          </Button>
        </a>
        <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
      </SignedIn>
      <SignedOut>
        <SignInButton forceRedirectUrl="/dashboard">
          <Button variant="outline">Login</Button>
        </SignInButton>
      </SignedOut>
    </>
  );
}

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/banner.jpeg"
            alt="Welth Logo"
            width={200}
            height={60}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <SignedOut>
            <a href="#features" className="text-gray-600 hover:text-blue-600">
              Features
            </a>
            <a
              href="#testimonials"
              className="text-gray-600 hover:text-blue-600"
            >
              Testimonials
            </a>
          </SignedOut>
        </div>

        <div className="flex items-center space-x-4">
          <UserSection />
        </div>
      </nav>
    </header>
  );
};

export default Header;
