function determineSector(lat, long, alt) {
  // Earth constants
  const eqR = 6378137; // equatorial radius (major semi-axis) in meters
  const plR = 6356752; // polar radius (minor semi-axis) in meters
  const ell = 0.003353; // ellipticity
  const n = 0.0016792451037460946; // (eqR - plR) / (eqR + plR); (third flattening constant)
  const fullMeridianDistance = 10001964.781658072; // meters from equator to pole

  // lat and long in radians:
  var latRads = lat * (Math.PI / 180);
  // the longitude value we use is functionally from 0 to 360 degrees,
  // so we'll quickly convert here (longitude ranges from 0 to 180 degrees)
  var longFull;
  if (long < 0) {
    longFull = 360 + long;
  }
  else {
    longFull = long;
  }
  var longRads = longFull * (Math.PI / 180);
  // placeholder altitude for adding functionality later
  var altitude = 0; // 0 meters for now, everything at sea level

  // import math package to compute Riemann sums
  const MathPKG = require("math-pkg-cmplx");
  // determine meridian distance
  var meridianDistanceFromEquator = (((eqR) * (1 - (ell * (2 - ell)))) * MathPKG.RiemannSum.avg(0, latRads, x => ((1 - ((ell * (2 - ell))) * Math.sin(x) ** 2) ** (-3 / 2))));
    // now we need to digitize the meridian distance and re-derive a new latitude
    var digitizedMeridian = meridianDistanceFromEquator - (meridianDistanceFromEquator % 50);
      // we can utilize Helmert's series for the inverse meridian ellipsoid problem to approximate our new, floored latitude 
      var mu = (Math.PI/2) * (digitizedMeridian/fullMeridianDistance);
      var flooredLatRads = mu + (((3/2) * n - (27/32) * (n**3)) * Math.sin(2 * mu)) + (((21/16) * (n**2) - (55/32) * (n**4)) * Math.sin(4 * mu)) + (((151/96) * (n**3) * Math.sin(6 * mu))) + (((1097/512) * (n**4) * Math.sin(8 * mu))) + (0.0000001049 * Math.sin(2*mu));

  // find radius at specific latitude
  var radiusFromLatitude = Math.sqrt((((eqR ** 2) * Math.cos(flooredLatRads)) ** 2 + ((plR ** 2) * Math.sin(flooredLatRads))**2) / ((eqR * Math.cos(flooredLatRads)) ** 2 + (plR * Math.sin(flooredLatRads)) ** 2));
  // find segment of polar radius that completes right triangle
  // theta = (Math.PI/2)-flooredLatRads
  var plRSegment = Math.cos((Math.PI/2)-flooredLatRads) * radiusFromLatitude;
  // then solve for cross-sectional radius
  var crossSectionalRadius = Math.sqrt((radiusFromLatitude**2) - (plRSegment**2));
  // find cross-sectional circumference
  var crossSectionalCircumference = 2 * Math.PI * crossSectionalRadius;

  
  // determine number of sectors at current latitude
  var numSectors = Math.floor(crossSectionalCircumference/50);

  // determine how many columns away from Prime Meridian, and rows from equator
  // (rows and columns have zero-based indexing)
  var rowsFromEquator = Math.floor(meridianDistanceFromEquator/50);
  var columnsFromPrimeMeridian = Math.floor((longRads/(2 * Math.PI)) * numSectors);

  // define a unique sector id from unique coordinate data
  var id = `r${rowsFromEquator}c${columnsFromPrimeMeridian}a${altitude}`;

// define data packet to return
var parsedData = {
  rowsFromEquator,
  columnsFromPrimeMeridian,
  id
}

return parsedData;
}

module.exports = determineSector;