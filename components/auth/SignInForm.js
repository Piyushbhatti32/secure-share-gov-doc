'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInForm() {
  return (
    <div className="relative z-10">
      <SignIn 
        fallbackRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorText: '#ffffff',
            colorInputText: '#ffffff',
            colorPrimary: '#60a5fa',
            colorAlphaShade: 'rgba(255,255,255,0.2)'
          },
          elements: {
            formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl',
            rootBox: 'w-full',
            card: 'bg-transparent shadow-none w-full max-w-none',
            main: 'w-full',
            content: 'w-full',
            scrollBox: 'w-full',
            cardBox: 'w-full',
            header: 'w-full',
            form: 'w-full',
            formField: 'w-full',
            formFieldRow: 'w-full',
            formButtonRow: 'w-full',
            footer: 'w-full',
            footerAction: 'w-full',
            socialButtons: 'w-full',
            headerTitle: 'text-white',
            headerSubtitle: 'text-blue-200',
            socialButtonsBlockButton: 'bg-white/10 hover:bg-white/20 border border-blue-500/30 text-white w-full',
            formFieldInput: 'bg-black/50 border border-blue-500/30 text-white placeholder-blue-300 focus:border-blue-400 focus:ring-blue-400',
            // Ensure verification code inputs are visible
            codeInput: 'text-white',
            otpInput: 'text-white',
            otpCodeFieldInput: 'text-white',
            pinInputInput: 'text-white',
            formFieldLabel: 'text-blue-200',
            footerActionLink: 'text-blue-400 hover:text-blue-300',
            dividerLine: 'bg-blue-500/30',
            dividerText: 'text-blue-300'
          }
        }}
      />
      <div className="mt-6 text-center">
        <span className="text-blue-200">Don't have an account?</span>{' '}
        <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 underline transition-colors duration-300">
          Sign up
        </Link>
      </div>
    </div>
  );
}
