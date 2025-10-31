import { ScreenView, ScreenViewOptions } from "scenerystack/sim";
import { SimModel } from "../model/SimModel.js";
import { ResetAllButton, MathSymbolFont, PhetFont, LightRaysNode } from "scenerystack/scenery-phet";
import { Rectangle, Text, Image, Circle, Color, DragListener, RichText,  RadialGradient   } from "scenerystack/scenery";
import { TextPushButton } from "scenerystack/sun";
import { HSlider } from 'scenerystack/sun';
import { DerivedProperty, Property } from 'scenerystack/axon'; 
import { Range, Vector2, Bounds2 } from 'scenerystack/dot'; 


// Helper function to convert Kelvin to RGB values (0-255)
// Adapted from https://andi-siess.de/rgb-to-color-temperature/, https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html
function kelvinToRgbValues(kelvin: number): { r: number; g: number; b: number } {
  // Helper to clamp values between min and max
  const clamp = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(value, max));
  };

  // Convert Kelvin to a 'temp' scale used by the algorithm
  const temp = kelvin / 100;
  let red: number, green: number, blue: number;

  // --- Calculate Red ---
  if (temp < 66) {
    red = 255;
  } else {
    red = temp - 60;
    red = 325.4494129 * Math.pow(red, -0.1332047592);
    red = Math.round(red);
  }

  // --- Calculate Green ---
  if (temp < 66) {
    green = temp;
    green = 99.4708025861 * Math.log(green) - 161.1195681661;
    green = Math.round(green);
  } else {
    green = temp - 60;
    green = 288.1221695283 * Math.pow(green, -0.0755148492);
    green = Math.round(green);
  }

  // --- Calculate Blue ---
  if (temp >= 66) {
    blue = 255;
  } else if (temp <= 19) {
    blue = 0;
  } else {
    blue = temp - 10;
    blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
    blue = Math.round(blue);
  }

  // Clamp all values to the 0-255 range and return
  return { r: clamp(red, 0, 255), g: clamp(green, 0, 255), b: clamp(blue, 0, 255) };
}


export class SimScreenView extends ScreenView {

  private plotBox: Rectangle; 
  private imageHR: Image;
  private diagramStar: Circle;
  private lumStar: Circle;
  //private rays: LightRaysNode;
  private sideBar: Rectangle;
  private sideStar: Circle;
  private TText: RichText;
  private LText: RichText;
  private RText: RichText;
  private starPositionProperty: Property<Vector2>;
  private colorProperty: DerivedProperty<number, number, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown>; 
  private lumLogProperty: Property<number>; 
  private logTProperty: Property<number>; 
  private lumExtensionProperty:  DerivedProperty<number, number, unknown,unknown ,unknown,unknown,unknown,unknown,unknown,unknown,unknown,unknown,unknown,unknown,unknown,unknown>;
  private sideStarRadiusProperty: DerivedProperty<number, number, number, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown>; 
  private lumStarRadiusProperty:  DerivedProperty<number, number, number, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown>;
  private diagramStarRadiusProperty:  DerivedProperty<number, number, number, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown>;  
  private realRadiusProperty:  DerivedProperty<number, number, number, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown>; 
  private tempSlider: HSlider; 
  private lumSlider: HSlider; 


