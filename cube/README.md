Refresher on WebGL
https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html

### TODO

BLD practice mode:
- Implement random letter-pair/algorithm selection
- Implement mobile version: click to select random letter pair, click to show the solution
- Remove letter pair words for twists and flips
- Remove processed alg line
- Improve visuals?
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
Code:
- Create own fps counter
Bugs:
- AW: empty move
- SA or AN: issue when 2 letters without space (UD and variants). Add space in data processing  
- SA: algorithm not simplifiied
- AG (edge): 3 times the same move.
