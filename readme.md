#Mirror animator

## Sequence of operations

- Light rays from color field to mirror to eye
    - Figuring out the angles
- Matrix of mirrors to matrix of palette
- Reuse of palette colors
- Lining up palette in a vertical line
- Having second line for a second animation frame
    + Possible to use a spinning pole
- Make color palette into a circle
- Find cyclic sequences and set offset
- Problems with too many sequences
    - The inverse square law 
    - Reducing number of sequences to set number
    - Reducing sequences by beeing smart about how to make the picture
- Using Shannon entropy to sort dequences
- Using round mirrors for milling
- Using hexagonal array for mirrors to better fill the plane
- Multiplying frames for faster frame-rate (cyclic sequences still hold up)
- Randomizing starting points for equivivivalent cyclic sequences to break up angle patterns
- Section helix shift
- Spectator/mirror/color palette positioning
    - Along Y-axis. Spectator between mirror and color palette
        + Possible to rotate mirror and/or color palette
        + Minimal magnification of mirror rays
        + Spectator in the way
        + Color palette can be put on wall
    - Along Y-axis. Spectator behind color palette
        + Possible to rotate mirror and/or color palette
        + Hole in centre
        + Spectator position obvious
        + Cannnot be on wall
    - Off axis
        + Mirror can not be rotated
        + Magnification effect uneven
        + Possible to see both color palette and mirrors at the same time
- Cnc machining
    + machining strategies
        * 3 axis machine
        * 5 axis machine
            - creating .cnc-file and file format
                + rotate machining plane
        * 6 axis machine
            - Maybe something about KUKA vs ABB formats
- Simulating laightrays in Blender
    + creating .obj-file and file format
- Errors in real life vs in a mathematically perfect world


##Introduction
This paper will attempt to explain how the animating mirror works in detail.
On a high level it consists of an array of mirrors are colorized by being  angled in a way so that they reflect colors from a palette image.

In this section we are going to discuss how reflections work in a mathematically. Mathematical models allows us to calculate the theoretical behaviour of light disregardning the inperfections of the physical world. This will therefore not be an exact mathematical calculation but an approximation of the physical world. Since the physical world is imperfect and chaotic we need to add some tolerances to our design when we create the final object.

##How reflection works
Light rays travel in a straight line through a media (like air). When striking a surface some of the light will be absorbed by the surface (converted to heat) and some will bounce back, reflected. The absorbtion is what makes object look colorized since the surface might absorb some frequences more than other. On a flat, smooth surface, called a specular surface, the angle of incidence, the angle at witch the light ray hits the surface, will be exactly the same as the angle of reflection with regards to a projected line perpendicular to the surface known as the normal. On rough surfaces, called diffuse surfaces, the light will reflect in slightly different angles all over the surface but still retaining its energy.
A mirror is specular while a painted wall is diffuse.

	<Picture>

For opaque materials all the light will either have to be reflected or absorbed.  If the material is transparent or translucent some of the light might pass into the material. When passing into a material the light ray bends from its angle of incidence. This phenomenon is called refraction. The amount of bending is due to the relative indices of refraction (also called the optical density) of the medium the ray travels from and the medium the ray travels into. The larger the difference between the media the more the ray bends. For reference air has a refractive index very close to 1.00 while the value for window glass is about 1.52.

	<Picture>

So far we have thought of the light as single rays that strike the middle of the color field, the middle of the mirror and the middle of the spectators eye but that is a too big of a simplification. In reality there are millions of rays bouncing in different directions. We will not consider all of them since that would be too interlectually straining but we need to at least acknoledge that the color fields and mirrors are surfaces and not just points.

For our purpuses we can largely disregard both refraction and diffuseness. We also don't have to consider translucensy, internal reflections, subsurface scattering, fresnel effect or any other obscure phenomena since it will not make any noticable difference that we can adjust for anyway. We will consider the mirrors we use ideal mirrors that are perfectly flat, perfectly opaque and perfectly specular. The only thing we will do is to verify that the refraction of the glass mirrors. The reflective surface is actually on the back face of the mirror so the light rays has to pass through the glass and refract slightly before it can be reflected by the silver surface. Since the distance the ray has to travel it should not create too much of a problem. 

Throughout this article we will calculate with single rays but that is a simplification. We will discuss that more in depth in the section about accounting for distances.

##Colorizing a mirror
Since our idialized mirror reflects all light striking it without absorbing any light it doesn't have any inherent color. By adjusting the angle of the mirror we can make it reflect other surfaces and thereby taking the color of that surface. If we want the mirror to look red we can angle it in such a way that it reflects a red surface.

If we create a "color palette" that we then can "sample" colors from by adjusting the angle of our mirror we can essentialy make a pixel that can take any color from the palette and reflect that into the spectators eye.

