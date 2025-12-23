"use client";

import React, { useState } from 'react'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logOutAction } from '@/actions/users';

function LogoutButton() {

    const [loading, setLoading] = useState(false);
     const router = useRouter();

    async function handleLogOut() {

        setLoading(true);
        
        const {errMessage} = await logOutAction();

        if(!errMessage) {
            toast.success("LoggedOut successfully");
            router.push("/login");
        }
        else{
            toast.error("unable to LogOut");
        }

        setLoading(false);

    }
  return (
    <Button className='w-24' disabled={loading} onClick={handleLogOut}>
        {loading ? <Loader2 className='animate-spin'/>   : "Log Out"}
    </Button>
  )
}

export default LogoutButton;