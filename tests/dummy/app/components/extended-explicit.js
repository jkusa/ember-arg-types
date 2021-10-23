import ExtendedCharacterComponent from './extended-character';
import { forbidExtraArgs } from 'ember-arg-types';

/**
 * Inherits args check and explicitly sets it
 */
@forbidExtraArgs
export default class ExtendedExplicitComponent extends ExtendedCharacterComponent {}
