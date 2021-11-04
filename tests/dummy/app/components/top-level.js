import Component from '@glimmer/component';
import { arg, forbidExtraArgs } from 'ember-arg-types';
import { number } from 'prop-types';

@forbidExtraArgs
export default class TopLevelComponent extends Component {
  @arg(number.isRequired)
  top;
}
