---
typora-root-url: ./readme/images
---

# Mirror animator

## Abstract

We present a novel optical device capable of faithfully reproducing arbitrary images and image sequences by utilizing the interplay between mirrors and coloured surfaces acting as interactive mosaics.
Our main contribution is describing a method for precomputing the mirror lattice configuration as well as a near optimal method for finding the corresponding diffuse colour pattern in the spatio-temporal domain. 
Our formulation allows for rapid iteration by enabling physically based light ray simulation ahead of construction.
We demonstrate the effectiveness of our method in a wide range of image and image sequence scenarios as well as multiple device configuration variants.

## Introduction

This master assay that is supposed to complement and give a more thorough understanding of my master exhibition. As I see myself as a object maker rather than a writer I see the exhibition as the main work and this paper is the support. While this paper is published deep in the humanities in the fine art department I have opted to write it a little bit more like one would write an in-depth technical blog or repo readme[^Repo readme] post that might be more familiar to the _natural scientist_ or the casual hobby coder. I will not go full techno on you but this paper will demand some prior knowledge of optics and combinatorics to fully comprehend all concepts. That said I will try to focus on the intuition[^Intuition] and add extensive figures and footnotes where a novice reader of the field can find a primer and an experienced reader some more depth and details. If you don't feel comfortable with the nitty gritty as for example the math figures you can just skip ahead. Since I want this article to work as a traditional readme-file or science paper I want it to be possible to, at least theoretically, reproduce the results by following along in the text. This is why I have insisted to keep the mathematical notation and technicalities to retain utility even though most readers of this fine art master thesis probably won't care.

The sculptures I present here are a new kind of device, contraption or idea that can show images without any (required) moving parts or electricity. One can say that it is an analogue passive display. Instead of using illuminated pixels as a computer screen[^computerscreen] does, I use mirrors. Each mirror acts as a just as a pixel or a mosaic tile contributing with one small piece of the overall image. By orienting each mirror so that they reflect a colour from somewhere else in the room it is possible to make the mirror appear to have a colour. Hence, by painting a surface in a room it is possible to make sure that any particular colours are available to be reflected. After realising that it is possible to reflect a predetermined position in the room one can experiment with endless possibilities of arranging the colours to be reflected. I have focused on four different variants that I will talk about in this paper but that I have also build physical models of. The first one consists of a disc with painted with eccentric colour fields. This variant makes it possible to create animations by having the disc rotate around its minor axis thereby alternating what colours is at the reflection focal points. The second variant is a cylinder that rotates around its vertical axis and also enables an animation. Then I'm showing the most basic variant witch consists of a rectilinear array of colour fields that in my case only shows one image per mirror setup but can be used to show multiple images with using multiple mirror setups but reusing the colour fields. Lastly I will talk about a cone palette that interactively shows four different images depending on the spectators position. 

I have structured this paper to discuss all the elements of making an image with mirrors and colour fields including:

- History and background
- Picking a suitable image or images for reproduction.
- Techniques for reducing the number of solid colours in a picture to something more manageable.
- Ways of refining the reduced palette to create perceived gradients and shades.
- Considerations of how to arrange the mirrors.
- A brief primer on light transport
- How to compute the orientation of each individual mirror.
- Different shapes of colour palettes including discs, cylinders, rectangles and cones.
- Some tricks used to optimise and reduce the physical space occupied by the colour fields.
- Things to bear in mind when positioning the imagined spectator, mirrors and colour fields in relation to each other.
- Using Software to simulate the mirror setups for rapid iterations.
- Fabricating the mirror array panel using a 6-axis Kuka robot arm, a 5-axis CNC milling machine, a 3-axis CNC milling machine or a 3d printer.

## A brief history and background

> `TODO: talk about mosaics of course`

In fine art there is a long history of making pictures that exploit how the human vision merges small dots in close proximity into perceiving it as one coherent shape. One example is ceramic, class or stone mosaics that has been made since the **XXXX**s. 

> TODO: later George Rousse

> TODO: Some examples

In the late 1800s maybe a painting technique called _Pointillism_ emerged with prolific practitioners like Georges Seurat[^seurat1886] , Vincent can Gogh[^vangogh1887] and Paul Signac [^signac1901] and a bit later for example Robert Delauney[^delauney1906]. Pointillism exploits the fact that small dots of paint close together is merged in the human brain into a single blob. Instead of using a lot of colour shades some shades can be made by mixing dark and light dots with different densities although the early practitioners weren't super strict about that. This phenomena is also exploited in printing where the technique is adapted to paper and called _half toning_ where dots of, usually, cyan, magenta, yellow and black are printed in a raster with different sizes. In computer science where it is usually restricted to rectilinear arrays it is called _dithering_ and usually includes a restricted color palette. In engraving there is a technique called _stippling_ that similar to pointillism but only one colour is used. All techniques are basically the same with some modifications for each medium. When artists got access to the early computers in the 60s the output was usually limited to a paper strip that was printed with a fixed-width font (like Courier). Computer art pioneers like Kenneth Knowlton and Leon Harmon[^knowlton1967] used those limitations and made shaded pictures with only text by treating the different characters as different gray scale pixels. This has later become known as ASCII-art from the 1963 character encoding called _American Standard Code for Information Interchange_ specifying what characters that can be used. With the release of 8-bit (256 color) video game console _Nintendo Entertainment System_ in the early 1980s the _8-bit pixel art_ was popularised and featured lots of perceptual tricks using the limits of what pictures can be made with a very limited palette. 

Using mirrors and optics to create a picture is also not a new idea. The Stanford physics PhD Ben Bartlett[^bartlett2021] used a similar and independently invented idea as mine just a month ago to project a "Will you marry me" message to his future partner on a beach with a hand held 3d-printed array of small mirrors. Interestingly for this paper he has also published a technical readme-writeup in his GitHub-repo. From academia we have got one interesting paper called _High-contrast Computational Caustic Design_[^schwartzburg2014] that was published in 2014 describing how a flat transparent surface can be shaped so that the caustics[^caustics] produce an arbitrary picture. Using the same technique the less academic but still aerospace engineer Matt Ferraro published a technical writeup[^ferraro2021] with sourcecode from 2021 where he explains how to make your own with a CNC-router. When researching this paper I found that Swedish artist Christian Partos [^partos2003] used the same idea as mine but instead of colour-fields he used the falloff from a spotlight as the palette. I can also mention Daniel Rozin[^rozin2011] who has made multiple sculptures involving mirrors (although computer controlled).

