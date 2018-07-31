import { manageBehaviors } from '@joecritch/behave.js';
import * as Behaviors from './behaviors';

document.addEventListener('DOMContentLoaded', () => {
  manageBehaviors(Behaviors);
});
