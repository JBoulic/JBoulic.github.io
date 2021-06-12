# Cube

## DESCRIPTION
Switch modes by pressing **1**, **2** or **3**

### **1**: Solve mode
Keys | Actions
---- | ----
Space | Scramble
Esc | Reset cube
I, K | R, R'
D, E | L, L'
J, F | U, U'
H, G | F, F'
S, L | D, D'
W, O | B, B'
U, M | r, r'
V, R | l, l'
T, Y, B, N | x, x, x', x'
;, A | y, y'
P, Q | z, z'

### **2**: BLD - Corners
- Type 2 letters to display the associated letter pair word and algorithm at the bottom.
- Corner orientation is supported: type 2 letters that belong to the same piece.
- Almost all the algorithms are commutators, typically following S, A, B, A', B', S'. Press the left/right arrows to go through/animate these sequences.
- Press backspace to reset the cube.
- Press space to generate a random algorithm.
- Press escape to reset the cube.

### **3**: BLD - Edges
- Similar to corners.

### Touch devices
The web contents (page) are divided into 4 parts:
- Touch the top-left part of the screen to reset the current algorithm to the beginning.
- Touch the top-right to jump to the end.
- Touch the bottom-left/right to go backwards/forward in the sequences of the algorithm.

When the actions above are not applicable, a random corner or edge algorithm is selected.

## TODO

Solving mode:
- Detect solved state
- Implement timer
- Save best times

Other:
- Customisable perspective view
- Customisable appearance (e.g. space between pieces)
- Customiable letter pair words and algorithms (requires a server)
- Implement Anki-like memorisation techniques for clicks/touches and algorithms selection

## DONE

Implement different modes:
- 1 -> solving mode
- 2 -> BLD corner practice mode
- 3 -> BLD edge practice mode
- Display plain stickers for mode 1

Interface:
- Indicate different modes, just text
- Display current mode
- Apply current mode
- Make canvas take up entire space available on webpage
- Handle page resizing
- Add app description

BLD practice mode:
- Create a spreadsheet for letter-pair/algorithm
- Add algoritm info in JSON
- Implement input piece to select -> console.log
- Update cube with relevant stickers
- Implement input letter-pair
- Create a spreadsheet for letter-pair/word
- Generate JSON to map letter-pair to word
- Add letter-pair word to UI
- Display algorithm on interface
- Animate cube, ignoring the "[", "]"
- Create list of moves taking the brackets into account
- Generate alternate algorithm with first letter > second one in alphabetical order
- Implement step by step (or rather group by group) when pressing arrows
- Cancel cancellable moves (example: corner GH)
- Apply moves in reverse direction to get initial state to solve
- Check if the input is a letter before doing something with the BLDPracticeInputHanler
- Implement E, S, M, r, l, u, d
- Finish implementing all the sticker letters
- Color buffer sticker by default
- Implement random letter-pair/algorithm selection
- Implement mobile version: click to select random letter pair, click to show the solution
- Remove processed alg line
- Implement backspace to get to initial state of alg
- Improve visuals
- Improve UI: Letter pair word bigger and at the top
- For corner twists, only color white sticker
- Mobile mode: implement actions depending on touch location
- Mobile mode: add location to go to the end of alg

Code:
- Create own fps counter
- Remove opaque attribute for each piece
- Create own matrix data types with no dependency on matrix.js
- Update code to use ES6 classes and modules
- Make indentation consistent in code
- Add icon

Data:
- Edges data is a mess, clean it up
- Remove letter pair words for twists and flips
- Delete processing steps for DU, FB etc... and update spreadsheet instead
- One edge algorithm is broken

Bugs:
- AW: empty move
- SA or AN: issue when 2 letters without space (UD and variants). Add space in data processing  
- SA: algorithm not simplifiied
- AG (edge): 3 times the same move
- QP: malformed because of special character in original spreadsheet
- GS (edge): (...)*2 notation not supported
- GA: wrong stickers colors
- VS: FB not supported
- JP (edge flip): no U2 decomposition
- Corner twists: Shouldn't check whether charAt(0) > charAt(1), since we have 2 algs provided, cw and ccw
- IU: Empty move
- IU/UI: algs are swaped, update spreadsheet
- LG (edge): undefined
- Should prevent resetAlg while busy
- VJ edges: provided algorithm is not right
- Edges JU, LU: Reimplement alg parsing algorithm for setup + single permutation
- Corner VQ: fix apostrophe character
- Fix touch handling
- Escape key in BLD mode doesn't reset the on screen data and opaque buffer
- Inconsistent letter pair word positioning across devices
- Invalid input: Still light up all selected stickers

## NOTES

Refresher on WebGL
https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html

ES6 modules are subject to same-origin policy - use a local server for local testing.
