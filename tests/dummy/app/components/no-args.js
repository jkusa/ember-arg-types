import Component from '@glimmer/component';
import { forbidExtraArgs } from 'ember-arg-types';

@forbidExtraArgs
// eslint-disable-next-line ember/no-empty-glimmer-component-classes
export default class NoArgsComponent extends Component {}