If we want another color we can just realign the mirror. Since realigning the mirrors can be a bit fiddely we can also just move the palette so the mirror reflects another color field.

	<Picture>
	
	TODO: Describe more carefully how this works and with multiple colors. How to calculate the angle of the mirrors


##A picture
By putting multiple mirrors in a two dimensional array, or a grid, and angling them individually towards different color fields on the color palette we can slowly create any arbitrary image. Needless to say we do not need a separate color field for each mirror. Multiple mirrors that require the same color can all point to the same spot on the color palette.

	<PICTURE>

One way we could do is to line up all the colors in the palette in a vertical line and have the mirrors point to whatever color it needs to reflect. This configuration will be useful as we will see in the next section.

	<PICTURE>

##An animation
If we now swap out the palette with another we can change all the colors in the picture. By placing two vertical lines of colors we can just slide the lines left or right to change from palette one to palette two.

	<PICTURE>

Every mirror is now essentially pointing to a sequence of colors instead of just one color. This means that the first palette might have to contain multiple copies of one color. One mirror might for example need red in the first palette and blue in the seconds and another mirror might need red and then green.
Since the its just a shift the first palette need to make space for whatever comes in the next palette. 

	<PICTURE>

By moving the palette horizontally we can now switch from the first to the second picture. Note that it is also possible to shift the mirrors and the spectator an equal amount in the opposite direction for the same effect. A third option would be to rotate the mirrors individually without moving anything.

	<PICTURE>

If we want more frames to our animation we just add another vertical line. One problem that will be appearent really quickly is that the more frames we add and the more colors we add will grow the color fields to cover a wall.
Adding more colors and/or frames requires you to add more horizontal sections to be able to create all possible sequences. The number of sequences that can be created with x colors and y frames is x to the power of y. This means that having five colors and four frames will in the worst case make 5^4^ = 625 horizontal lines and five vertical to be able to fit all possible combinations. Adding one frame adds another 2500 horizontal lines while adding another color adds 671 horizontal lines and one vertical.

Since each mirror first points a color in the first vertical line and then the seconds and the third etc. we could save some space by putting the colors on a cylinder that rotates around its vertical axis. This whould make us fit 3.14 times more vertical lines in the same horizontal space but at a cost of some space in the depth direction.

	<PICTURE>

##First optimization: De Bruijn sequences
To continue here we first need to forget about the cylinder in the previous section and go back to the initial setup with all the colors in a grid on the wall since this trick requires that the mirror can se multiple horizontal fields at the same time without the color fields being on the back of a cylinder.

One observation that can be made is that one horizontal sequence might start with the same colors as another ends with. There might be an even larger overlap where one sequence first two colors is the same as anothers last two colors. When doing this we ofcourse need to adjust the mirrors accordingly. All mirrors using a sequence that now is overlapped at the end of another sequence must start pointing at the start of the overlapping sequence, that might be the end of another sequence.

If we put those sequences that overlap another sequence on top of eachother we can get a lot less horizontal lines at the cost of adding a few vertical lines.
We can actually keep on doing this, adding sequnences that overlap, until we have just one long horizontal line. We will then, if we're lucky, have something called a De Bruijn sequence. A De Bruijn sequence is a sequence that contains every possible subsequence of a particular length exaclty once.
It is actually possible to compute the De Bruijn sequence rather easly although we will not go into the details of it here but instead just assume we can do it. We now have a color line instead of a color grid.

	<PICTURE>

De Bruin sequences are actually cyclical, meaning that the end of the sequence hooks into the beginning of itself. One subsequence can therefore exist on the bridge between the start and end.

	<PICTURE>

This sequence will be awfully long so we might as well just use a color circle instead of a color line. By doing this we will also trade a lot of horizontal space for a little vertical space making the entire contraption a bit more managable. This also means that instead of moving the colorfields horizontally we need to start rotating something. If the center of the color circle, the center of the mirrors and the center of the spectators eye lies on the same line we can rotate either the color circle or the mirrors.
We any of them are not we can only rotate the color circle and still produce the effect.

	<PICTURE>

##Second optimization: Circles
Having a few frames and a few colors in our animation will produce an awfully long De Bruin sequnece and hence an awfully big circle.
A lot of these sequences will probably also not be used by any mirror so they are only redundant. Since it is important that the color fields cover as small of an area as possible to avoid the inverse square law described above we need to do some more work. 

The good news is that we can use some ideas from the previous optimization to make the following observation: If we make the sequences cyclical, some of those sequences will equal to another sequence if rotated. So if we make the color sequences into concentric color circles we will be able to prune some rotational duplicates. We now also only have to add the sequnences that a mirror is really going to use. Once again we will have to adjust where the mirrors point to adjust for the starting offset in the overlapping sequences. We now have our final form: a color disc. 

	<PICTURE>

A fortunate side effect of having circles instead of grids or lines are that the animation will automatically loop by just keep on rotating the color disc.

