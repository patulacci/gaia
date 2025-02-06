import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Index() {
  const cookeStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookeStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-b from-green-50 to-white">
      <div className="flex flex-col gap-14 max-w-4xl px-3 py-16 lg:py-24 text-foreground relative">
        {/* Nature-inspired decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-200/20 to-transparent rounded-full -z-10 blur-xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-green-100/30 to-transparent rounded-full -z-10 blur-xl" />
        
        <div className="flex flex-col items-center mb-4 lg:mb-12">
          <h1 className="text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 via-green-400 to-green-500 text-transparent bg-clip-text">
            Arya
          </h1>
          <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center mb-12 text-gray-700">
            Your expert in <span className="text-green-600 font-semibold">sustainable</span> real estate
          </p>
          {user ? (
            <div className="flex flex-row gap-4">
              <Link
                href="/files"
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 transition-all py-4 px-8 rounded-full font-medium text-white shadow-lg hover:shadow-xl"
              >
                Upload Files
              </Link>
              <Link
                href="/chat"
                className="bg-white hover:bg-gray-50 border-2 border-green-500 py-4 px-8 rounded-full font-medium text-green-600 shadow-lg hover:shadow-xl transition-all"
              >
                Start Chat
              </Link>
            </div>
          ) : (
            <div className="flex flex-row gap-4">
              <Link
                href="/login"
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 transition-all py-4 px-8 rounded-full font-medium text-white shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Nature-inspired divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-green-200 to-transparent opacity-50" />

        {/* Features section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
            <div className="text-green-600 text-lg font-semibold mb-2">Sustainable Solutions</div>
            <p className="text-gray-600">Expert advice on eco-friendly real estate options and green building practices.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
            <div className="text-green-600 text-lg font-semibold mb-2">Smart Analysis</div>
            <p className="text-gray-600">Data-driven insights to help you make informed sustainable property decisions.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
            <div className="text-green-600 text-lg font-semibold mb-2">Future-Ready</div>
            <p className="text-gray-600">Stay ahead with innovative approaches to sustainable real estate development.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
