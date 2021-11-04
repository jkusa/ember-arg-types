import isElementDescriptor from './-private/is-element-descriptor';
import throwConsoleError from './-private/throw-console-error';
import Component from '@glimmer/component';
import PropTypes, { Validator } from 'prop-types';
import config from 'ember-get-config';
import { isNone } from '@ember/utils';
import { closest } from './-private/closest-string';
import { macroCondition, isDevelopingApp } from '@embroider/macros';

const REGISTERED_ARGS = Symbol('args');
const INTERCEPT_CLASS = 'ForbidExtraArgsIntercept';

function shouldThrowErrors(): boolean {
  const throwErrors = config['ember-arg-types']?.throwErrors;
  return isNone(throwErrors) ? true : throwErrors;
}

function getClassName(instance: any): string {
  return instance.constructor.name === INTERCEPT_CLASS // if the current class is this override
    ? Object.getPrototypeOf(instance.constructor).name // get parent class name
    : instance.constructor.name; // use current class name
}

function createGetter<T extends Component>(
  target: any,
  key: string,
  descriptor: any,
  validator?: Validator<any>
): PropertyDescriptor {
  if (macroCondition(isDevelopingApp())) {
    const registeredArgs = target[REGISTERED_ARGS] ?? new Set<string>();
    registeredArgs.add(key);
    target[REGISTERED_ARGS] = registeredArgs;
  }

  const defaultInitializer = descriptor.initializer || descriptor.get || (() => undefined);
  return {
    get(this: T): any {
      const argValue = (<any>this.args)[key];
      const returnValue = argValue !== undefined ? argValue : defaultInitializer.call(this);

      if (macroCondition(isDevelopingApp())) {
        const shouldThrow = shouldThrowErrors();
        if (validator) {
          throwConsoleError(() => {
            PropTypes.checkPropTypes({ [key]: validator }, { [key]: returnValue }, 'prop', getClassName(this));
          }, shouldThrow);
        }
      }

      return returnValue;
    },
  };
}

export default function arg<T extends Component>(target: T, key: string): any;
export default function arg(typeValidator?: Validator<any>, ...args: any[]): PropertyDecorator;
export default function arg<T extends Component>(...args: any[]): any {
  if (isElementDescriptor(...args)) {
    return createGetter(...(args as [T, string, PropertyDescriptor]));
  }

  const [validator] = args;
  return function argument<T extends Component>(...args: any[]): any {
    return createGetter(...(([...args, validator] as unknown) as [T, string, any, Validator<any>?]));
  };
}

export function forbidExtraArgs(target: any) {
  let returnClass = target;

  // only sublcass in debug mode
  if (macroCondition(isDevelopingApp())) {
    returnClass = class ForbidExtraArgsIntercept extends target {
      declare [REGISTERED_ARGS]?: Set<string>;

      constructor(_owner: unknown, args: Record<string, unknown>) {
        super(...arguments);
        let component = getClassName(this);

        const registeredArgs = this[REGISTERED_ARGS];
        if (!registeredArgs) {
          return;
        }
        const unRegisteredArg = Object.keys(args).find((arg) => !registeredArgs.has(arg));

        if (unRegisteredArg) {
          const guessedArg = closest(unRegisteredArg, [...registeredArgs]);
          const suggestion = guessedArg ? `(did you mean \`@${guessedArg}\`?) ` : '';
          const expected = [...registeredArgs].map((arg) => `'${arg}'`);

          const msg = `Failed extra args check: Invalid argument \`@${unRegisteredArg}\` ${suggestion}supplied to \`${component}\`, expected [${expected}]`;

          const shouldThrow = shouldThrowErrors();
          if (shouldThrow) {
            throw new Error(msg);
          } else {
            console.error(msg);
          }
        }
      }
    };
  }

  return returnClass;
}
