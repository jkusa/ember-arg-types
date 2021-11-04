import CharacterComponent from './character';
import { arg, forbidExtraArgs } from 'ember-arg-types';
import { bool, number } from 'prop-types';

@forbidExtraArgs
export default class ExtendedCharacterComponent extends CharacterComponent {
  @arg(number.isRequired)
  version;

  @arg(bool)
  magic;
}
