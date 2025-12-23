import { shadow } from '@/style/shadow'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { Button } from './ui/button'
import DarkModeToggle from './DarkModeToggle'
import LogoutButton from './LogoutButton'
import { getUser } from '@/auth/server'
import { SidebarTrigger } from './ui/sidebar'

const Header = async () => {

  const user = await getUser();

  return (
    <header
      // Changed to sticky top-0 to fix "pushed up" feel. 
      // Changed h-20 to h-16 for a sleeker look.
      // Added z-10 and background color to ensure it covers scrolling text.
      className="sticky top-0 z-10 flex h-20 shrink-0 w-full items-center justify-between border-b bg-popover backdrop-blur px-4 sm:px-6"
      style={{
        boxShadow: shadow,
      }}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger className='h-9 w-9 text-muted-foreground hover:text-foreground size-6' />
        <Link href='/' className='flex items-center gap-2 transition-opacity hover:opacity-80'>
          {/* Adjusted logo sizing for the cleaner header height */}
          <div className="relative h-8 w-10 flex items-center justify-center">
             <Image 
                src='/notevell.PNG' 
                alt='logo' 
                width={100} 
                height={80} 
                className="object-contain"
                priority 
             />
          </div>
          <h1 className='text-xl font-bold tracking-tight'>NoteVell</h1>
        </Link>
      </div>

      <div className='flex items-center gap-3'>
        {user ?
          (<LogoutButton />) :
          (<>
            <Button asChild className='hidden h-9 px-4 sm:flex' size="sm">
              <Link href="/sign-up">
                Sign Up
              </Link>
            </Button>

            <Button asChild variant="ghost" size="sm" className="h-9">
              <Link href="/login">
                Login
              </Link>
            </Button>
          </>)
        }
        <DarkModeToggle />
      </div>
    </header>
  )
}

export default Header