  public constructor(model: SimModel, options?: ScreenViewOptions) {
    super(options);


    // Sample Content

        // Create a new Rectangle node that will act as the background.
    const background = new Rectangle(
      this.layoutBounds.left,
      this.layoutBounds.top,
      this.layoutBounds.width,
      this.layoutBounds.height,
      {
        fill: 'black', // Or 'black'
        // This is a crucial line. A background node should always be non-interactive
        // so that events can pass through to the nodes on top of it.
        pickable: false
      }
    );

    // Add the background as the very first child.
    // This ensures that all other nodes are drawn on top of it.
    this.addChild(background);


    this.imageHR = new Image('images/HR.jpg',{
      scale: 0.45,
    });
    this.addChild(this.imageHR);

    this.layout(this.layoutBounds);

    console.log('SimScreenView initialized with left half image!');


  // frame of plot (bounds of where diagram star should be)

  this.plotBox = new Rectangle(75, 10, 490, 490, {
   // fill: 'white',
   // stroke: 'green',
  });
  this.addChild(this.plotBox)


  // diagram star

  this.diagramStar = new Circle( 25, {
  fill: 'yellow',
  cursor: 'pointer',
  //translation: this.imageHR.center,
  center: Vector2.ZERO,
/*  children: [
    new Text( 'Drag me', {
      center: Vector2.ZERO,
      font: 'bold 20px sans-serif',
      fill: '#eee'
    } )  
  ]*/
  } );
  this.plotBox.addChild(this.diagramStar);

  this.starPositionProperty = new Property( new Vector2(100, 150 ) );
  this.starPositionProperty.link( position => this.diagramStar.translation = position );

  this.diagramStar.addInputListener( new DragListener( {
   positionProperty: this.starPositionProperty,
   dragBoundsProperty: new Property( this.plotBox.bounds.eroded( 30 ) )
  } ) );



  // sidebar star and sliders: 

  this.sideBar = new Rectangle(.6*this.layoutBounds.maxX, 0, 400, 560, {
    fill: 'black',
    stroke: 'white',
  });
  this.addChild(this.sideBar)

  //sidebar star and lum star

  this.lumStar = new Circle(50, {
    fill: 'red',
    bottom: this.sideBar.centerY + 175,
    left: this.sideBar.centerX - 50, 
   // translation: this.imageHR.right,
  // bottom: this.imageHR.centerY + 400,
  // left: this.imageHR.right+ 500,
 // bottom: this.layoutBounds.bottom - 100, 
//  right: this.layoutBounds.right - 200, 
  children: [this.sideStar = new Circle(20, {
  fill: 'orange',
   // translation: this.imageHR.right,
  center: Vector2.ZERO,
  })
  ]
  });
  this.sideBar.addChild(this.lumStar);


  


  // temperature (color) slider 

  const minTemp = 1000;
  const maxTemp = 40000;
  const tempRange = new Range(minTemp, maxTemp); // Define the range of the slider

  const minLogT = Math.log10(minTemp);
  const maxLogT = Math.log10(maxTemp);
  const logTempRange = new Range(minLogT, maxLogT);

  this.logTProperty = new Property(4);

  this.colorProperty = new DerivedProperty(
    [this.logTProperty],
        () =>{ 
      return 10**this.logTProperty.value;
    }
  )

  this.colorProperty.link(kelvin => {
    const rgb = kelvinToRgbValues(kelvin);
    this.sideStar.fill = new Color(rgb.r, rgb.g, rgb.b, 1); // Create a new Color object from the RGB values
  });

  this.colorProperty.link(kelvin => {
    const rgb = kelvinToRgbValues(kelvin);
    this.diagramStar.fill = new Color(rgb.r, rgb.g, rgb.b, 1); // Create a new Color object from the RGB values
  });


// make lumstar have a opacity gradient:

const createRadialFadePaint = (r: number, g: number, b: number, radius: number) => {
    // Defines a concentric gradient, starting at radius 0 and ending at 'radius'.
    const fadeGradient = new RadialGradient(
        0, 0, 0,        // Inner circle (center at 0,0, radius 0)
        0, 0, radius    // Outer circle (center at 0,0, radius 'radius')
    );

    // Color strings using the determined RGB values
    const opaqueColor = `rgba(${r}, ${g}, ${b}, 1)`; // Alpha = 1 (Opaque)
    const transparentColor = `rgba(${r}, ${g}, ${b}, 0)`; // Alpha = 0 (Transparent)

    // Stop 1: Center is fully opaque
    fadeGradient.addColorStop(0.0, opaqueColor);

    // Stop 2: Edge is fully transparent, creating the fade effect
    // NOTE: For a sharper edge, you can use: fadeGradient.addColorStop(0.9, opaqueColor);
    fadeGradient.addColorStop(1.0, transparentColor);

    return fadeGradient;
}
 
// updateLumStarAppearance lower in code afer lumStarRadiusProperty is defined

  // have the temperature slider move the diagram star 

  this.colorProperty.link(kelvin => {
    const temp = kelvin;
  //  scaled_value = 1 - (log(kelvin / minTemp) / log(maxTemp/ minTemp))
   // this.diagramStar.x =this.plotBox.right -( kelvin/maxTemp * this.plotBox.width) - 25;
    this.diagramStar.x = this.plotBox.left + 30 + (this.plotBox.width - 60) * (1 - (Math.log(temp/ minTemp) / Math.log(maxTemp/ minTemp)));
  });




  this.tempSlider = new HSlider(this.logTProperty,  logTempRange, {
            // Options for the slider's appearance and behavior
    //  trackSize: 5, // Thickness of the slider track
   //   thumbSize: 20, // Size of the movable thumb
    //  orientation: 'horizontal', // 'horizontal' or 'vertical'
            // Positioning the slider
  //  isLogarithmic: true,
 //   left: this.imageHR.right +100,
 //   bottom: this.imageHR.centerY + 50, 
  // centerTop: this.sideBar.centerTop,
  bottom: this.sideBar.centerY- 30,
  left: this.sideBar.centerX - 180, 
  children: [
    this.TText = new RichText('Temperature', {
     // centerBottom: Vector2.ZERO,
    //  left: this.imageHR.right +100,
    //  bottom: this.imageHR.centerY + 10, 
      center: new Vector2(50, 50),
      font: new PhetFont(12),
      scale: 2,
     // font: 'bold 20px sans-serif',
      fill: 'white'
    } ),
    this.RText = new RichText( 'Radius = ', {
     // centerBottom: Vector2.ZERO,
    //  left: this.imageHR.right +100,
    //  bottom: this.imageHR.centerY + 10, 
      center: new Vector2(50, 120),
     // font: 'bold 20px sans-serif',
      font: new PhetFont(12),
      scale: 2,
      fill: 'white'
    } )    
  ]
      });
  

  this.sideBar.addChild(this.tempSlider); // Add the slider to the view




  // luminosity star radius slider 

  


  // side star radius

  
  //this.lumExtensionProperty = new Property(20);

  const lumMin = -4; //log lum in solar lums
  const lumMax = 6; 
//  const lumMin = .0001;
 // const lumMax = 1000000; 
//  const lumMin = 10;
//  const lumMax = 100; 
//  const lumMin = 1;
//  const lumMax = 2; 
  const lumRange = new Range(lumMin, lumMax);
  const lumExtensionMin = 10;
  const lumExtensionMax = 100;

  this.lumLogProperty = new Property(3);

  this.lumExtensionProperty = new DerivedProperty(
    [this.lumLogProperty],
    (loglum) =>{
    const normalizedLum = (loglum - lumMin) / (lumMax - lumMin);
    const scaledValue = lumExtensionMin + normalizedLum * (lumExtensionMax -lumExtensionMin);

    return scaledValue;
}
  )


//  this.sideStarRadiusProperty = new Property(20);


//side star radius from SB
  const sideStarRadiusMin = 5; //in code size units
  const sideStarRadiusMax = 50; //in code size units
  const HRStarRadiusMin = .0001; //in Rsun
  const HRStarRadiusMax = 6400; //in Rsun
  const Tsun = 5800;
  


  
  this.sideStarRadiusProperty = new DerivedProperty(
    [this.colorProperty, this.lumLogProperty],
    (temp, lum) =>{
    //  R = (lum/(4*Math.PI*sigma_SB*T**4))**(1/2) 
    const RInput = ((Tsun/temp)**2 )* ((10**lum)**(1/2)); //radius of star in solar units
     
    // Calculate the normalized position (0 to 1) of the input within the logarithmic input range
    // This formula maps logInputMin to 0 and logInputMax to 1.
    const normalizedLogPosition = (Math.log(RInput) - Math.log(HRStarRadiusMin)) / (Math.log(HRStarRadiusMax) - Math.log(HRStarRadiusMin));

    // Scale the normalized position to the desired output range
    // This formula maps 0 to outputMin and 1 to outputMax.
    const scaledValue = sideStarRadiusMin + (normalizedLogPosition * (sideStarRadiusMax - sideStarRadiusMin));

    // Return the scaled value. It should already be within the output range due to clamping,
    // but an additional Math.min/max can be added here if stricter clamping is needed after calculation.
    return scaledValue;
    }
  )


//old side star radius 
/*
  this.sideStarRadiusProperty = new DerivedProperty(
    [this.colorProperty, this.lumExtensionProperty],
    (temp, lum) =>{
      return 10000* lum/temp;
    }
  )
*/


  this.lumStarRadiusProperty = new DerivedProperty(
    [this.sideStarRadiusProperty, this.lumExtensionProperty],
    () =>{
      // add scaling to go from solar lums to size of extension 
      return this.sideStarRadiusProperty.value + this.lumExtensionProperty.value;
    }
  )

  this.sideStarRadiusProperty.link((radius: number) => {
      this.sideStar.radius = radius;
    });

  this.lumStarRadiusProperty.link((radius: number) => {
      this.lumStar.radius = radius;
    });





  this.lumSlider = new HSlider(this.lumLogProperty,  lumRange, {
   // left: this.imageHR.right +100,
  //  bottom: this.imageHR.centerY - 50, 
    //centerTop: this.sideBar.centerTop,
  bottom: this.sideBar.centerY - 200,
  left: this.sideBar.centerX - 180, 
    children: [
    this.LText = new RichText( 'Luminosity', {
     // centerBottom: Vector2.ZERO,
    //  left: this.imageHR.right +100,
    //  bottom: this.imageHR.centerY + 10, 
      center: new Vector2(50, 50),
      //font: 'bold 20px sans-serif',
      font: new PhetFont(12),
      scale: 2,
      fill: 'white'
    } )
  ]
      });

    this.sideBar.addChild(this.lumSlider); // Add the slider to the view

  
  // light rays for side star:

  //this.rays = new LightRaysNode(5, {
 //   minRays: 5,
//    maxRays:10,
 //   fill: 'green',
 //   minRayLength: 50,
 //   maxRayLength:150,
 //   bottom: this.sideBar.centerY + 175,
 //   left: this.sideBar.centerX - 50,
 // }
//);

  
  // diagram star y location

  this.lumLogProperty.link(L => {
   // const temp = kelvin;
  //  scaled_value = 1 - (log(kelvin / minTemp) / log(maxTemp/ minTemp))
   // this.diagramStar.x =this.plotBox.right -( kelvin/maxTemp * this.plotBox.width) - 25;
  //  this.diagramStar.y =  this.plotBox.height * (1-(Math.log(L/ lumMin) / Math.log(lumMax/ lumMin)));
    this.diagramStar.y =  this.plotBox.y + this.plotBox.height - 20 - (this.plotBox.height-70) * (( (L-lumMin))/(lumMax - lumMin));
  });
  

  // radius dependent on temp and lum 
  // diagram star radius from Stefan-Boltzmann

  const sigma_SB = 5.67 * 10**(-8); 
 // const Tsun = 5800; //temp of sun in K
  const diagramStarRadiusMin = 1; //in code size units
  const diagramStarRadiusMax = 25; //in code size units
 // const HRStarRadiusMin = .0001; //in Rsun
//  const HRStarRadiusMax = 6400; //in Rsun

  
  this.diagramStarRadiusProperty = new DerivedProperty(
    [this.colorProperty, this.lumLogProperty],
    (temp, lum) =>{
    //  R = (lum/(4*Math.PI*sigma_SB*T**4))**(1/2) 
    const RInput = ((Tsun/temp)**2 )* ((10**lum)**(1/2)); //radius of star in solar units
     
    // Calculate the normalized position (0 to 1) of the input within the logarithmic input range
    // This formula maps logInputMin to 0 and logInputMax to 1.
    const normalizedLogPosition = (Math.log(RInput) - Math.log(HRStarRadiusMin)) / (Math.log(HRStarRadiusMax) - Math.log(HRStarRadiusMin));

    // Scale the normalized position to the desired output range
    // This formula maps 0 to outputMin and 1 to outputMax.
    const scaledValue = diagramStarRadiusMin + (normalizedLogPosition * (diagramStarRadiusMax - diagramStarRadiusMin));

    // Return the scaled value. It should already be within the output range due to clamping,
    // but an additional Math.min/max can be added here if stricter clamping is needed after calculation.
    return scaledValue;
    }
  )

  this.diagramStarRadiusProperty.link((radius: number) => {
    this.diagramStar.radius = radius;
  });

  //R sidebar text 
  
  this.realRadiusProperty = new DerivedProperty(
    [this.colorProperty, this.lumLogProperty],
    (temp, lum) =>{

    return  ((Tsun/temp)**2 )* ((10**lum)**(1/2));
    }
  )


  this.realRadiusProperty.link((value: number) => {
   
   // this.RText.string = `Radius: R = (T<sub>Sun</sub>/T) <sup>2</sup> (L/L<sub>Sun</sub>)<sup>1/2</sup> <br/> = ${value.toPrecision(5)} R<sub>Sun</sub>`;
    this.RText.string = `Radius: R =  (L / 4 \u03c0 \u03c3 T <sup>4</sup>)<sup>1/2</sup> 
    <br/> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = ${value.toPrecision(5)} R<sub>Sun</sub>`;
  });

  this.colorProperty.link(value => {
   
    this.TText.string = `Temperature: T = ${value.toPrecision(5)} K` ;
  
  });


  this.lumLogProperty.link(value => {
   
    this.LText.string = `Luminosity: L = ${(10**value).toPrecision(3)} L<sub>Sun</sub>`;
  
  });

  const updateLumStarAppearance = () => {
    // 1. Get current values from the properties
    const kelvin = this.colorProperty.get();
    const rgb = kelvinToRgbValues(kelvin); 
    const radius = this.lumStarRadiusProperty.get();
    const gradientPaint = createRadialFadePaint(
        rgb.r, 
        rgb.g, 
        rgb.b, 

       radius
    );
    this.lumStar.fill = gradientPaint; // Create a new Color object from the RGB values
  };

  // Link 1: Call the update function whenever the Kelvin color changes
this.colorProperty.link(updateLumStarAppearance);

// Link 2: Call the same update function whenever the radius changes
// This ensures that movement on BOTH sliders updates the gradient correctly.
this.lumStarRadiusProperty.link(updateLumStarAppearance);
  


  /*
  //radius text in sidebar
  const testN = 10;

   this.RText = new Text('R = ${testN}', 
    bottom: this.sideBar.centerY - 200,
    left: this.sideBar.centerX - 100, 
    font: 'bold 20px sans-serif',
    fill: 'black'
  )
  this.sideBar.addChild(this.RText); // Add the slider to the view
  */




   const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
    });
    this.addChild(resetAllButton);
  }

        /**
     * This method is called whenever the display's layout bounds change (e.g., window resize).
     * It's where you define the responsive positioning and sizing of your nodes.
    * @param bounds - The current layout bounds of the screen.
     */
  public layout(bounds: Bounds2): void {
     super.layout(bounds); // IMPORTANT: Always call super.layout() first!

        // --- Position and Size the Image for the Left Half ---
     this.imageHR.x = bounds.minX;      // Start at the left edge of the screen
     this.imageHR.y = bounds.minY;      // Start at the top edge of the screen
   //  this.imageHR.width = bounds.width / 2; // Make it half the screen width
   //  this.imageHR.height = bounds.height; // Make it the full screen height



}



  public reset(): void {
    // Called when the user presses the reset-all button
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public step(dt: number): void {
    // Called every frame, with the time since the last frame in seconds

  }
}
