import LogoutButton from '@/components/LogoutButton';
import { Toaster } from '@/components/ui/toaster';
import Providers from '@/lib/providers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { PropsWithChildren } from 'react';
import 'three-dots/dist/three-dots.css';
import './globals.css';

export const metadata = {
  title: 'Arya',
  description: 'Agent IA Real Estate',
};

export default async function RootLayout({ children }: PropsWithChildren) {
  // Keep cookies in the JS execution context for Next.js build
  const cookieStore = cookies();

  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <Providers>
          <div className="flex flex-col items-center h-full">
            <nav className="w-full flex justify-center border-b border-b-foreground/10">
              <div className="max-w-6xl flex grow justify-end items-center text-sm text-foreground">
                <div className="flex flex-row grow">
                  <Link
                    href="/"
                    className="py-4 px-6 cursor-pointer hover:bg-slate-100 font-bold"
                  >
                    <svg
                      width="20px"
                      height="20px"
                      version="1.1"
                      viewBox="0 0 100 100"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g fill="none" stroke="#228B22">
                        <polygon points="16.9 48.4 16.9 48.5 16.8 48.4 16.9 48.4" fill="#228B22" />
                        <polygon points="16.9 48.4 16.9 48.5 16.8 48.4 16.9 48.4" fill="#228B22" />

                        <path 
                          d="M51.2,87.1V59.4s-6.5,6.4-13,.5c0,0-28.8-4.1-15.4-24.7,0,0,1.3-19.4,14-13.3,0,0,10.8-19.9,29.1-.5,0,0,11.4.6,9.3,9.9,0,0,7,10.8,5.3,17.1C78,57.9,69.3,59.6,64.4,60c0,0-7.1,9.1-13.2-.6"
                          stroke="#228B22"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="8"
                        />

                        <line 
                          x1="42.4" 
                          y1="72.6" 
                          x2="51.2" 
                          y2="77.7"
                          stroke="#228B22"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="8"
                        />
                      </g>
                    </svg>

                  </Link>
                  {user && (
                    <>
                      <Link
                        href="/files"
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 font-bold"
                      >
                        Files
                      </Link>
                      <Link
                        href="/chat"
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 font-bold"
                      >
                        Chat
                      </Link>
                    </>
                  )}
                </div>
                <div className="flex flex-row">
                  {user ? (
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block">Hey, {user.email}!</div>
                      <LogoutButton />
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="py-4 px-6 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </nav>
            <main className="w-full grow bg-background flex flex-col items-center h-[calc(100%-5rem)]">
              {children}
            </main>
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
