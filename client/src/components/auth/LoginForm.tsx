'use client';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation'; // Usage: App router
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { doForgotPassword, doSignInWithEmailPassword } from '@/firebase/auth';
import Link from 'next/link';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [forgotPassword, setForgotPassword] = useState<boolean>(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (forgotPassword) {
      doForgotPassword(formData.email)
        .then(() => {
          setForgotPasswordSuccess(true);
          setForgotPassword(false);
          return;
        })
        .catch((error) => {
          console.log(error);
          if (error.response && error.response.data) {
            setError(error.response.data);
          } else {
            setError((error as Error).message);
          }
          return;
        });
    } else {
      doSignInWithEmailPassword(formData.email, formData.password)
        .then(() => {
          router.push('/');
        })
        .catch((error) => {
          console.log(error);
          if (error.response && error.response.data) {
            setError(error.response.data);
          } else {
            setError((error as Error).message);
          }
        });
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        {!forgotPasswordSuccess ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="email">Email</Label>
                      {forgotPassword ? (
                        <>
                          <a
                            href=""
                            onClick={(e) => {
                              e.preventDefault();
                              setForgotPassword((prev) => !prev);
                            }}
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                          >
                            Back to Login
                          </a>
                        </>
                      ) : null}
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {!forgotPassword ? (
                    <>
                      <div className="grid gap-2">
                        <div className="flex items-center">
                          <Label htmlFor="password">Password</Label>
                          <Link
                            href="#"
                            onClick={() => setForgotPassword((prev) => !prev)}
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <Input
                          id="password"
                          type="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  ) : null}

                  <Button type="submit" className="w-full">
                    {!forgotPassword ? 'Login' : 'Send Password Reset Email'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Password Reset Email Link Sent!</CardTitle>
              <CardDescription>Please check your email to reset your account.</CardDescription>
            </CardHeader>
          </>
        )}
      </Card>
    </div>
  );
}
