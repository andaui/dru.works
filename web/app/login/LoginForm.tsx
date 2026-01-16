'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface LoginFormProps {
  heroTitle?: string;
  heroDescription?: string;
}

export default function LoginForm({ heroTitle, heroDescription }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to the original page or home
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayTitle = heroTitle || "Design partner\nwith technical skills";
  const displayDescription = heroDescription || "I take on a limited number of projects and share details directly.";

  return (
    <div className="relative w-full bg-[#fcfcfc] min-h-screen overflow-x-hidden flex items-center justify-center px-[2.5%] sm:px-[24px]">
      <div className="w-full flex flex-col gap-[59px] items-center text-center">
        {/* Title Section */}
        <div className="flex flex-col gap-[19px] items-center w-full">
          {/* Title - split into multiple lines */}
          <h1 className="font-medium text-[40px] leading-[47px] not-italic text-black tracking-[-0.25px] w-full">
            {displayTitle.split('\n').map((line: string, index: number) => (
              <p key={index} className="mb-0">{line}</p>
            ))}
          </h1>
          
          {/* Subtitle */}
          <p className="font-normal text-[12px] leading-[19px] not-italic text-[#989898] w-full">
            {displayDescription}
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center px-[100px] sm:px-0">
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-[#eaeaea] px-[12px] py-[6px] w-[275px] text-[16px] sm:text-[13px] leading-[20px] text-black font-normal font-inter placeholder:text-black placeholder:opacity-40 placeholder:text-[13px] placeholder:font-inter focus:outline-none disabled:opacity-50 mb-[12px]"
            required
            autoFocus
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={isLoading}
            className="bg-black px-[12px] py-[6px] w-[275px] text-[13px] leading-[20px] font-normal text-[#fcfcfc] transition-opacity hover:opacity-70 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Submit'}
          </button>
          
          {error && (
            <div className="font-normal text-[13px] leading-[19px] not-italic text-[#D30505] mt-[38px]">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

