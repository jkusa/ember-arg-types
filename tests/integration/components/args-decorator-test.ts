import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { click, render, resetOnerror, setupOnerror, settled } from '@ember/test-helpers';
import config from 'ember-get-config';

module('Integration | Decorator | arg', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    resetOnerror();
  });

  test('it allows defaults', async function (assert) {
    await render(hbs`<Character @name="link"/>`);

    assert.dom('.id').hasText(/ember\d+/, '@arg can use a getter as a default value');
    assert.dom('.title').hasText('hero of time', '@arg can use an initialized value as a default');
    assert.dom('.hearts').hasText('12', '@arg() can use an initialized value as a default');
    assert.dom('.level').hasNoText('@arg will pass `undefined` as a default when an initializer is not present');
  });

  test('it uses the correct context in property initializers', async function (assert) {
    await render(hbs`<Character @name="link" />`);

    const argId = document.querySelector('.id')?.textContent;
    const privateId = document.querySelector('._id')?.textContent;

    assert.strictEqual(argId, privateId, '@arg calls the default getter with the correct context');
  });

  test('it allows default overrides', async function (assert) {
    this.set('hearts', 13);
    this.set('level', 2);
    await render(hbs`
      <Character
        @id="1"
        @name="zelda"
        @title="princess of hyrule"
        @hearts={{this.hearts}}
        @level={{this.level}}
        @levelUp={{this.levelUp}}
      />
    `);

    assert.dom('.id').hasText('1', '@arg can override component getter with `this.arg` value');
    assert.dom('.title').hasText('princess of hyrule', '@arg can override component value with `this.arg` value');
    assert.dom('.hearts').hasText('13', '@arg() can override component value with `this.arg` value');
    assert.dom('.level').hasText('2', '@arg() can override component uninitialized value with `this.arg` value');
  });

  test('it checks types on initial render', async function (assert) {
    assert.expect(1);

    setupOnerror(function (error: unknown) {
      const { message } = error as Error;
      assert.strictEqual(
        message,
        'Failed prop type: The prop `name` is marked as required in `CharacterComponent`, but its value is `undefined`.',
        'If @args() contains a PropType validator, an error will be thrown if the value is incorrect'
      );
    });
    await render(hbs`<Character/>`);
  });

  test('it checks types on arg update', async function (assert) {
    assert.expect(1);

    this.set('name', 'link');
    await render(hbs`<Character @name={{this.name}} />`);

    setupOnerror(function (error: unknown) {
      const { message } = error as Error;
      assert.strictEqual(
        message,
        'Failed prop type: Invalid prop `name` of type `number` supplied to `CharacterComponent`, expected `string`.',
        'If @args() contains a PropType validator, an error will be thrown if the value is incorrect'
      );
    });
    this.set('name', 1986);
    await settled();
  });

  test('type check errors can be disabled', async function (assert) {
    assert.expect(1);

    config['ember-arg-types']!.throwErrors = false;

    await render(hbs` <Character @name={{true}}/>`);
    assert.dom('.name').hasText('true', 'When `throwErrors` is set to false, type checks `Error`s are disabled');

    config['ember-arg-types']!.throwErrors = true;
  });

  test('it supports actions', async function (assert) {
    assert.expect(3);

    await render(hbs`
      <Character
        @name="link"
        @onClick={{this.onClick}}
      />
    `);

    await click('.character');
    assert.ok(true, 'A default function can be declared for an action');

    setupOnerror(function (error: unknown) {
      const { message } = error as Error;
      assert.strictEqual(
        message,
        'Failed prop type: Invalid prop `onClick` of type `string` supplied to `CharacterComponent`, expected `function`.',
        'If @args() contains a PropType validator, an error will be thrown if the value is incorrect'
      );
    });
    this.set('onClick', 'not a function');
    await settled();

    this.set('onClick', () => {
      assert.ok(true, 'A custom function can override default action');
    });
    await click('.character');
  });

  test('it supports reactive default getters', async function (assert) {
    await render(hbs`
      <Character
        @name="link"
        @title={{this.title}}
        @formalName={{this.formalName}}
      />
    `);

    assert
      .dom('.formal-name')
      .hasText('link, hero of time', '@arg can use a default getter that is computed with other args');

    this.set('title', 'hero of hyrule');
    assert
      .dom('.formal-name')
      .hasText('link, hero of hyrule', '@arg will recompute a default value when a dependent arg changes');

    this.set('formalName', 'hero of legend');
    assert.dom('.formal-name').hasText('hero of legend', 'an @arg default getter can be overridden with a value');

    this.set('formalName', undefined);
    this.set('title', 'hero of wind');
    assert
      .dom('.formal-name')
      .hasText('link, hero of wind', '@arg will recompute a default value after given an `undefined` arg value');
  });
});
