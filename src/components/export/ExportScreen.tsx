'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { client } from '@/lib/orpc';
import type { ExportData } from '@/lib/types';
import {
  Download,
  Upload,
  Copy,
  CheckCircle2,
  FileJson,
  AlertTriangle,
  Activity,
  Trash2,
} from 'lucide-react';

function downloadJSON(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function ExportScreen() {
  const [status, setStatus] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState('');

  const handleExportFull = async () => {
    try {
      const data = await client.export({});
      downloadJSON(data, `workout-export-${format(new Date(), 'yyyy-MM-dd')}.json`);
      setStatus('完整导出已下载。');
    } catch {
      setStatus('导出失败。');
    }
  };

  const handleCopyFull = async () => {
    try {
      const data = await client.export({});
      await copyToClipboard(JSON.stringify(data, null, 2));
      setStatus('完整JSON已复制到剪贴板。');
    } catch {
      setStatus('复制失败。');
    }
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importText) as ExportData;
      const result = await client.import({ action: 'import', data });
      setStatus(result.message);
      if (result.ok) {
        setImporting(false);
        setImportText('');
      }
    } catch {
      setStatus('JSON格式无效，请检查格式。');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const data = JSON.parse(text) as ExportData;
        const result = await client.import({ action: 'import', data });
        setStatus(result.message);
      } catch {
        setStatus('JSON文件无效。');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (window.confirm('这将删除所有数据，此操作无法撤销。确定要继续吗？')) {
      await client.import({ action: 'clear' });
      setStatus('所有数据已清除。');
    }
  };

  const handleResetApp = async () => {
    if (
      window.confirm('这将重置整个应用到初始状态。确定要继续吗？')
    ) {
      await client.import({ action: 'reset' });
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h2 className="font-display text-3xl tracking-tight">导出与导入</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          数据归你所有。在此导出、导入或管理数据。
        </p>
      </div>

      {/* Status */}
      {status && (
        <Card className="border-green-300/50 dark:border-green-800/50 shadow-sm animate-fade-in">
          <CardContent className="flex items-center gap-3 p-3.5">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
            <p className="text-sm">{status}</p>
          </CardContent>
        </Card>
      )}

      {/* Export options */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          导出
        </h3>

        <div className="grid gap-2.5">
          <Button variant="outline" onClick={handleExportFull} className="justify-start h-auto py-3.5 rounded-xl border-border/60 hover:border-border">
            <Download className="mr-3 h-4 w-4 shrink-0 text-primary/70" />
            <div className="text-left">
              <p className="text-sm font-medium">下载完整导出</p>
              <p className="text-xs text-muted-foreground">所有数据为JSON文件</p>
            </div>
          </Button>

          <Button variant="outline" onClick={handleCopyFull} className="justify-start h-auto py-3.5 rounded-xl border-border/60 hover:border-border">
            <Copy className="mr-3 h-4 w-4 shrink-0 text-primary/70" />
            <div className="text-left">
              <p className="text-sm font-medium">复制JSON到剪贴板</p>
              <p className="text-xs text-muted-foreground">完整导出为文本</p>
            </div>
          </Button>
        </div>
      </div>

      {/* Import */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          导入
        </h3>

        <div className="grid gap-2.5">
          <label className="cursor-pointer">
            <Button variant="outline" className="justify-start h-auto py-3.5 w-full pointer-events-none rounded-xl border-border/60">
              <Upload className="mr-3 h-4 w-4 shrink-0 text-primary/70" />
              <div className="text-left">
                <p className="text-sm font-medium">从文件导入</p>
                <p className="text-xs text-muted-foreground">上传JSON导出文件</p>
              </div>
            </Button>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileImport}
            />
          </label>

          <Button
            variant="outline"
            onClick={() => setImporting(!importing)}
            className="justify-start h-auto py-3.5 rounded-xl border-border/60 hover:border-border"
          >
            <FileJson className="mr-3 h-4 w-4 shrink-0 text-primary/70" />
            <div className="text-left">
              <p className="text-sm font-medium">从文本导入</p>
              <p className="text-xs text-muted-foreground">直接粘贴JSON</p>
            </div>
          </Button>
        </div>

        {importing && (
          <Card className="shadow-sm animate-fade-in">
            <CardContent className="p-4 space-y-3">
              <Label htmlFor="importJson">粘贴你的JSON导出：</Label>
              <Textarea
                id="importJson"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"schemaVersion": "1.0.0", ...}'
                rows={6}
                className="font-mono text-xs rounded-lg"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleImport} disabled={!importText.trim()} className="rounded-lg">
                  导入
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setImporting(false);
                    setImportText('');
                  }}
                  className="rounded-lg"
                >
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Data management */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          数据管理
        </h3>

        <div className="grid gap-2.5">
          <Button
            variant="outline"
            onClick={handleClearData}
            className="justify-start h-auto py-3.5 rounded-xl border-red-200/60 dark:border-red-900/40 hover:border-red-300 dark:hover:border-red-800"
          >
            <Trash2 className="mr-3 h-4 w-4 shrink-0 text-red-500/70" />
            <div className="text-left">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">清除所有数据</p>
              <p className="text-xs text-muted-foreground">删除记录，保留设置</p>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={handleResetApp}
            className="justify-start h-auto py-3.5 rounded-xl border-red-200/60 dark:border-red-900/40 hover:border-red-300 dark:hover:border-red-800"
          >
            <AlertTriangle className="mr-3 h-4 w-4 shrink-0 text-red-500/70" />
            <div className="text-left">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">重置整个应用</p>
              <p className="text-xs text-muted-foreground">恢复初始状态</p>
            </div>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 py-3">
        <Activity className="h-3 w-3 text-primary/40" />
        <p className="text-center text-xs text-muted-foreground italic">
          数据归你，规则由你。清除前请先导出。
        </p>
        <Activity className="h-3 w-3 text-primary/40" />
      </div>
    </div>
  );
}
