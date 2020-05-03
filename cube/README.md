Refresher on WebGL
https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html

### TODO

Data:
- Edges data is a mess, clean it up
- Remove letter pair words for twists and flips
- Delete processing steps for DU, FB etc... and update spreadsheet instead
Solving mode:
- Implement timer
- Save best times
Code:
- Create own matrix data types with no dependency on matrix.js

### DONE

- Update code to use ES6 classes
- Remove opaque attribute for each piece
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
Code:
- Create own fps counter
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
