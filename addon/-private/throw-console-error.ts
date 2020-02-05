export default function throwConsoleError(fn: Function, enabled: boolean = true) {
  const original = console.error;
  console.error = enabled
    ? (...args: any[]) => {
        throw new Error(args[0]);
      }
    : original;
  try {
    fn();
  } catch (e) {
    throw e;
  } finally {
    console.error = original;
  }
}
