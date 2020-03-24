import Component from '@glimmer/component';
import { arg } from 'ember-arg-types';
import { func, number, oneOf, string } from 'prop-types';
import { guidFor } from '@ember/object/internals';

const tunics = ['green', 'red', 'blue'];

export default class CharacterComponent extends Component {
  @arg(string)
  get id() {
    return guidFor(this);
  }

  @arg(string.isRequired)
  name;

  @arg
  title = 'hero of time';

  @arg(oneOf(tunics))
  tunic = tunics[0];

  @arg(number)
  hearts = 12;

  @arg(number)
  level;

  @arg(func)
  onClick = () => null;
}
