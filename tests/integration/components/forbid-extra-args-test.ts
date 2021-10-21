import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { click, render, resetOnerror, setupOnerror, settled } from '@ember/test-helpers';
import config from 'ember-get-config';

module('Integration | Decorator | forbidExtraArgs', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    resetOnerror();
  });

  test('it does not forbid extra arguments without the decorator', async function (assert) {
    assert.expect(1);

    await render(hbs`<Character @name="valid" @fakeArg={{true}}/>`);
    assert.dom('.name').hasText('valid', 'When @forbidExtraArgs is not present, no errors are thrown for extra args');
  });

  test('extra arg errors can be disabled', async function (assert) {
    assert.expect(1);

    config['ember-arg-types']!.throwErrors = false;

    await render(hbs`<ExtendedCharacter @name="valid" @fakeArg={{true}}/>`);
    assert
      .dom('.character--extended')
      .exists('When `throwErrors` is set to false, extra arg check `Error`s are disabled');

    config['ember-arg-types']!.throwErrors = true;
  });

  test('it forbids extra arguments', async function (assert) {
    assert.expect(1);

    setupOnerror(function ({ message }: Error) {
      assert.equal(
        message,
        "Failed extra args check: Invalid argument `@fakeArg` supplied to `ExtendedCharacterComponent`, expected ['id','name','title','formalName','tunic','hearts','level','onClick','version','magic']",
        'If @forbidExtraArgs is enabled, an error will be thrown if an invalid arg is passed'
      );
    });

    await render(hbs`<ExtendedCharacter @name="name" @fakeArg="fake" />`);
  });

  test('it provides suggestions for mispelled args', async function (assert) {
    assert.expect(1);

    setupOnerror(function ({ message }: Error) {
      assert.equal(
        message,
        "Failed extra args check: Invalid argument `@supermagic` (did you mean `@magic`?) supplied to `ExtendedCharacterComponent`, expected ['id','name','title','formalName','tunic','hearts','level','onClick','version','magic']",
        'If @forbidExtraArgs is enabled, an error will be thrown if an invalid arg is passed'
      );
    });

    await render(hbs`<ExtendedCharacter @name="name" @version={{1}} @supermagic={{true}} />`);
  });

  test('it forbids extra arguments on subclasses', async function (assert) {
    assert.expect(1);

    setupOnerror(function ({ message }: Error) {
      assert.equal(
        message,
        "Failed extra args check: Invalid argument `@fakeArg` supplied to `ExtendedWithSafeComponent`, expected ['id','name','title','formalName','tunic','hearts','level','onClick','version','magic']",
        'If @forbidExtraArgs is enabled, an error will be thrown if an invalid arg is passed to a subclassed component'
      );
    });

    await render(hbs`<ExtendedWithSafe @name="name" @fakeArg="fake" />`);
  });
});
