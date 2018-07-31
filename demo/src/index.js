import { manageBehaviors } from 'behave.js';
import * as Behaviors from './behaviors';

document.addEventListener('DOMContentLoaded', () => {
  manageBehaviors(Behaviors);
});
