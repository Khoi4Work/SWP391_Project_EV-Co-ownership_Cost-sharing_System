export function waitForCvReady(timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if ((window as any).cv && (window as any).cv.Mat) return resolve();
      if (Date.now() - start > timeout) return reject(new Error("OpenCV load timeout"));
      setTimeout(check, 100);
    };
    check();
  });
}