import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { click, render, resetOnerror, setupOnerror, settled } from '@ember/test-helpers';
import config from 'ember-get-config';

module('Integration | Component | arg-decorator', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    resetOnerror();
  });

  test('it allows defaults', async function(assert) {
    await render(hbs`<Character @name="link"/>`);

    assert.dom('.id').hasText(/ember\d+/, '@arg can use a getter as a default value');
    assert.dom('.title').hasText('hero of time', '@arg can use an initialized value as a default');
    assert.dom('.hearts').hasText('12', '@arg() can use an initialized value as a default');
    assert.dom('.level').hasNoText('@arg will pass `undefined` as a default when an initializer is not present');
  });

  skip('it uses the correct context in property initializers', async function(assert) {
    await render(hbs`<Character @name="link" />`);

    const argId = this.element.querySelector('.id')!.textContent;
    const privateId = this.element.querySelector('._id')!.textContent;

    assert.equal(argId, privateId, '@arg calls the default getter with the correct context');
  });

  test('it allows default overrides', async function(assert) {
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

  test('it checks types', async function(assert) {
    assert.expect(3);

    this.set('name', 'link');
    this.set('heart', 1);
    this.set('level', 1);
    await render(hbs`
      <Character
        @name={{this.name}}
        @hearts={{this.heart}}
        @level={{this.level}}
      />
    `);

    setupOnerror(function({ message }: Error) {
      assert.equal(
        message,
        'Failed prop type: Invalid prop `hearts` of type `string` supplied to `CharacterComponent`, expected `number`.',
        'If @args() contains a PropType validator, an error will be thrown if the value is incorrect'
      );
    });
    this.set('heart', 'not a number');
    await settled();

    setupOnerror(function({ message }: Error) {
      assert.equal(
        message,
        'Failed prop type: Invalid prop `level` of type `string` supplied to `CharacterComponent`, expected `number`.',
        'If @args() contains a PropType validator, an error will be thrown if the value is incorrect'
      );
    });
    this.set('level', 'not a number');
    await settled();

    setupOnerror(function({ message }: Error) {
      assert.equal(
        message,
        'Failed prop type: The prop `name` is marked as required in `CharacterComponent`, but its value is `undefined`.',
        'If @args() contains a PropType validator, an error will be thrown if the value is incorrect'
      );
    });
    this.set('level', 5);
    this.set('name', undefined);
    await settled();

    this.set('name', 'link'); //should not throw error when set back to valid value
    await settled();
  });

  test('type check errors can be disabled', async function(assert) {
    assert.expect(1);

    config['ember-arg-types']!.throwErrors = false;

    await render(hbs` <Character @name={{true}}/>`);
    assert.dom('.name').hasText('true', 'When `throwErrors` is set to false, type checks `Error`s are disabled');

    config['ember-arg-types']!.throwErrors = true;
  });

  test('it supports actions', async function(assert) {
    assert.expect(3);

    await render(hbs`
      <Character
        @name="link"
        @onClick={{this.onClick}}
      />
    `);

    await click('.character');
    assert.ok(true, 'A default function can be declared for an action');

    setupOnerror(function({ message }: Error) {
      assert.equal(
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
});
