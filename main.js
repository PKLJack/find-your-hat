const prompt = require("prompt-sync")({ sigint: true });

const hat = "^";
const hole = "O";
const fieldCharacter = "░";
const pathCharacter = "*";

class Field {
  constructor(field) {
    this.field = field;
    this.playerRC = this._initPlayerRC(field);
  }

  static generateField(rows, columns, percentage) {
    function pickRandomRC(rows, columns) {
      // TODO: could be slow. Can add visited set here.
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * columns);
      return { r, c };
    }

    function checkMinRequirements(rows, columns, percentage) {
      if (!(0 <= percentage && percentage < 1)) {
        console.log("percentage must meet condition 0 <= percentage < 1");
        process.exit();
      }

      if (!(3 <= rows)) {
        console.log("Rows must be greater than 2");
        process.exit();
      }

      if (!(3 <= columns)) {
        console.log("Columns must be greater than 2");
        process.exit();
      }
    }

    checkMinRequirements(rows, columns, percentage);

    const field = Array.from({ length: rows }).map(() =>
      Array.from({ length: columns }).fill(fieldCharacter)
    );

    // Place holes
    let holes = Math.min(
      rows * columns * percentage, // user choice
      rows * columns - 2 // max holes
    ); //

    while (hole > 0) {
      const { r, c } = pickRandomRC(rows, columns);

      if (field[r][c] === hole) {
        continue;
      }

      field[r][c] = hole;
      holes--;
    }

    // Place hat
    while (true) {
      const { r, c } = pickRandomRC(rows, columns);

      if (field[r][c] === hole || field[r][c] === hat) {
        continue;
      }

      field[r][c] = hat;
      break;
    }

    return field;
  }

  _initPlayerRC(field) {
    for (let r = 0; r < field.length; r++) {
      for (let c = 0; c < field[r].length; c++) {
        if (field[r][c] === pathCharacter) {
          return { r, c };
        }
      }
    }
    throw new Error("No player found.");
  }

  _isHatFound(r, c) {
    return this.field[r][c] === hat;
  }

  _isInBounds(r, c) {
    return (
      0 <= r && r < this.field.length && 0 <= c && c < this.field[r].length
    );
  }

  _isInHole(r, c) {
    return this.field[r][c] === hole;
  }

  _getMove() {
    let move;
    const availableMoves = ["u", "d", "l", "r"];
    do {
      move = prompt("Which way? ");
      move = move.trim();
      move = move.toLowerCase();
    } while (!availableMoves.includes(move));

    console.assert(move.length === 1);

    return move;
  }

  _getNewRC(r, c, move) {
    switch (move) {
      case "u":
        return { r: r - 1, c };
      case "d":
        return { r: r + 1, c };
      case "l":
        return { r, c: c - 1 };
      case "r":
        return { r, c: c + 1 };
      default:
        throw new Error(`Unknown move: ${move}`);
    }
  }

  _handleOutOfBounds() {
    console.log("Out of Bounds.");
    process.exit();
  }

  _handleInHole() {
    console.log("Sorry, you fell into hole");
    process.exit();
  }

  _handleHatFound() {
    console.log("Congrats! You found your hat");
    process.exit();
  }

  print() {
    this.field.forEach((row) => {
      console.log(row.join(""));
    });
  }

  run() {
    this.print();

    while (true) {
      const move = this._getMove();
      const newPlayerRC = this._getNewRC(
        this.playerRC.r,
        this.playerRC.c,
        move
      );

      const { r, c } = newPlayerRC;

      if (!this._isInBounds(r, c)) {
        this._handleOutOfBounds();
      }

      if (this._isInHole(r, c)) {
        this._handleInHole();
      }

      if (this._isHatFound(r, c)) {
        this._handleHatFound();
      }

      // Update field character and player rc
      this.field[r][c] = pathCharacter;
      this.playerRC = newPlayerRC;

      this.print();
    }
  }
}

const myField = new Field([
  ["*", "░", "O"],
  ["░", "O", "░"],
  ["░", "^", "░"],
]);

// myField.run();

console.log(Field.generateField(3, 3, 0.99));