<img src="./output/disc.png" alt="alt text" title="A disc" style="zoom:10%;" />







## Shape of mirrors

We will get to the manufacturing in a later section but there we will see that it is beneficial to make the mirrors round. Having the mirrors be arranged in a grid will leave a lot of gaps between them. The gaps does not reflect any light (or it will reflect light, just not the light we want) and that will wash out the colors of the picture. The most dense packing of circles on a plane, making more of the surface be mirrors, is the hexagonal array packing. This is the same packing bees use for their beehives. This will minimize the space between the mirrors and hence reflect more light per unit area and therefore allow for a more vivid image.

## Accounting for distances
Although the light rays starts at a light source, bounces and scatters of the color surfaces and then reflects on the mirros and strikes the spectators retina it is easier to think of the process in reverse. The math will add up both directions (it is actually a funamental law of thermodynamics that all optics are reversable). If we think of the rays from the eye (so in reverse) that strike the mirror they will actually form a cone  with the peak in the eye and  the base covering the mirrors surface. When the rays reflect off the mirrors the cone will continue expanding  until it strikes the color fields. The surface area that will be sticken on the color fields is related to the surface area of the mirrors and the combined distances between the eye, mirror and color surfaces. Doubleing that distance will quadrouble the area. This is important to note since having too small color fields in relation to the distance from the mirrors will make the mirror pick up more than one color field.
To account for that one can either move the color disc closer to the mirrors or make the mirror disc bigger.

	<PICTURE>

There is another phenomenum that we have to at least consider. If the light cone from the mirror does not strike the color disc completely perpendicular the cone will be "cut off" at a slanted angle. This means that the reflected surface of the color field will not be a perfect circle but an oval. Depending on where on the color disc the mirrors are reflecting the shape of the reflecting area will be different. We need to make sure that the entire area of the reflected shape will be within the color field.

	<PICTURE>

## Positioning and angles

The relative positions of the mirrors, color disc and spectator makes for different pros and cons. In this section we are going to investigate them.

The first option is to put the color disc against a wall, put the mirrors facing the disc and then the spectator in-between facing the mirrors. In this configuration both the disc and the mirrors can be rotated to play the animation as long as they all share the same axis of rotation. Rotating one or the other doesn't really matter. The obvious downside of this is that the spectator will obscure some of the color disc. It is also not obvious for the spectator where the focus point for the mirrors are. This can be both good and bad. Good because it will be surprising when the sweet spot is finally found but bad since it might be hard to find it.

To remedy both those downside one can put a small hole in the middle of the disc and set the focal point in the middle of that hole. The spectator would then stand behind the disc looking though the hole at the mirrors. One downside with this configuration is that one have to actively search out the focal point. One could not just walk passed and happen to find it as a surprise. It also means that the disc has to be free standing in the room instead of being able to be mounted on a wall. This adds some additional complexity to the construction. The back side of the disc needs to be fabricated etc.

The third option is to put the mirrors perpendicular to the disc between the spectator and the disc in the depth direction but slightly to the side. In this configuration only the disc can be rotated to play the animation for geometric reasons. The disc can be hung on the wall and there is a possibility to randomly discover the picture by just walking by. The spectator is also not in the way of any of the light rays. One has to consider that the distance between the some of the mirrors and the disc will differ quite substantially in relation to the cone shape of the arrays from each mirror. Mirrors further away from the disc will reflect a larger area on the disc than mirrors closer to the disc.

##Being smart with the animation


##Making the disc look better with helix

## Randomizing starting points for equivivivalent cyclic sequences

## Sorting circles with shannon entropy


##Multiplying frames from higher framerates

##Simulating in Blender

##Selecting a picture

Criteria I have set up for myself for the selections of pictures.

- Good looking color palette 
- Good if the picture has high contrast since it might desaturate in the mirrors
- Good if it's a recognisable object so its easier to see if its a bit noisy
- Good if the pictures are high complexity so it gets more mind boggling 
- Good if there are few colors to lower the number of sequences
- Good if there are a lot of frames (also adding to number of sequences though) to heighten perceived complexity
- Good if the pictures are different for greater effect between frames
- Good if the pictures are unsimilar to color disc for mind boggelingness
- Good if mixing words and pictures to show unsimilarity between pictures
- Good if there is a concept to the pictures
- Good if the pictures are a bit fun
- Good if the colors sequences can be kept low but at the same time having a high complexity image by being smart with the colors.
- Good if the sequences can be permutated since there are a lot of starting points that way





FC2 you should indicate your position by visual signals

FJ5 Position of accident are marked by wreckage 

IV Where is the fire

FZ1 I am continuing to search

GC1 result of search negative



# Machining

## 3d-printing

## Using 3-axis CNC

## Using 5-axis CNC

## Using 6+1 axis KUKA robot













