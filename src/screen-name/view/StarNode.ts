/**
 * Star Node is the visual representation of a Star in the HR diagram.
 *
 * @author Jane Bright
 * @author Agustín Vallejo
 */

import { Circle, Node } from "scenerystack/scenery";
import Star from '../model/Star';

export default class StarNode extends Circle {
    public constructor( star: Star ) {

      // TODO: Convert from model units to view units

      const options = {
        color: 'red',
        stroke: 'green'
      };

      super( star.radius, options )
  }
}

/**
 * const options = {
 * }
 */