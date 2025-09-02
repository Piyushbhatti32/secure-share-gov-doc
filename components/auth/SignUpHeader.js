import Image from 'next/image';

export default function SignUpHeader() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600/80 via-cyan-600/80 to-purple-600/80 p-6 text-center">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="relative w-12 h-12">
          <Image 
            src="/icon.svg" 
            alt="SecureDocShare Logo" 
            width={48} 
            height={48}
            priority
            className="object-contain filter drop-shadow-lg"
          />
          {/* Electric glow around logo */}
          <div className="absolute inset-0 bg-blue-400 rounded-full blur-md animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            SecureDocShare
          </h1>
          <p className="text-blue-100 text-sm">Digital Document Management</p>
        </div>
      </div>
      <h2 className="text-xl font-bold text-white drop-shadow-lg">
        Create New Account
      </h2>
    </div>
  );
}
