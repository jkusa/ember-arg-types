export default function throwConsoleError(fn: Function, enabled: boolean = true) {
  const original = console.error;
  console.error = enabled
    ? (msg: string) => {
        const errorMsg = msg.replace(/^Warning: /, '');
        throw new Error(errorMsg);
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
