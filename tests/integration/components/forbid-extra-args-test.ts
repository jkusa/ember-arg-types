import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { click, render, resetOnerror, setupOnerror, settled } from '@ember/test-helpers';
import config from 'ember-get-config';

function forbidArgMessage(arg: string, component: string, expected: string[], guessedArg?: string) {
  const expectedArgs = expected.map((arg) => `'${arg}'`).join(',');
  const guess = guessedArg ? `(did you mean \`@${guessedArg}\`?) ` : '';
  return `Failed extra args check: Invalid argument \`@${arg}\` ${guess}supplied to \`${component}\`, expected [${expectedArgs}]`;
}

function wrongPropMessage(prop: string, actualType: string, component: string, expectedType: string) {
  return `Failed prop type: Invalid prop \`${prop}\` of type \`${actualType}\` supplied to \`${component}\`, expected \`${expectedType}\`.`;
}

function renderError(assert: Assert, errorMessage: string, assertMessage: string) {
  assert.expect(1);
  setupOnerror(function ({ message }: Error) {
    assert.equal(message, errorMessage, assertMessage);
  });
}

const extendedArgs = ['id', 'name', 'title', 'formalName', 'tunic', 'hearts', 'level', 'onClick', 'version', 'magic'];

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

    renderError(
      assert,
      forbidArgMessage('fakeArg', 'ExtendedCharacterComponent', extendedArgs),
      '@forbidExtraArgs will error if an invalid arg is passed'
    );

    await render(hbs`<ExtendedCharacter @name="name" @fakeArg="fake" />`);
  });

  test('it provides suggestions for similar args', async function (assert) {
    assert.expect(1);

    renderError(
      assert,
      forbidArgMessage('supermagic', 'ExtendedCharacterComponent', extendedArgs, 'magic'),
      '@forbidExtraArgs will error with suggession if a similar arg is passed'
    );

    await render(hbs`<ExtendedCharacter @name="name" @version={{1}} @supermagic={{true}} />`);
  });

  // @forbidExtraArgs extra arg error messages

  test('@forbidExtraArgs on top level class has correct extra arg error', async function (assert) {
    renderError(
      assert,
      forbidArgMessage('fakeArg', 'TopLevelComponent', ['top']),
      '@forbidExtraArgs on a top level component has correct class in extra arg error message'
    );
    await render(hbs`<TopLevel @top={{4}} @fakeArg="fake" />`);
  });

  test('@forbidExtraArgs on subclass has correct extra arg error', async function (assert) {
    renderError(
      assert,
      forbidArgMessage('fakeArg', 'ExtendedCharacterComponent', extendedArgs),
      '@forbidExtraArgs on a subclassed component has correct class in extra arg error message'
    );
    await render(hbs`<ExtendedCharacter @name="name" @fakeArg="fake" />`);
  });

  test('@forbidExtraArgs implicit on subclass has correct extra arg error', async function (assert) {
    renderError(
      assert,
      forbidArgMessage('fakeArg', 'ExtendedImplicitComponent', extendedArgs),
      '@forbidExtraArgs implicit on a subclassed component has correct class in extra arg error message'
    );
    await render(hbs`<ExtendedImplicit @name="name" @fakeArg="fake" />`);
  });

  test('@forbidExtraArgs explicit on subclass has correct extra arg error', async function (assert) {
    renderError(
      assert,
      forbidArgMessage('fakeArg', 'ExtendedExplicitComponent', extendedArgs),
      '@forbidExtraArgs explicit on a subclassed component has correct class in extra arg error message'
    );
    await render(hbs`<ExtendedExplicit @name="name" @fakeArg="fake" />`);
  });

  // @forbidExtraArgs wrong arg error messages

  test('@forbidExtraArgs on top level class has correct wrong arg error', async function (assert) {
    renderError(
      assert,
      wrongPropMessage('top', 'string', 'TopLevelComponent', 'number'),
      '@forbidExtraArgs on a top level component has correct class in wrong arg error message'
    );
    await render(hbs`<TopLevel @top="wrong" />`);
  });

  test('@forbidExtraArgs on subclass has correct extra arg error', async function (assert) {
    renderError(
      assert,
      wrongPropMessage('version', 'string', 'ExtendedCharacterComponent', 'number'),
      '@forbidExtraArgs on a subclassed component has correct class in wrong arg error message'
    );
    await render(hbs`<ExtendedCharacter @name="name" @version="wrong" />`);
  });

  test('@forbidExtraArgs implicit on subclass has correct extra arg error', async function (assert) {
    renderError(
      assert,
      wrongPropMessage('version', 'string', 'ExtendedImplicitComponent', 'number'),
      '@forbidExtraArgs implicit on a subclassed component has correct class in wrong arg error message'
    );
    await render(hbs`<ExtendedImplicit @name="name" @version="wrong" />`);
  });

  test('@forbidExtraArgs explicit on subclass has correct extra arg error', async function (assert) {
    renderError(
      assert,
      wrongPropMessage('version', 'string', 'ExtendedExplicitComponent', 'number'),
      '@forbidExtraArgs explicit on a subclassed component has correct class in wrong arg error message'
    );
    await render(hbs`<ExtendedExplicit @name="name" @version="wrong" />`);
  });
});
