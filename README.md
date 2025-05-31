# jQuery-sliding-puzzle

This library implements a sliding puzzle game where players need to slide tiles into an empty space to arrange them in the correct order or recreate an image.

## Installation

Import directly in html file.

``` html
<!-- HTML -->

<link href="path/jQuery-sliding-puzzle/sliding-puzzle.css" rel="stylesheet">
<script src="path/jQuery-sliding-puzzle/sliding-puzzle.js"></script>
```

## Usage

### Library settings

``` bash
# Edit default style
vi path/jQuery-sliding-puzzle/sliding-puzzle.css

# Edit default setting
vi path/jQuery-sliding-puzzle/sliding-puzzle.js
```

### How to use

``` html
<!-- HTML -->

<!-- Add data attribute "WKSP" to your game container -->
<div data-game="WKSP"></div>
```

``` javascript
<!-- JavaScript -->

// Initialize the sliding puzzle game
$('[data-game="WKSP"]').WKSlidingPuzzle();
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
