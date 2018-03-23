# Popet
Image animation GIF maker

Popet began with the idea of animating loops by distorting an image-mapped mesh. In many ways, it's a continuation of ideas I began exploring with Boopy. 

The puppet mesh skin can be interactively distorted using a small set of "bones". To create this, I employed a single vertex shader in WebGL that calculates the transform based on distance from each handle. There are 4 handles, which is pretty handy for the GLSL 'vec4' variables. Starting position, offset, and rotation for each handle is passed into the vertex shader where it's applied to each point in the mesh and then weighted according to distance/falloff.

For the UI, a second Canvas element is drawn on top of the WebGL Canvas, and motion of each point is stored as an array of position values, and is constantly both read and written at each frame change. This follows the circular buffer idea used to represent delay/loop effects in audio programming. One of the beauties of circular buffer loops is that each loop can have different start/end points based on timing of gestures.

GIF export is done using GIF.js
