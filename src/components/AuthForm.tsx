"use client";

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation';
import { CardContent, CardFooter } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { loginAction, signUpAction } from '@/actions/users';

type Props = {
    type : "login" | "signup"
};

function AuthForm({type} : Props) {

  const isLoginForm = type === "login";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const handleSubmit = (formdata : FormData) => {

    startTransition(async () => {

        const email = formdata.get('email') as string;
        const password = formdata.get('password') as string;

        let errMessage;
        let title;
        let description;

        if(isLoginForm) {

            errMessage = (await loginAction(email, password)).errMessage;
            title = "Login Successful";
            description = "You have been logged in successfully.";

        }
        else{
            errMessage = (await signUpAction(email, password)).errMessage;
            title = "Sign Up Successful";
            description = "check your email for verification link.";
        }


        if(!errMessage){
            toast.success(title, {description});
            router.replace('/');
        }
        else{
            toast.error("Error", {description: errMessage});
        }
    });
  }
  return (
    <form action={handleSubmit}>
        <CardContent className='grid w-full items-center gap-4'>
            <div className='flex flex-col space-y-1.5'>
                <Label htmlFor='email' >Email</Label>
                <Input 
                    id='email'
                    name='email'
                    placeholder='type your email'
                    type='email'
                    required
                    disabled={isPending}
                />
            </div>

            <div className='flex flex-col space-y-1.5'>
                <Label htmlFor='email' >Password</Label>
                <Input 
                    id='password'
                    name='password'
                    placeholder='type your password'
                    type='password'
                    required
                    disabled={isPending}
                />
            </div>
        </CardContent>
        <CardFooter className='mt-4 flex flex-col gap-6'>
            <Button className='w-full'>{isPending ? (<Loader2 className='animate-spin'/>) : (isLoginForm ? "Log In" : "Sign Up")}</Button>
            <p className='text-xs'>
                {isLoginForm ? "Don't have an account" : "Already have an account"}{" "}
                <Link href={isLoginForm ? "/sign-up" : "/login"} className={`text-blue-500 underline ${isPending ? "pointer-events-none opacity-50" : ""}`}>{isLoginForm ? "Sign Up" : "Log In"}</Link>
            </p>
        </CardFooter>
    </form>
  )
}

export default AuthForm