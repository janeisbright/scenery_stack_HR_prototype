/**
 * TODO: Add description
 *
 * @author Jane Bright
 * @author Agustín Vallejo
 */

export class Star{

  // Temperature in Kelvin
  private _temperature: number;

  //Luminosity in solar luminosities
  private _luminosity: number;

  
  // get quantities (temperature, luminosity, radius)
  get temperature(): number {
    return this._temperature;
  }

  get luminosity(): number {
    return this._luminosity;
  }

  get radius(): number{
    const sun_temperature = 5800;
    return Math.sqrt(this._luminosity)/(this._temperature/sun_temperature)**2
  }

  // set quantities (temperature, luminosity) 
  // (not radius because it is calculated from L and T directly and can't be set independently)
  set temperature(value:number) {
    if (value > 40000){
      this._temperature = 40000;
    }
    else if (value < 2500){
      this._temperature = 2500;
    }
    else{
      this._temperature = value;
    }
  }

  set luminosity(value:number) {
    if (value > 320000) {
      this._luminosity = 320000;
    } 
    else if (value < 0.000079) {
      this._luminosity = 0.000079;
    } 
    else {
      this._luminosity = value;
    }
  }

  public constructor() {
    this._temperature = 5800;
    this._luminosity = 1;

  }
}


/** 
export class Star_Basic {

  // Temperature in Kelvin
  public temperature: number;

  //Luminosity in solar luminosities
  public luminosity: number;
  
  // Radius in solar radii
  public radius: number;

  public constructor() {
    this.temperature = 5800;
    this.luminosity = 1;
    this.radius = 1;

  }
}
*/