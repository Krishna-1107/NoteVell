import AuthForm from '@/components/AuthForm'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

function LoginPage() {
  return (
    <div className='flex flex-1 flex-col items-center'>
        <Card className='w-full max-w-md mt-8'>
            <CardHeader className='mb-4'>
                <CardTitle className='text-center text-2xl'>Log In</CardTitle>
            </CardHeader>

            <AuthForm type='login' />
        </Card>
    </div>
  )
}

export default LoginPage