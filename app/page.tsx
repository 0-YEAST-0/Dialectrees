import Link from 'next/link';
import SignOut from '@/components/SignOut';
import auth0 from "./auth0";
import { getUser } from '@/db/user';

export async function AuthButtons() {
  const user = (await auth0.getSession())?.user; 
  if (user) {
    const dbUser = await getUser(user!.sub);
    return (
      <div className="flex items-center space-x-4">
        <span className="text-gray-700">
          {dbUser.username}
        </span>
        <SignOut />
        <Link href="/app">
          <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl">
            Go to App
          </button>
        </Link>
        
      </div>
    );
  }

  // Not authenticated - show original login/register buttons
  return (
    <div className="flex space-x-4">
      <Link href="/auth/login?returnTo=/app">
        <button className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors">
          Sign In
        </button>
      </Link>
      <Link href="/auth/login?screen_hint=signup&returnTo=/app">
        <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl">
          Sign Up
        </button>
      </Link>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-tl from-red-100 to-white">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="w-full mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="text-black">Dialec</span>
            <span className="text-red-600">trees</span>
          </div>
          <AuthButtons/>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-6 min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto text-center">
          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8">
            <span className="text-black">Dialec</span>
            <span className="text-red-600">trees</span>
          </h1>
          
          {/* Description */}
          <p className="text-2xl md:text-3xl text-gray-600 mb-12 font-light">
            Automate discourse
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link href={"/auth/login?screen_hint=signup&returnTo=/app"}>
              <button className="px-8 py-4 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                Get Started
              </button>
            </Link>
            <button className="px-8 py-4 border-2 border-red-600 text-red-600 text-lg font-semibold rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}