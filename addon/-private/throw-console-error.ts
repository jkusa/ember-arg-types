import { macroCondition, isDevelopingApp } from '@embroider/macros';

type ThrowConsoleError = (fn: Function, enabled: boolean) => void;

let throwConsoleError: ThrowConsoleError;
if (macroCondition(isDevelopingApp())) {
  throwConsoleError = (fn: Function, enabled: boolean = true) => {
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
  };
} else {
  throwConsoleError = () => {
    throw new Error('throwConsoleError() is not available in production');
  };
}

export default throwConsoleError;
