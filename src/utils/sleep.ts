export function sleep(duration: number): Promise<void> {
  if (duration <= 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => setTimeout(resolve, duration));
}

export function sleepUntil(date: Date): Promise<void> {
  const now = Date.now();
  const target = date.getTime();
  const duration = target - now;

  return sleep(duration);
}