[^partos2003]: Christian Partos, 2003, _MOM (Multi Oriented Mirrors)_, http://www.partos.se/Www/SidorE/MOM.htm
[^bartlett2021]: Ben Bartlett, 2021, _3d-printed-mirror_array_,  https://github.com/bencbartlett/3D-printed-mirror-array
[^schwartzburg2014]: Yuliy Schwartzburg, Romain Testuz, Andrea Tagliasacchi Mark Pauly, 2014, _High-contrast Computational Caustic Design_
[^vangogh1887]: Vincent van Gogh, 1887, _Self Portrait_, oil on canvas,  41 × 32.5 cm, Art institute of Chicago
[^seurat1886]: Georges Seurat, 1884–1886, _A Sunday Afternoon on the Island of La Grande Jatte_, oil on canvas, 207.6 × 308 cm, Art Institute of Chicago
[^signac1901]: Paul Signac, 1901, _L'Hirondelle Steamer on the Seine_, oil on canvas, National Gallery in Prague
[^ferraro2021]: Matt Ferraro, 2021, _Hiding Images in Plain Sight: The Physics Of Magic Windows_ , https://mattferraro.dev/posts/caustics-engineering
[^delaunay1906]: Robert Delaunay, 1906, _Jean Metzinger_, oil on paper, 54.9 × 43.2 cm, Museum of Fine Arts, Houston
[^knowlton1967]: Ken Knowlton, Leon Harmon, 1967, _Computer Nude (Studies in Perception I)_, 86.36 x 182.88 cm, silkscreen print
[^rozin2011]: Daniel Rozin, 2011, _Brushed metal mirror_, http://www.smoothware.com/danny/brushedmetalmirror.html
[^caustics]: When for example the sun rays hit the water of a pool they refract penetrating the waves and fills the bottom of the pool non-uniformally with areas of high light intensity and others with low. This phenomena is called caustics.
[^computerscreen]: The most common type of computer screens are called Liquid Crystal Display or LCD. It works by shining a white back light on a liquid crystal film. By applying a polarised electrical current to the LCD-film the film can change from opaque to transparent or vice versa. By having red, green and blue filters the transmitted light can be either red, green or blue. Combining red, green and blue light with different intensities one can make the human eye perceive that it is possible to reproduce a large portion of the visible spectrum. One unit of red, green and blue is called a pixel. By putting a huge number of pixels together in a grid one can make electronic mosaics and produce any picture or animation.
[^Repo readme]: Open source projects hosted publicly traditionally have a file called `README` that is intended to be read by users or contributors of the project before use. The readme file is usually placed in the root folder of the repository and commonly contains instructions on how to compile and run the project, some code examples, code formatting and style rules and sometimes more in-depth description of architectural design.
[^Intuition]: In mathematics the term _intuition_ refers to a way to reason to a solution of a mathematical problem using a broader understanding of a mathematical concepts. It doesn't have to be a formal proof but more commonly an example. Explaining solutions by first describing the intuition is very common in geometry where it is commonly possible to describe problems in e.g. lower dimensions.
[^loremipsum]: Lorem Ipsum is the first two words of a placeholder text commonly used in publishing and graphic design to demonstrate the visual form of a document without replying on meaningful content.

###A very brief primer on light transport

> `TODO: This might need some extra explanation about frequencies and colors`
>
> `TODO: This might be a bit too much information that is not relevant for our purposes`

Light rays travel in a straight line through a medium (like air). When striking a surface some of the light will be absorbed by the surface (converted to heat) and some will bounce back, reflected. The absorption is what makes object look colorised due to that the surface absorbing some frequencies of light more than others. On a perfectly flat, smooth surface, called a specular surface, the angle of incidence, the angle at witch the light ray hits the surface, is equal to the angle of reflection with regards to a projected line perpendicular to the surface, known as the normal. 

<img src="/reflection.png" style="zoom:50%;" />

<center><i>Fig 1. Angle of incident and angle of reflection<br>is equal with regards to normal (dashed)</i></center>

On rough surfaces, called diffuse surfaces, the light will reflect in slightly different angles all over the surface but still retaining its energy. A mirror is said to be more specular than a painted wall that is said to be diffuse.

<img src="/specular-reflection.png" style="zoom:50%;" />

<center><i>Fig 2. Specular reflection</i></center>

<img src="/diffuse-reflection.png" style="zoom:50%;" />

<center><i>Fig 3. Diffuse reflection</i></center>

