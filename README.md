# globalSectors

## ESSENTIAL INFORMATION ABOUT THIS FUNCTION:
function determineSector(lat, long, alt){}

It accepts three parameters--latitude and longitude and altitude--lat and long given in decimal degrees, which is
the form in which HTML returns them by default. Altitude should be in meters, and is not implemented yet.

It returns an object with three properties: rowsFromEquator, columnsFromPrimeMeridian, and id.
The first two are self explanatory, being the 'y' and 'x' coordinates, and the id is a string
comprised of the coordinates in the form `r${rows}c${columns}a${altitude}`.
This id will be unique to each sector.

## METHODOLOGY:
Treating the earth as an oblate spheroid, and latitude as a geodetic value in decimal degrees:

(from https://rechneronline.de/earth-radius/, corroborated by https://planetcalc.com/7721/)

latitude B, radius R, radius at equator r1, radius at pole r2:

R = √ [ (r1² * cos(B))² + (r2² * sin(B))² ] / [ (r1 * cos(B))² + (r2 * sin(B))² ]


Taken from NASA (https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html):

Equatorial radius (km)	        6378.137    
Polar radius (km)               6356.752 
Ellipticity (Flattening)        0.003353  

(all coordinates converted to radians)

to JavaScript:

  Radius = Math.sqrt((((eqR**2)*Math.cos(lat))**2 + ((plR**2)*Math.sin(lat))**2)/(((eqR)*Math.cos(lat))**2 +     ((eqR)*Math.sin(lat))**2))

This gives us the radius of the Earth from a specific latitude

  (distance from surface to center of Earth)
  
We now need to build a cross-sectional circumference from our radii

  To do so we build a right triangle from our new radius and a section of our polar radius
  
  and derive the length of the third side

  Deriving segment of polar radius:
  
    theta = (Math.PI/2)-flooredLatRads;
    
    Math.cos(theta) = plRSegment/radiusFromLatitude
    
    >> plRSegment = Math.cos(theta) * radiusFromLatitude

This is how we now derive our cross-sectional radius:

  Using the Pythagorean theorem:
  
    a**2 + b**2 === c**2 (true)
    
    solve for a
    
    a === Math.sqrt(c**2 - b**2)
    
    a === Math.sqrt(radiusFromLatitude**2 - plRSegment**2)
    
    Having a (crossSectionalRadius), the circumference is simply
    
    Circumference = 2 * Math.PI * a

### TO DETERMINE SECTOR:
We will define sectors as being 50mx50m 'pseudosquares', the shape being slightly 'arced'

We now need to define a pseudogrid that splits the Earth's surface (an oblate spheroid)
  into roughly even pseudosquares. So we will define a rounding function that decides
  what 'row' and 'column' a user is in given geographic coordinates. This function will need
  both the circumference of a cross-section of the Earth drawn parallel to latitude and
  a meridian distance from the equator. This allows us to determine how many columns are in
  each row.

  Meridian Distance https://en.wikipedia.org/wiki/Meridian_arc
  
    Wolfram Alpha formula code (theta is latitude in radians):
    
    (definite integral ((1-((0.003353*(2-0.003353)))sin(x)^2))^(-3/2)dx from 0 to theta)
    
    >>> multiply this by ((eqR)*(1-(0.003353*(2-0.003353)))) to get total distance
    
    >>> plugging in pi/2 (latitude in radius of north pole) gets us 10,000km, which is what we expect

        using lat = 90, we get 10001964.781658073 meters as the distance from the equator to the north pole
        this is an answer accurate to within a meter, according to 
        http://www.transnav.eu/files/So+What+is+Actually+the+Distance+from+the+Equator+to+the+Pole+%C3%A2%E2%82%AC%E2%80%9C+Overview+of+the+Meridian+Distance+Approximations,435.pdf

  Having all this, we can determine our number of rows and columns from the equator
    and Prime Meridian respectively by dividing the meridian distance by 50m and by converting
    longitude into a proportion of a full circle and multiplying that by our number of sectors
    at that latitude. We can do this with longitude because we are assuming that the earth is
    circular in cross-sections parallel to latitude, and we are allowing all sectors in each row
    to be of equal longitudinal width, which will be approximately 50m.

  An important step!!: We need to use a digitized form of the 'circumference at different latitude'
    process we defined. Since the squares have width, we will actually be using the number of sectors of
    the row defined at the last division of 50 from the meridian distance.
    We can find the latitude of this row with Helmert's series for the inverse meridian ellipsoid problem
    Source: https://en.wikipedia.org/wiki/Meridian_arc#The_inverse_meridian_problem_for_the_ellipsoid


Some sources:

https://en.wikipedia.org/wiki/Meridian_arc

https://en.wikipedia.org/wiki/Eccentricity_(mathematics)

https://en.wikipedia.org/wiki/Latitude#Meridian_distance_on_the_sphere

https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html

http://mathworld.wolfram.com/Ellipticity.html

http://mathworld.wolfram.com/Eccentricity.html
*/
