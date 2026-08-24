import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string, replacements: {from: string | RegExp, to: string}[]) {
  const fullPath = path.resolve(process.cwd(), filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const {from, to} of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(fullPath, content, 'utf8');
}

// 1. App.tsx
replaceInFile('src/App.tsx', [
  { from: 'const { isLoading, refreshToken, rememberMe, setLoading } = useAuthStore();', to: 'const { refreshToken, rememberMe, setLoading } = useAuthStore();' }
]);

// 2. TaskDrawer.tsx
replaceInFile('src/components/board/TaskDrawer.tsx', [
  { from: "import { clsx } from 'clsx';\n", to: '' },
  { from: 'import type { Task, User, Comment, TaskPriority, TaskStatus } from \'../../types\';', to: 'import type { Task, User, TaskPriority, TaskStatus } from \'../../types\';' },
  { from: 'const { success, error: showError } = useToast();', to: 'const { success } = useToast();' }
]);

// 3. Sidebar.tsx
replaceInFile('src/components/layout/Sidebar.tsx', [
  { from: "import React, { useState } from 'react';", to: "import React from 'react';" }
]);

// 4. NotificationPanel.tsx
replaceInFile('src/components/notifications/NotificationPanel.tsx', [
  { from: 'const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {', to: 'const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose: _onClose }) => {' }
]);

// 5. useToast.test.ts
replaceInFile('src/hooks/__tests__/useToast.test.ts', [
  { from: 'let id2: string;\n', to: '' },
  { from: 'id2 = addToast({ type: \'error\', title: \'Toast 2\', duration: 0 });', to: 'addToast({ type: \'error\', title: \'Toast 2\', duration: 0 });' }
]);

// 6. api-client.test.ts
replaceInFile('src/lib/__tests__/api-client.test.ts', [
  { from: "import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';", to: "import { describe, it, expect, vi, beforeEach } from 'vitest';" },
  { from: "import axios from 'axios';\n", to: '' },
  { from: "import type { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';\n", to: '' }
]);

// 7. api-client.ts
replaceInFile('src/lib/api-client.ts', [
  { from: "import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';", to: "import axios, { type InternalAxiosRequestConfig, AxiosError } from 'axios';" }
]);

// 8. BoardPage.tsx
replaceInFile('src/pages/BoardPage.tsx', [
  { from: '(event: DragOverEvent) => {', to: '(_event: DragOverEvent) => {' }
]);

// 9. board.store.test.ts
replaceInFile('src/stores/__tests__/board.store.test.ts', [
  { from: 'const { initialize, addTask } = useBoardStore.getState();', to: 'const { initialize } = useBoardStore.getState();' }
]);

// 10. board.store.ts
replaceInFile('src/stores/board.store.ts', [
  { from: 'const tasksInTargetColumn = updatedTasks', to: 'const _tasksInTargetColumn = updatedTasks' }
]);

console.log('Fixes applied.');
