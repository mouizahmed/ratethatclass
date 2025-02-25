'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { doRegistrationWithEmailPassword } from '@/firebase/auth';
import { Spinner } from '../ui/Spinner';

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password != formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    doRegistrationWithEmailPassword(formData.displayName, formData.email, formData.password)
      .then(() => {
        setSuccess(true);
        setLoading(false);
        setError(null);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
        if (error.response && error.response.data) {
          setError(error.response.data);
        } else {
          setError((error as Error).message);
        }
      });
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <div className={'flex flex-col gap-6'}>
      <Card>
        {!success ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Register</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  <div className="grid gap-2">
                    <Label htmlFor="email">Display Name</Label>
                    <Input id="displayName" required value={formData.displayName} onChange={handleChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input id="password" type="password" required value={formData.password} onChange={handleChange} />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Confirm Password</Label>
                    </div>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Spinner size="medium" className="text-white" /> : 'Register'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Already have an account?{' '}
                  <a href="/login" className="underline underline-offset-4">
                    Log In
                  </a>
                </div>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Email Verification Sent!</CardTitle>
              <CardDescription>Please check your email to verify your account.</CardDescription>
            </CardHeader>
          </>
        )}
      </Card>
    </div>
  );
}
