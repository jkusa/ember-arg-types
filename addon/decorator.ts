import isElementDescriptor from './-private/is-element-descriptor';
import throwConsoleError from './-private/throw-console-error';
import Component from '@glimmer/component';
import { runInDebug } from '@ember/debug';
import PropTypes, { Validator } from 'prop-types';
import config from 'ember-get-config';
import { isNone } from '@ember/utils';
import { closest } from './-private/closest-string';

const REGISTERED_ARGS = Symbol('args');

function shouldThrowErrors(): boolean {
  const throwErrors = config['ember-arg-types']?.throwErrors;
  return isNone(throwErrors) ? true : throwErrors;
}

function createGetter<T extends Component>(
  target: any,
  key: string,
  descriptor: any,
  validator?: Validator<any>
): PropertyDescriptor {
  const registeredArgs = target[REGISTERED_ARGS] ?? new Set<string>();
  registeredArgs.add(key);
  target[REGISTERED_ARGS] = registeredArgs;

  const defaultInitializer = descriptor.initializer || descriptor.get || (() => undefined);
  return {
    get(this: T): any {
      const argValue = (<any>this.args)[key];
      const returnValue = argValue !== undefined ? argValue : defaultInitializer.call(this);

      runInDebug(() => {
        const shouldThrow = shouldThrowErrors();
        if (validator) {
          throwConsoleError(() => {
            PropTypes.checkPropTypes({ [key]: validator }, { [key]: returnValue }, 'prop', this.constructor.name);
          }, shouldThrow);
        }
      });

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
    return createGetter(...([...args, validator] as unknown as [T, string, any, Validator<any>?]));
  };
}

export function forbidExtraArgs(target: any) {
  let returnClass = target;

  // only sublcass in debug mode
  runInDebug(() => {
    const interceptClass = 'ForbidExtraArgsIntercept';
    returnClass = class ForbidExtraArgsIntercept extends target {
      declare [REGISTERED_ARGS]?: Set<string>;

      constructor(_owner: unknown, args: Record<string, unknown>) {
        super(...arguments);
        let component =
          this.constructor.name === interceptClass // if the current class is this override
            ? Object.getPrototypeOf(this.constructor).name // get parent class name
            : this.constructor.name; // use current class name

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
  });

  return returnClass;
}
