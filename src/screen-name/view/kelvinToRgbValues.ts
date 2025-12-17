
// Helper function to convert Kelvin to RGB values (0-255)
// Adapted from https://andi-siess.de/rgb-to-color-temperature/, https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html
export default function kelvinToRgbValues(kelvin: number): { r: number; g: number; b: number } {
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
