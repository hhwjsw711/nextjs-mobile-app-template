'use client';

import { useEffect } from 'react';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { AppShell } from '@/components/shared/AppShell';
import { TabProvider } from '@/components/shared/TabContext';
import { TabPane } from '@/components/shared/TabPane';
import { TodayScreen } from '@/components/today/TodayScreen';
import { LogScreen } from '@/components/log/LogScreen';
import { TimerScreen } from '@/components/timer/TimerScreen';
import { HistoryScreen } from '@/components/history/HistoryScreen';
import { TemplatesScreen } from '@/components/templates/TemplatesScreen';
import { GoalsScreen } from '@/components/goals/GoalsScreen';
import { registerServiceWorker } from '@/lib/sw-register';

function AuthPrompt() {
  return (
    <div className="h-dvh flex flex-col items-center justify-center p-6 bg-background">
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-bold mb-4">健身追踪</h1>
        <p className="text-muted-foreground mb-6">
          登录以同步您的锻炼记录
        </p>
        <SignInButton mode="redirect">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
            登录 / 注册
          </button>
        </SignInButton>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="h-dvh flex items-center justify-center bg-background">
      <div className="text-muted-foreground">加载中...</div>
    </div>
  );
}

function AppContent() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingFallback />;
  }

  if (!isSignedIn) {
    return <AuthPrompt />;
  }

  return (
    <TabProvider>
      <AppShell>
        <TabPane>
          <TodayScreen />
        </TabPane>
        <TabPane>
          <LogScreen />
        </TabPane>
        <TabPane>
          <TimerScreen />
        </TabPane>
        <TabPane>
          <HistoryScreen />
        </TabPane>
        <TabPane>
          <TemplatesScreen />
        </TabPane>
        <TabPane>
          <GoalsScreen />
        </TabPane>
      </AppShell>
    </TabProvider>
  );
}

export default function HomePage() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return <AppContent />;
}
