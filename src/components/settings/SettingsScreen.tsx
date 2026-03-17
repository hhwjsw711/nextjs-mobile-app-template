'use client';

import { useState } from 'react';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useProfile } from '@/hooks/useProfile';
import { useSchedule } from '@/hooks/useSchedule';
import { useTheme } from '@/hooks/useTheme';
import { client } from '@/lib/orpc';
import { Sun, Moon, Monitor, AlertTriangle, Trash2, LogOut, User } from 'lucide-react';
import { SCHEDULE_TYPE_LABELS } from '@/lib/defaults';

export function SettingsScreen() {
  const { profile, updateProfile } = useProfile();
  const { schedule, updateSlot, resetSchedule } = useSchedule();
  const { mode, setMode } = useTheme();
  const { user } = useUser();
  const [showDanger, setShowDanger] = useState(false);

  const handleClearData = async () => {
    if (window.confirm('这将删除所有数据，此操作无法撤销。确定要继续吗？')) {
      await client.import({ action: 'clear' });
      window.location.reload();
    }
  };

  const handleResetAll = async () => {
    if (
      window.confirm(
        '这将删除所有数据并将应用重置为初始状态。确定要继续吗？'
      )
    ) {
      await client.import({ action: 'reset' });
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h2 className="font-display text-3xl tracking-tight">设置</h2>
        <p className="text-sm text-muted-foreground mt-1">
          自定义你的计划和偏好。
        </p>
      </div>

      {/* Account */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-sm font-medium">账户</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{user?.emailAddresses?.[0]?.emailAddress || '用户'}</p>
                <p className="text-xs text-muted-foreground">数据已同步到云端</p>
              </div>
            </div>
            <SignOutButton>
              <Button variant="outline" size="sm" className="rounded-lg">
                <LogOut className="h-4 w-4 mr-1.5" />
                退出登录
              </Button>
            </SignOutButton>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-sm font-medium">外观</h3>
          <div className="flex gap-2">
            {([
              { value: 'system' as const, label: '跟随系统', icon: Monitor },
              { value: 'light' as const, label: '浅色', icon: Sun },
              { value: 'dark' as const, label: '深色', icon: Moon },
            ]).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm transition-all duration-200 ${
                  mode === value
                    ? 'border-primary/40 bg-primary/5 font-medium shadow-sm'
                    : 'border-border/60 hover:bg-accent/40 hover:border-border'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">计划</h3>
            <Button variant="ghost" size="sm" onClick={resetSchedule} className="rounded-lg text-xs">
              恢复默认
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wakeTime">起床时间</Label>
            <Input
              id="wakeTime"
              type="time"
              value={profile.wakeTime}
              onChange={(e) => updateProfile({ wakeTime: e.target.value })}
              className="rounded-lg"
            />
          </div>

          <Separator />

          <div className="space-y-3">
            {schedule.map((slot, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 flex-1">
                  <Switch
                    checked={slot.enabled}
                    onCheckedChange={(checked) => updateSlot(i, { enabled: checked })}
                    aria-label={`启用 ${SCHEDULE_TYPE_LABELS[slot.type] || slot.type}`}
                  />
                  <span className="text-sm">
                    {SCHEDULE_TYPE_LABELS[slot.type] || slot.type}
                  </span>
                </div>
                <Input
                  type="time"
                  value={slot.time}
                  onChange={(e) => updateSlot(i, { time: e.target.value })}
                  className="w-32 rounded-lg"
                  disabled={!slot.enabled}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-medium">隐私与安全</h3>
          <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
              数据通过 Clerk 账户安全隔离存储。
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
              数据存储在 Turso 边缘数据库，全球快速访问。
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
              无分析、遥测或第三方跟踪。
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
              随时可在导出页面导出你的数据。
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200/60 dark:border-red-900/40 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <button
            onClick={() => setShowDanger(!showDanger)}
            className="flex items-center gap-2.5 text-sm font-medium text-red-600 dark:text-red-400"
          >
            <AlertTriangle className="h-4 w-4" />
            数据管理
          </button>

          {showDanger && (
            <div className="space-y-2.5 ml-6.5 animate-fade-in">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearData}
                className="text-red-600 border-red-200/60 dark:text-red-400 dark:border-red-900/40 rounded-lg"
              >
                <Trash2 className="mr-1.5 h-3 w-3" />
                清除所有记录（保留设置）
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAll}
                className="text-red-600 border-red-200/60 dark:text-red-400 dark:border-red-900/40 rounded-lg"
              >
                <Trash2 className="mr-1.5 h-3 w-3" />
                重置整个应用
              </Button>
              <p className="text-xs text-muted-foreground leading-relaxed">
                这些操作无法撤销，请先导出数据。
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
