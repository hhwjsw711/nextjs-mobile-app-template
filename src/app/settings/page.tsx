'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppShell } from '@/components/shared/AppShell';
import { SettingsScreen } from '@/components/settings/SettingsScreen';
import { SignInButton } from '@clerk/nextjs';

function AuthPrompt() {
  return (
    <div className="h-dvh flex flex-col items-center justify-center p-6 bg-background">
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-bold mb-4">需要登录</h1>
        <p className="text-muted-foreground mb-6">
          请登录以访问设置
        </p>
        <SignInButton mode="redirect">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
            登录
          </button>
        </SignInButton>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Optional: redirect to home
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="h-dvh flex items-center justify-center bg-background">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <AuthPrompt />;
  }

  return (
    <AppShell>
      <SettingsScreen />
    </AppShell>
  );
}
