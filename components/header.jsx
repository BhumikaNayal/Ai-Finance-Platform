
import {SignedOut ,SignInButton,SignedIn,UserButton ,SignOutButton} from '@clerk/nextjs';
import  Link  from 'next/link';
import Image from 'next/image';
import  { Button }from '../components/ui/button';
import { LayoutDashboard, PenBox } from 'lucide-react';
import { checkUser } from '@/lib/checkUser';
import React from 'react';



 

const Header = async() => {
 await checkUser();

  return (
  <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b  z-50">
    <nav className='container mx-auto px-4 py-4 flex items-center justify-between'>
      <Link href="/">
      <Image
      src="/logo.png"
      alt="Ai Finance Platform" height={60} width={200} className="h-12 w-auto object-contain"
      />
     </Link>
     <div className="flex items-center gap-4">
     {/* <SignedIn>*/}
        <Link 
          href  ={"/dashboard"  } className='text-gray-600 hover:text-blue-600 flex items-center gap-2 '>
          <Button variant ="outline">
            <LayoutDashboard size ={18  }> </LayoutDashboard>
            <span className='hidden md:inline'>
                   Dashboard 
            </span>
            </Button> 
         </Link>    
         <Link href={"/transaction/create"} >
         <Button variant ="outline" className="flex items-centre gap-2 ">
            <PenBox  size ={18  } /> 
            <span className='hidden md:inline'>
                   Add Transaction
            </span>
            </Button>  
         </Link>
      
       <SignedOut>
        <SignInButton  forceRedirectUrl="/dashboard">
        <Button variant="outline">Login</Button>
         </SignInButton >
        </SignedOut>
        <SignedIn>
            <UserButton  appearance={
              {
                elements:{avatarBox:"w-10 h-10",
                  
                }
              }
            }/>
        </SignedIn>
        </div> 
         </nav>
     </div>
  );
};

export default Header;


