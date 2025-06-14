'use client';
import Link from "next/link";
import { Button } from './ui/button';
import Image from 'next/image';
import { useEffect, useRef } from "react";
import React from 'react';



 export default function HeroSection()  {
    const imageRef= useRef();
    useEffect(()=>{
        const imageElement = imageRef.current;
        const handleScroll=()=>{

            const scrollPosition = window.scrollY;
            const scrollThreshold =100;
            if(scrollPosition>scrollThreshold){
                imageElement.classList.add("scrolled");

            }else {
                imageElement.classList.remove("scrolled");
            }
        };
        window.addEventListener("scroll",handleScroll)
        return ()=> window.removeEventListener("scroll",handleScroll);
    },[]);
  return (
    <div className="pb-20 px-4">
        <div className='container mx-auto text-center'>
            <h1 className=" text-[#1A52D3] text-6xl font-bold bg-white">
              Manage Your Finances <br /> with Intelligence
            </h1>
            <br />
                
                <p className="text-xl font-bold text-gray-600 max-w-2xl mb-8 mx-auto">
               
                An AI -powered financial management platform that helps you track ,analyze ,and optimize your spending with real-time insights.
            </p>
            <div className="flex justify-center space-x-4">
                <Link href="/dashboard">
                <Button size="lg"  variant="outline" className="px-8">
                    Get Started 
                </Button>
                </Link>
            </div>
            <div className="hero-image-wrapper">
                <div ref={imageRef} className="hero-image">
                    <Image  src={'/banner.jpeg'} width={1290} height={720}
                    alt="dashboard preview"
                    className=" rounded-lg shadow-2xl border mx-auto"
                    priority/>
                </div>
            </div>
        </div>
    </div>
  );
};

