Refresher on WebGL
https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html

### TODO

BLD practice mode:
- Animate cube, ignoring the "[", "]"
- Create list of moves taking the brackets into account
- Cancel cancellable moves
- Implement step by step when pressing arrows
- Implement reverse step by step when pressing ctrl + space
- Apply moves in reverse direction to get initial state to solve
- Implement random letter-pair/algorithm selection
- Finish implementing all the sticker letters
- Implement l, r, E, S
- Same for edges
- Implement mobile version: click to select random letter pair, click to show the solution
Solving mode:
- Implement timer
- Save best times
Code:
- Create own matrix classes

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
Code:
- Create own fps counter
