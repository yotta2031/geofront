/** 任务进度缓存（WebSocket 推送用，可替换为 Redis） */

type ProgressPayload = {
  progress: number;
  status: string;
};

const progressMap = new Map<string, ProgressPayload>();
const listeners = new Map<string, Set<(p: ProgressPayload) => void>>();

export function setTaskProgress(taskId: string, payload: ProgressPayload) {
  progressMap.set(taskId, payload);
  listeners.get(taskId)?.forEach((fn) => fn(payload));
}

export function getTaskProgress(taskId: string): ProgressPayload | undefined {
  return progressMap.get(taskId);
}

export function subscribeTaskProgress(
  taskId: string,
  fn: (p: ProgressPayload) => void
) {
  if (!listeners.has(taskId)) listeners.set(taskId, new Set());
  listeners.get(taskId)!.add(fn);
  const current = progressMap.get(taskId);
  if (current) fn(current);
  return () => listeners.get(taskId)?.delete(fn);
}