For opaque materials all the light will either have to be reflected or absorbed. If the material is transparent or translucent some of the light might pass into the material. When passing into a material the light ray bends from its angle of incidence. This phenomenon is called refraction. The amount of bending is due to the relative indices of refraction (also called the optical density) of the medium the ray travels from and the medium the ray travels into (described by *Snell's Law*). The larger the difference between the media the more the ray bends[^Snells Law].

<img src="/refraction.png" style="zoom:50%;" />

<center><i>Fig 4. Refraction</i></center>

For our purposes we can largely disregard both refraction and diffuseness. We also don't have to consider translucensy, internal reflections, subsurface scattering, fresnel effects, chromatic aberration or any other obscure phenomena present in the real world since it will not make any noticeable difference that we can adjust for anyway. We will consider the mirrors we use ideal mirrors that are perfectly flat, covered with a perfectly transparent glass with the same refractive index as the surrounding media and the reflective surface to be perfectly specular [^Mirrors]. For us the only thing that matters is that incident and reflected light rays have the same angle in respect to the average surface normal.

[^Snells Law]: To be specific the refractive index varies slightly with the wavelength of light. Generally the refractive index decreases with increasing wavelength. This leads to an effect called *Chromatic aberration* that for example in lenses manifests itself as fringes where the light is split into its constituent frequencies with slightly different focal points. There is also something called *Critical angle* witch is the angle at where light is not refracted but instead reflected. If the angle of incidence is greater than the critical angle all light will be reflected. This is the phenomena that makes fiber cables work by bouncing the light inside a transparent glass fiber, called *total internal reflection*. This is also the phenomena, called the *Fresnel effect*, that makes a calm lake at sunset appear as a mirror although being a poor reflector at normal incidence. For reference air has a refractive index very close to 1.00 while the value for window glass is about 1.52.
[^Mirrors]: In theory it would be possible to use *first surface mirrors* in witch the reflective surface is the front instead of on the back of the glass. First surface mirrors are commonly used in high precision optical equipment such as cameras, telescopes and lasers but are also considerably more expensive starting at around 400 times the price of a regular second surface mirror.

##Colouring a mirror

Since our idealised mirror reflects all light striking it, without absorbing any light, it itself doesn't have any inherent color. It appears as it has the colour or colours of whatever it reflects, of course also depending on your vantage point. If we for example paint a wall blue, and stand with our back against it with a mirror in front of us, the mirror will look as blue as the wall. If we paint the wall with a colour spectrum and adjust either the angle of the mirror (or our own position) we can make it reflect any point on that surface we want and thereby taking the colour of it. If we want the mirror to look red we can adjust the angle in such a way that it will reflect a red point. If we want it green we adjust it accordingly. This is something we can use to decide what colour the mirror should appear as.

> `TODO: Maybe talk about the other ways of changing the colour? Move the spectator, move the palette, move the mirror or rotate the mirror`

> `TODO: The pictures can actually show a gradient palette here. We'll get to color fields later`

<img src="/change-color.png" style="zoom:50%;" />

<center><i>Fig X. The same mirror can appear to be multiple colors by rotating the mirror. In the left picture the mirror will appear blue while in the right it will appear red.</i></center>

To calculate what angle the mirror has to have to reflect the light from a point on the wall, $t$, to our eye, $e$, is fairly trivial. We know that the face of the mirror needs to point in such a way that the angle of incidence and the angle of reflection should be equal in regards to the mirrors surface normal. The position of the mirror, the angle of incidence and reflection is known so we just have to compute the optimal mirror surface normal. Suppose we have a colour field with the centre $t$. We also have the position of the spectators eye $e$ and the center of the mirror $m$. This gives us equation 1:
$$
\vec{i}=e-m, \vec{r}=t-m
$$
where $\vec{i}$​​​ denotes the vector of incidence and $\vec{r}$​​​ the vector of reflectance. The mirrors normal $\hat{m}$​​​ (i.e. the vector that the face points in) is bisecting of the normalised[^Normal vector] vectors  of incidence and reflectance:
$$
\hat{m}=\frac{\hat{i}^{-1}+\hat{r}}{2}
$$
Bisecting the angle can be done by adding the two vectors and then splitting the sum in half making it a unit vector.

<img src="/finding-normal.png" style="zoom:50%;" />

<center><i>Fig 5. A visual representation of Equation 2. finding the normal (green). The blue represents the inverted vector of incidence and red the reflected. Adding blue and red and then scaling the sum by 0.5 gives green. From the eye´s point of view the mirror will appear red.</i></center>

This gives us the basic tools to "set the colour" of our mirrors. In the figures above this has been shown to work in two dimensions (for clarity) but the math generalises to three dimensions (of course need to use all those three dimensions). 

We can now create a "color palette" that we then can "sample" colors from by adjusting the angle of our mirror. If this mirror is fairly small it can essentially work as a single pixel that can take any colour from the palette and reflect that into the spectators eye. 

If we want another colour for a mirror we can just realign the mirror to reflect another colour. Since realigning a mirror can be a bit fiddly we instead opt for moving the palette so the mirror reflects another colour field. Moving the spectator, the mirrors or the palette in relation to each other can all create the same result.

[^Normal vector]: A normalised unit vector is denoted with a hat, e.g.  $\hat{r}=\frac{\vec{r}}{\|\vec{r}\|}$​​​​​​ where the magnitude of a vector is denoted with double bars. The magnitude can be computed, in 3d euclidian space, with *Pythagoras theorem*: $\|\vec{r}\| = \sqrt{r_x^2 + r_y^2 + r_z^2}$​​​​​​

##Making a picture

By putting multiple mirrors in a two dimensional lattice, and rotating them individually towards different colour on the colour palette we can create any arbitrary image. We just have to repeat the above described procedure for each mirror.

## Shape of mirrors

We want the image in the mirror to be vibrant so we need to reflect as much light as possible trying to cover as much of the substrate that the mirrors are attached to. All the area not covered by a mirror will has its own colour and that colour affects the overall picture, basically mixing with the picture, so we want to reduce that area as much as possible. To do that we need to find a shape of mirrors and a pattern of tiling that covers the most amount of area and exposes as little as possible of the background surface. 

It is only easy to find square and round circles off the shelf. We will need thousands of mirrors and having to fabricate odd shaped ones is not really a viable option. 

Square mirrors seems to be the obvious choice but for reasons we will discuss later we want to use round mirrors since they have some good properties (that we will discuss in the manufacturing section). While square tiling of square tiles are 100% efficient round mirrors arranaged in a regular grid are not. It will leave a lot of gaps. We can do better. Fortunately people have been studying this thoroughly and proved that most dense packing of circles on a plane is the hexagonal array packing. 

<img src="/circular-pattern.png" style="zoom:50%;" />

<center><i>Fig X. Hexagonal array packing</i></center>

This is the same honeycomb packing bees use in their beehives [^Circle packing]. It minimises the space between the mirrors and hence reflect more light per unit area and therefore allow for a more vivid image.

> `TODO: maybe mention that this requires us to convert from cartesian to hex coordinates if our original is a bitmap`

> `TODO: http://extremelearning.com.au/how-to-evenly-distribute-points-on-a-sphere-more-effectively-than-the-canonical-fibonacci-lattice/`

> `TODO: Colours chroma shifting with mixing white: https://en.wikipedia.org/wiki/Abney_effect`

[^Circle packing]: The density of packing circles on a plane with diameter $D$ is $\frac{3\pi}{4}D^2 \big/ \frac{3\sqrt{3}}{2}D^2= \frac{\pi\sqrt{3}}{6} \approx 0.9069$ i.e. about 10% of the light will be hitting the substrate instead of a mirror.

##Accounting for distances and angles

So far we have thought of the light as a single ray that strikes a point of the palette, a point of the mirror and the a point of the spectators eye but that is a too big of a simplification. If we think of the rays from the eye (so in reverse[^Reverse]) that strike the mirror they will form a cone with the apex in the eye and the base covering the mirrors surface. It is only the rays within that cone that we will be concerned with. This cone is usually called a *frustum*[^Frustum] and represents the region visible in the mirror reflection. When the rays reflect in the mirrors the frustum will continue extending with the same taper until it strikes the colour fields. The surface area that will be covered by the frustum on the colour fields is related to the surface area of the mirrors and the combined distances between the eye, mirror and colour subrfaces.

Doubling that distance will quadruple the area (due to the _The inverse square law_). This is important since having too small colour fields in relation to the distance from the mirrors will make the mirror pick up a larger area than one colour field and since it's a square law and not linear small changes in distance makes for bigger changes in area.

<img src="/inverse-square-law-frustum.png" style="zoom:50%;" />

<center><i>Fig 6. The frustum extends from the eye subtending the mirror (stroked) and is reflected. The reflected part of the frustum is then larger than the colour field (red) picking up the color of whatever surrounds it.</i></center>

This leads to another phenomena that we have to at least consider: One could assume that the shape reflected in a circular mirror would also be a circle but that is not always the case. If the frustum from the mirror and the colour fields does not strike the colour fields completely perpendicular the frustum will be "cut off" at a slanted angle, in geometry the shape formed of the intersection is called *a conic section* and is is elliptical and not a circle[^Ellipse]. An example of this is when you are out walking a dark night and shine your torch light on the ground. If you shine it straight down you would see a circular light beam but if you shine it further ahead of you it forms an ellipse. The further away from you the more elliptical and larger the lights shape will be.

<img src="/conic-section-1.png" style="zoom:30%;" />

<center><i>Fig 7. Here a light beam (magenta) is reflected in a circular mirror (bottom) at 45° and strikes an imagined parallel wall. The resulting conic section (blue) is elliptical.</i></center>

<img src="/conic-section-2.png" style="zoom:30%;" />

<center><i>Fig 8. The same scene as Fig 7. but viewing straight down at the mirror (the rightmost black circle). The elliptical conic section is apparent.</i></center>

This means that the reflected surface of the color field will not generally be a perfect circle but an ellipse. Depending on where on the colour fields the mirrors are reflecting the shape of the reflecting area will be differently shaped and sized. 

> `TODO: The below is not true when the mirrors size is fixed. Only the distance in the normal direction of the mirror affects the reflected shapes size. However if the wall is not parallell with the mirror then the size is affected and aproaches infinity as the angle approches infinity (or towards a singular point depending on the relation of the mirrors and the walls angles)` 

The more extreme the angle of incidence of the cone the more extreme the proportions of the ellipse will be. As the angle of incidence approaches tangency to the surface the length of ellipses major axis will approach infinity. We need to make sure that the entire area inside the silhouette of the reflected shape will be cover only the colour we want it to cover and nothing else.

What I want to stress with this section is that we cannot simply thing of the sampling on the palette as a point sampling but an area sampling and to be more specific an elliptical area. This shape and area changes depending on the angle of the rays between the mirror and the palette.

[^Thermodynamics]: This is actually a fundamental law of thermodynamics that all optics are reversible
[^Ellipse]: The conic section is actually one of the mathematical definitions of an ellipse.
[^Frustum]: Technically a frustum is a geometric shape that has two parallel planes but here we use it slightly looser as *viewing frustum* is generally used in the computer graphics literature.
[^Reverse]: Although the light rays starts at a light source, bounces and scatters off the coloured surfaces, reflects in the mirrors and strikes the spectators retina it is sometimes easier to think of the process in reverse. We don't care about any photon that does not hit our eye and the math will add up the same in both directions[^Thermodynamics]. This is actually a very common technique in 3d graphics raytracing.

##Making a palette

Since we now know that the mirror will sample colours from an area it might be a good idea to paint the colours of the palette as fields so that the entire sampled area is the same colour. Making the palette colour fields slightly oversized allows for some errors (in e.g mirror angle and positions) while still fitting the frustums base inside it.

One way we could do is to line up all the colors in the palette in a vertical column and have the mirrors point to whatever color it needs to reflect. In the example below we can see how the rays reflects on the mirrors that are rotated in such a way that the light strikes one of the five color fields. The effect can only be seen when viewing the mirrors from the precalculated position.

In the example below we need one colour field per colour in the image. All mirrors assigned to yellow points at the same area inside the yellow field. All that are assigned blue point to a point inside the blue etc.

<center><img src="/one-image-3d.png" style="zoom:100%;" /></center>

<center><i>Fig X. A computer generated rendition of the mirrors appearing to be colored when seen from the correct location (left). The light rays bouncing on the mirrors and a color palette with five colors (right). Note the ellipses on the palette that represents the light stricken area and the rays only represents the single ray that hits the center point of that area.</i></center>

##Making an animation

If we replace the palette with another palette that has different colours the image will of course change. If we are careful with what colours the first and second palette has we can actually make two valid images without touching any mirrors. To do this we need to think of each mirror being assigned a sequence of colours instead of just a single colour.

If we place two vertical lines of colours we can think of one column as a frame of an animation and the rows as the sequences of colours assigned to mirrors. To change frame we can simply shift the palette left and right so that the mirrors reflections either strike the left or the right column.

<center><img src="/two-image-3d-frame1.png" style="zoom:100%;" /></center>

<center><i>Fig X. When the mirror points to the left column of color fields in produces one image.</i></center>

<center><img src="/two-image-3d-frame2.png" style="zoom:100%;" /></center>

<center><i>Fig X. When palette is shifted to the left making the mirrors point to the right column of color fields it produces a second image.</i></center>

In the example above the palette has been shifted slightly to the left while everything else is left untouched. Even though we use the same amount of colors we now have ten rows instead of five in the palette. Each mirror is now assigned a colour sequence rather than a single colour. Note that each column of the palette contains some colors multiple times. In the first image the mirrors depicting the eyebrows are black but in the second picture the same mirrors are yellow. This black-yellow color sequence is represented in the first row from the top of the palette. Further, the mirrors depicting the eyebrows in the second image are yellow in the first image and black in the second so those mirrors uses the yellow-black sequence in the fourth row. The red tongue in the first image disappears in the second image so the red color only exists once in the first column since all mirrors assigned red in the first image transitions to yellow in the second. 

If we want to add more frames to our animation we could just add another column. One problem that will be apparent really quickly is that the more frames we add and the more sequences will be needed to cover all possible transitions. Adding another column usually also means adding multiple more rows[^Color-sequences]. Since the color fields needs to be a certain physical size the palette has to grow in size with longer animations and with a larger amount of colors. For longer or more colourful animations it will become a problem of fitting the palette into a room.

[^Color-sequences]: The number of sequences that can be created with $x$​​ colors and $y$​​ frames is $y*x^y$​​. This means that having two colors and five frames will in the worst case (all combinations might not be used) make $2*5^2 = 50$​​ colour fields to be able to fit all possible combinations.

## Optimisations

The trickiest issue for making a good mirror picture is size and in particular the size of the colour palette. Having more colour fields allows for more complex sequences and hence more complex images but it will also require a spatially bigger colour palette or smaller colour fields. When the colour fields get smaller it requires a higher precision of the mirrors angles to accurately fit the frustums base within the colour field. The effect is dependent on the viewing position and changing that also changes the reflection in the mirrors and therefore also where the rays hit the colour palette. The bigger the colour palette fields are the more viewing position room for error there is so we want to optimise for as few colour fields as possible since that will make more of them fit in each unit of area. Obviously we want to optimise for few colour fields to be able to maximise their size.

### Selecting an optimised palette, or "color quantisation"

Maybe the most obvious optimisation for fitting larger color fields into a unit area is to use fewer colour fields. This inevitably leads to fewer colours that leads to lower fidelity images. Sometimes, if we are careful though, it's not easily detectable with the human eye. Two shades of red might be just a hair different but removing one and replacing it with the other might not make any noticeable difference[^noticeable]. 

In our case each mirror need to be reflecting one colour but we do not want a colour field for each mirror. We want to somehow let many mirrors reflect the same colour field while still maintaining the maximum of similarity to the original. In the technical literature this is referred to as _color space quantisation_[^quantisation].

This problem is computationally very hard[^NP-hard] but there exists a few good algorithms that can compute approximations. The standard color space quantisation algorithm that is used in for example Photoshop is called k-means clustering[^k-means clustering] and was invented in 1957. Another common algorithm is _Median Cut_ that is used less these days because of its poor quality. K-means and Median Cut tends to produce washed out colours when reducing the palette to very few colours.  A different slightly better but slow and resource intensive algorithm is _Hierarchical Agglomerative clustering_ or _Spatial Color Quantisation_ that were both published in 1994. For me I have got the best results with the _NeuQuant_ algorithm that uses pretrained Kohonen neural networks. 



> TODO: https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.72.1595&rep=rep1&type=pdf
>
> https://web.archive.org/web/20060614072845/http://members.ozemail.com.au/~dekker/NEUQUANT.HTML

[^NP-hard]: NP-hard (Non-determenistic Polynomial-time) problems is a class of problems where there exist no known solution that can solve the problem in polynomial time.
[^k-means clustering]: K-means clustering (or sometimes the _Lloyd–Forgy algorithm_ ) formally aims to partition _n_ observations into _k_ clusters in with each observation belongs to the cluster with the nearest mean.
[^noticeable]: Noticeable is of course a relative term related to perception which makes any error hard to qualify. This paper is long enough as it is.
[^quantisation]: In mathematics and signal processing _quantisation_ is the process of mapping a large often continuous set into a smaller countable set often with finite elements.



### Simulating  varying degrees of solidity with dithering and stippling, half toning or pointillism

> TODO: Write this

###De Bruijn sequences

One observation that can be made is that one horizontal sequence might start with the same colors as another ends with. It might be possible to put all sequences in one long horizontal line and let some sequences overlap each other reducing the total number of colour fields. The palette would work the same way as before: just shift it one step to the left to advance one frame.  For animations with more frames there might be an even larger overlap where one sequence first two colours is the same as anothers last two colours etc. If we keep on doing this we will eventually have something called a _De Bruijn sequence_. A De Bruijn sequence is a sequence that contains every possible subsequence of a particular length exactly once. 
It is actually possible to compute the De Bruijn sequence rather easily although we will not go into the details of it here but instead just assume we can do it. We now have one color line instead of a color grid.

For example this naïve sequence that is made up by concatenating all two letter combinations of A, B , C, D and E (we are using letters here instead of colors for clarity). Of course it contains all two letter subsequences e.g. AB, DA, BD, DD (below set in bold) etc. since it was made from it in the first place but we can see that there are multiple instances of many of the combinations. For example there are more than one AB (underlined) witch is redundant.

A A <u>**A B**</u> A C A **D A** E B <u>A B</u> B B C **B D** B E C A C B C C C D C E D A D B D C **D D** D E E A E B E C E D E E

Below is the De Bruijn sequence, also containing all two letter subsequences but with the difference that it does not contain any duplicates and hence is much shorter. The bolded letters are still present but the underlined AB subsequence only appears once (as well as all other possible subsequences).

A <u>**A B**</u> A C A **D A** E B B C **B D** B E C C D C E **D D** E E A

In the first example with the naïve implementation we needed to use $y*x^y = 50$​​​​ fields (where $x$​​ denotes the number of colours and $y$​ the length of the subsequence) while we with a De Bruijn sequence we only need $x^y = 25$​​​​ to fit all possible color sequences in the best case saving 50% space.

<center><img src="/two-image-debruijn-sequence.png" style="zoom:100%;" /></center>

<center><i>Fig X. The De Bruijn sequence for the example smiley animation above. They eyebrows that used the black-yellow and yellow-black transitions can be found in the middle. Spatially those two sequences takes up only three unit squares while the naïve version uses four, a 25% saving.</i></center>

Now, we might not actually need all the color fields in the De Bruijn sequence. There might not be any need for a transition from A to A (e.g. in the smiley animation there are no transition from red to red) and in that case we can prune away those subsequences and end up with an even shorter sequence.

The only drawback with using a De Bruijn sequence is that it needs to be in one continues line which is not very space efficient. We'd like to have the ratio of the height and the width of the full color palette as close to $1.0$​​ as possible since we get less conic distortions by having the mirrors set at shallow angles.

###Disc shaped palettes

The sequence can be awfully long so it might be an idea to try to pack the color fields for example in a color circle instead of a color line. By doing this we will also trade a lot of horizontal space for a little vertical space making the entire contraption a bit more manageable. This also means that instead of moving the color fields horizontally we need to start rotating something[^Rotating-palette].

<img src="/debruijn-wheel.png" style="zoom:50%;" />

<center><i>Fig X. The smiley animation De Bruijn sequence as a circle.</i></center>

Arranging the De Bruijn sequence in a circle has the small effect that the sequence is one element shorter than the straight De Bruijn variant since the last element also works as the first. In the above example the last blue can be dropped since there is already two blue at the beginning while still preserving the blue-blue and white-blue transitions (at 12 o clock in the circle).

##### Loopability and better space utilisation

Even if the De Bruijn sequence is efficient at packing information in a sequence it's still not great for actual wall space. All the space is the centre is wasted. We could just keep the circle idea but combine it with the roe-column we had in the beginning. That would make a colour palette disc instead of a circle. We can advance to the next frame by rotating the disc and if we keep rotating we'll get back to the first frame again which gives us the nice feature that the animation loops.

<img src="/sequence-wheel-non-sorted.png" style="zoom:50%;" />

<center><i>Fig X. The smiley animation color sequence as a disc.</i></center>

#####Sorting the sequence rings with Shannon entropy

The radial ordering of the sequences (rings) are generally arbitrary. The sequences closer to the middle cover a smaller area since the circumference increases with radius. Since the mirrors might not be totally exact due to the fabrication process it can be a good idea to have more information density in the periphery of the disc where the area are bigger. We could for example sort the sequences in a way such as we put the single color sequences end up close to the middle and the sequences with multiple colors end up close to the periphery. An over engineering method (that I've opted to go with) is to sort the sequences on their Shannon entropy. Shannon entropy of $X$ is defined as:
$$
\Eta(X) = -\sum_{i=1}^n {\mathrm{P}(x_i) \log \mathrm{P}(x_i)}
$$
Where $$x_1, ..., x_n$$​ is the possible outcomes which occur with probability $$\mathrm{P}(x_1), ..., \mathrm{P}(x_n)$$​​​​.
We don't really have to dwell too long on the nitty gritty but can conclude we can compute a number for each sequence that will be lower if not much happens in it and high if there is a lot happening. We can then use that to sort the radial rings. In our example here single color sequences ends up in the middle.

<img src="/sequence-wheel.png" style="zoom:50%;" />

<center><i>Fig X. The smiley animation color sequence with the rings sorted on Shannon entropy.</i></center>

##### Increasing frame-rate by multiplication

The sequence loops every full revolution of the disc. To make the frame rate higher without spinning the disc faster we can multiply the color fields in each radial section. Since the sequence is looping anyway we haven't in effect made any changes to it. A nice side effect is that the disc can look slightly more interesting.

<img src="/sequence-wheel-frame-duplicate.png" style="zoom:50%;" />

<center><i>Fig X. The smiley animation color sequence with the elements of the sequences multiplied four times.</i></center>

##### Prune redundancies

After sequence multiplication it is obvious that a few sequences are redundant. In our example we have the black-white transition that is topologically equal to the white-black transition. The same goes for the black-yellow and yellow-black transitions. We can just assign each mirror a sequence with a starting offset and drop the duplicate. For example to get the black-white sequence we can aim a mirror the first black field starting from 0° on the disc. To assign the white-black sequence we just skip ahead a bit and aim it the first white field. The first frame will then be black or white respectively and when rotating the disc we advance to the next colour in the sequence being white and black respectively. Since there are multiple valid starting offsets (depending on how many times we did the sequence multiplication) we can actually just assign any valid one at random for each mirror.

<img src="/sequence-wheel-removed-redundancies.png" style="zoom:50%;" />

<center><i>Fig X. The smiley animation color sequence with topologically similar sequences pruned.</i></center>

##### Ring staggering

If we think that the disc looks a bit static we can introduce some rotational shift between each ring radially. This  doesn't affect the sequence but gives us some artistic flexibility.

<img src="/sequence-wheel-helix-shift.png" style="zoom:50%;" />

<center><i>Fig X. The smiley animation color sequence with each radial ring shifted 3.7° in relation to the next ring.</i></center>

##### Sizes of concentric section areas

https://francoisbest.com/posts/2021/hashvatars

[^Rotating-palette]: If the center of the color circle, the center of the mirrors and the center of the spectators eye lies on the same line we can rotate either the color circle or the mirrors. We any of them are not we can only rotate the color circle and still produce the effect.

####Not overlapping pictures

As we have seen in previous optimisations it is possible to reduce the number of colour fields used to encode a sequence but it is even better to keep the sequences down to begin with. Making animations constructed in a certain way can make the number of sequences be equal to the number of colours regardless of how many frames there is. Imagine that all images in all frames have one smaller image in it with a solid background colour around it. The position of the smaller image in each frame only overlaps the background in the other frames. This leads that each mirror is assigned a sequence that contains one element with a colour and all other elements are just the background color. With the pruning redundancies trick above we can collapse the number of sequences to one per colour.

<img src="/tea-sun-lager-0.png" style="zoom:100%;" /><img src="/tea-sun-lager-1.png" style="zoom:100%;" /><img src="/tea-sun-lager-2.png" style="zoom:100%;" />

<center><i>Fig X. Three frame animation where each frame contains a smaller image.</i></center>

In the above animation of three frames has three objects placed on a solid white background. It is made out of eleven colours. If the objects would all overlap it would in the worst case end up being 1331 different sequences to cover all possible transitions that would have to fit in the palette. Without the overlapping images we only need 11 sequences to cover all possible transitions (the same as the number of colours). There are for example no grey-yellow-orange transition or brown-yellow-yellow there is just color-white-white. Adding another frame would not add more sequences since it would just make all sequences be color-white-white-white etc.

<img src="/tea-sun-lager-disc.png" style="zoom:50%;" />

<center><i>Fig X. Palette for the above "tea, sun and lager" animation with four times frame rate multiplication and some staggering.</i></center>

#### Pruning when having too many sequences

Sometimes the number of colours and/or frames are too high and we end up with too many sequences even after all previously described optimisations. When there are too many sequences it is hard to fit all of them in any given space. One last resort can then be to compromise and try to prune sequences that are rarely used and replace them with a substitute that are very similar. To do this we need to be able to quantise colour differences. Luckily someone has already figured that out for us and the industry standard is called called _CIELAB $\Delta$​​​​​E*94_ [^CIELab] or Delta-E for short.

Delta-E quantifies the difference between two colours as perceived by the human vision. It computes a number ranging from 0.0 to 100.0. Values below 1.0 is not perceivable by the human eye. Values between 1 and 2 can be perceived by close observation, 2-10 at a glance. Values between 11 and 49 means the colours are more similar than opposite and the value 100 means the colours are exact opposites. 

By comparing the sum of square means of the Delta-E values of the elements of the least used sequence with the elements of all other sequences it is possible to figure out which sequence looks more the same. Then all mirrors using the soon-to-be removed sequence is set to instead use the most similar sequence.

The algorithm reduces the number of sequences until we have the desired number of sequences. When reducing, some colours will be completely discarded since they might have very similar approximates already in the set of sequences. For example a light brown to red transition can maybe be replaced with a slightly darker brown to red transition without much of a visual difference overall. It can also be that a single mirror is assigned to a sequence and then we can assign that mirror to a sequence that looks quite similar without it being easy to even notice it. Though when the number of sequences gets too low ghosting artefacts starts to appear. Ghosting is when features of one image starts leaking into the other. In future work this algorithm could probably be improved to avoid ghosting by for example incorporating more advanced error diffusion techniques like *Floyd-Steinberg dithering* or *Atkinson dithering* adapted to work on sequences.

> `TODO: This could also be interesting: Agglomerative hierarchical clustering (http://harthur.github.io/clusterfck/)`
>
> `also RGB quantization: http://leeoniya.github.io/RgbQuant.js/demo/`
>
> https://medium.com/@sitianliu_57680/how-to-pick-the-optimal-color-palette-from-any-image-ef1342da8b4f
>
> https://github.com/okaneco/rscolorq
>
> https://cmitja.files.wordpress.com/2015/01/hellandtanner_imagedithering11algorithms.pdf
>
> https://www.cs.princeton.edu/courses/archive/fall00/cs426/lectures/dither/dither.pdf
>
> https://surma.dev/things/ditherpunk/
>
> https://bisqwit.iki.fi/story/howto/dither/jy/

|  #   | Palette                                                 |                             |                             |
| :--: | ------------------------------------------------------- | --------------------------- | --------------------------- |
|  35  | <img src="/reduction/35/disc.png" style="zoom: 35%;" /> | ![](/reduction/35/sim0.png) | ![](/reduction/35/sim1.png) |
|  30  | <img src="/reduction/30/disc.png" style="zoom: 35%;" /> | ![](/reduction/30/sim0.png) | ![](/reduction/30/sim1.png) |
|  25  | <img src="/reduction/25/disc.png" style="zoom: 35%;" /> | ![](/reduction/25/sim0.png) | ![](/reduction/25/sim1.png) |
|  20  | <img src="/reduction/20/disc.png" style="zoom: 35%;" /> | ![](/reduction/20/sim0.png) | ![](/reduction/20/sim1.png) |
|  15  | <img src="/reduction/15/disc.png" style="zoom: 35%;" /> | ![](/reduction/15/sim0.png) | ![](/reduction/15/sim1.png) |
|  10  | <img src="/reduction/10/disc.png" style="zoom: 35%;" /> | ![](/reduction/10/sim0.png) | ![](/reduction/10/sim1.png) |
|  5   | <img src="/reduction/5/disc.png" style="zoom: 35%;" />  | ![](/reduction/5/sim0.png)  | ![](/reduction/5/sim1.png)  |
|  1   | <img src="/reduction/1/disc.png" style="zoom: 35%;" />  | ![](/reduction/1/sim0.png)  | ![](/reduction/1/sim1.png)  |

<center><i>Table X. The first row shows the animation with 35 sequences. The palette disc is really struggling to fit all sequences but the resulting images are vivid with colours and contrast. After reducing to 30 sequences not much can be seen visually but it's possible to see some brown spots in the red line to the left of the hotdog from a strong reduction in sequences containing green. By 25 sequences all green colour has been removed and the hamburger lattice is ghosting in the hotdog. The reduction to 20 sequences doesn't change much but the hamburgers tomato and right side of the bun is starting to leak into adjacent areas. At 15 sequences all darker colours have disappeared and we are starting to loose contrast. The sausage also see significant ghosting from the hotdog. At 10 we are down to five colours from the original 8. The meat in the burger are clearly ghosting. At five sequences its still possible to guess the original images but it's getting hard. Finally at one sequence there is just a mess of brown left.</i></center>



[^CIELab]: CIE stands for _the **I**nternational **C**ommission on **I**llumination_. LAB for L\*a\*b witch is a color space used to representing colors. The L stands for perceived **L**ightness while the a\* and b\* for the four unique colors of human vision: red, green, blue, and yellow. Further in the $\Delta$​​​​​​​​E* part the greek letter delta commonly denotes difference and the E stands for *Empfindung*; German for "sensation". 94 means it was published in 1994. To compute the difference of two colors: the formula is given: $\Delta E_{94}^* = \sqrt{ \left(\frac{\Delta L^*}{k_L S_L}\right)^2 + \left(\frac{\Delta C^*_{ab}}{k_C S_C}\right)^2 + \left(\frac{\Delta H^*_{ab}}{k_H S_H}\right)^2 }$​​​​​​​​ where $\Delta L^* = L^*_1 - L^*_2$​​​​​​​, $ C^*_1 =\sqrt{ {a^*_1}^2 + {b^*_1}^2 }$​​​​​​, $C^*_2 =\sqrt{ {a^*_2}^2 + {b^*_2}^2 }$​​​​​,$\Delta C^*_{ab} =C^*_1 - C^*_2$​​​​​, $\Delta H^*_{ab} =\sqrt{ {\Delta E^*_{ab}}^2 - {\Delta L^*}^2 - {\Delta C^*_{ab}}^2 } =\sqrt{ {\Delta a^*}^2 + {\Delta b^*}^2 - {\Delta C^*_{ab}}^2 }$​​​​​, $\Delta a^* =a^*_1 - a^*_2$​​​​​, $\Delta b^* =b^*_1 - b^*_2$​​​​, $S_L =1$​​​, $ S_C =1+K_1 C^*_1$​​, $S_H =1+K_2 C^*_1$​​​​​​​​







## Palette arrangements

> `TODO: Write about all these variants`

* Disc
* Cylinder
* Ring
* Internal Cylinder
* Conveyor
* X-Lines 
* Y-Lines
* XY-Grid *Rectiliniear*
* Interlaced grid
* Just different color fields randomly positioned
* Multiple palettes
* Combination of palette types
* Stippling with light

## Shape of mirror board and mirror arrangement

`TODO: Write about all these variants`

* Stippling
* Hex lattice
* Grid lattice
* Freeform
* Using existing room features as the palette (or the sky)





## Positioning and angles

`TODO: This needs a rewrite`

The relative positions of the mirrors, color disc and spectator makes for different pros and cons. In this section we are going to investigate them.

The first option is to put the color disc against a wall, put the mirrors facing the disc and then the spectator in-between facing the mirrors. In this configuration both the disc and the mirrors can be rotated to play the animation as long as they all share the same axis of rotation. Rotating one or the other doesn't really matter. The obvious downside of this is that the spectator will obscure some of the color disc. It is also not obvious for the spectator where the focus point for the mirrors are. This can be both good and bad. Good because it will be surprising when the sweet spot is finally found but bad since it might be hard to find it.

To remedy both those downside one can put a small hole in the middle of the disc and set the focal point in the middle of that hole. The spectator would then stand behind the disc looking though the hole at the mirrors. One downside with this configuration is that one have to actively search out the focal point. One could not just walk passed and happen to find it as a surprise. It also means that the disc has to be free standing in the room instead of being able to be mounted on a wall. This adds some additional complexity to the construction. The back side of the disc needs to be fabricated etc.

The third option is to put the mirrors perpendicular to the disc between the spectator and the disc in the depth direction but slightly to the side. In this configuration only the disc can be rotated to play the animation for geometric reasons. The disc can be hung on the wall and there is a possibility to randomly discover the picture by just walking by. The spectator is also not in the way of any of the light rays. One has to consider that the distance between the some of the mirrors and the disc will differ quite substantially in relation to the cone shape of the arrays from each mirror. Mirrors further away from the disc will reflect a larger area on the disc than mirrors closer to the disc.

## Simulating light rays in rendering software for debugging

`TODO: Write this section`

## Selecting a picture

When inventing new technology for displaying images or algorithms to modify them there is always the tension between what you show and how you show it. A lot of times the medium itself is more important than what is transmitted though it. When experimenting with a new technique the image subject can be completely arbitrary the features of that image might not be. Depending on what technique ones trying to show it might be important that the test image has soft shades or hard edges. Depending on the application the image needs to have concave shapes or contain big colour spectrums or high frequency details. Something like the equivalence of the publishers _Lorem Ipsum_[^loremipsum]. In academia this has traditionally been solved by using standard images. In 2D computer image research a picture called _Lenna_ is commonly used that depicts a woman with a hat but a common picture is also DaVincis Mona Lisa. In 3D modelling a few standard models exist for example the _Utah teapot_, the _Stanford Bunny_ and the _Cornell box_ (all named after their respective university where they were first used). All these examples have some particular thing that is makes it easy to see how the technology can be used. For example the Utah teapot features smooth surfaces and self occluding geometry something that was challenging to render in 1975 when it was first created.

I started going down the route of just using academias standard pictures but I quickly found them a bit dull. After a while of randomly image-googling words I found highly detailed and colourful images that was also optimised to be shown in low resolution in the Unicode emoji set. It contains images of common objects that has become icons like for example the smiley, the thumbs up or the egg plant. I have also just drawn pictures with the mouse in photoshop after getting bored of searching for images. 

### Potato tomato

### Tea, the sun and lager

### Rooster

### Volcano

### Lines

### Smiles



# Fabrication

`TODO: Write these sections or maybe just skip them?`

## 3d-printing

Non planar 3d printing could be further investigated

## Using 3-axis CNC

Horizontal milling in 3 axis in the direction of the slope could be further investigated

## Using 5-axis CNC

## Using 6+1 axis KUKA robot

## Mounting disc

## Painting the disc

## Calibration mirrors













