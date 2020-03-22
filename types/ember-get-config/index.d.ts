declare module 'ember-get-config' {
  interface AddonOptions {
    throwErrors?: boolean;
  }
  interface EmberConfig {
    'ember-arg-types'?: AddonOptions;
  }

  const value: EmberConfig;
  export default value;
}
