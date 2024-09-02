const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	backgroundColor: "#2d2d2d",
	parent: "game-container",
	physics: {
		default: "arcade",
		arcade: {
			debug: false,
		},
	},
	scene: {
		preload: preload,
		create: create,
		update: update,
	},
	scale: {
		mode: Phaser.Scale.RESIZE,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
};

const game = new Phaser.Game(config);

let cards, firstCard, secondCard;
let canFlip = true;
let pairsFound = 0;
let lives = 3;
let lifeText, victoryText;

const ORIGINAL_CARD_WIDTH = 168;
const ORIGINAL_CARD_HEIGHT = 243;

function preload() {
	console.log("Preloading assets...");
	this.load.image("background", "assets/background.jpg");
	this.load.image("card-back", "assets/card-back.png");

	// Load 52 card images
	for (let i = 1; i <= 52; i++) {
		this.load.image(`card-front-${i}`, `assets/card-front-${i}.png`);
	}

	// Load joker images
	this.load.image("joker-1", "assets/joker-1.png");
	this.load.image("joker-2", "assets/joker-2.png");

	// Load sounds (optional, uncomment if needed)
	// this.load.audio("correct", "assets/correct.mp3");
	// this.load.audio("incorrect", "assets/incorrect.mp3");
	// this.load.audio("victory", "assets/victory.mp3");
	// this.load.audio("defeat", "assets/defeat.mp3");
	// this.load.audio("bg-music", "assets/background-music.mp3");
}

function create() {
	console.log("Creating game scene...");
	this.add
		.image(config.width / 2, config.height / 2, "background")
		.setDisplaySize(config.width, config.height);

	// Initialize the cards group
	cards = this.physics.add.staticGroup();

	// Prepare the deck
	let cardValues = Phaser.Utils.Array.NumberArray(1, 52);
	Phaser.Utils.Array.Shuffle(cardValues);
	cardValues = cardValues.slice(0, 22);
	cardValues = cardValues.concat(cardValues);

	// Add four jokers
	cardValues.push("joker-1", "joker-1", "joker-2", "joker-2");
	Phaser.Utils.Array.Shuffle(cardValues);

	// Display lives
	lifeText = this.add.text(16, 16, `Lives: ${lives}`, {
		fontSize: "32px",
		fill: "#fff",
	});

	// Create the grid
	createGrid(this, cardValues);

	// Optionally, play background music
	// let bgMusic = this.sound.add("bg-music", { loop: true });
	// bgMusic.play();
}

function createGrid(scene, cardValues) {
	const gridCols = 8; // Number of columns
	const gridRows = 6; // Number of rows

	// Calculate available width and height for the grid cells
	const availableWidth = config.width / gridCols;
	const availableHeight = config.height / gridRows;

	// Determine the best scale factor to maintain aspect ratio
	const scaleX = availableWidth / ORIGINAL_CARD_WIDTH;
	const scaleY = availableHeight / ORIGINAL_CARD_HEIGHT;
	const scale = Math.min(scaleX, scaleY);

	// Calculate card size based on scale factor
	const cardWidth = ORIGINAL_CARD_WIDTH * scale;
	const cardHeight = ORIGINAL_CARD_HEIGHT * scale;

	let index = 0;
	for (let y = 0; y < gridRows; y++) {
		for (let x = 0; x < gridCols; x++) {
			if (index < cardValues.length) {
				createCard(
					scene,
					x * availableWidth + availableWidth / 2,
					y * availableHeight + availableHeight / 2,
					cardValues[index],
					scale
				);
				index++;
			}
		}
	}
}

function createCard(scene, x, y, value, scale) {
	let card = scene.add.image(x, y, "card-back").setInteractive();
	card.setScale(scale); // Scale the card to fit in the grid
	card.setData("value", value);
	card.setData("flipped", false);

	card.on("pointerup", function () {
		if (!canFlip || card.getData("flipped")) return;

		card.setTexture(
			value.startsWith("joker") ? value : `card-front-${value}`
		);
		card.setData("flipped", true);

		if (!firstCard) {
			firstCard = card;
		} else if (!secondCard) {
			secondCard = card;
			checkForMatch(scene);
		}
	});

	cards.add(card);
}

function checkForMatch(scene) {
	canFlip = false;

	setTimeout(() => {
		if (firstCard.getData("value") === secondCard.getData("value")) {
			if (firstCard.getData("value").startsWith("joker")) {
				lives--;
				scene.sound.play("incorrect"); // Uncomment if you have sound
				lifeText.setText(`Lives: ${lives}`);
				if (lives <= 0) {
					gameOver(scene, false);
					return;
				}
				// Remove jokers from the grid
				firstCard.destroy();
				secondCard.destroy();
			} else {
				pairsFound++;
				if (pairsFound === 22) {
					gameOver(scene, true);
					return;
				}
				firstCard.destroy(); // Remove matched pair
				secondCard.destroy(); // Remove matched pair
			}
		} else {
			scene.sound.play("incorrect"); // Uncomment if you have sound
			firstCard.setTexture("card-back");
			secondCard.setTexture("card-back");
			firstCard.setData("flipped", false);
			secondCard.setData("flipped", false);
		}
		firstCard = null;
		secondCard = null;
		canFlip = true;
	}, 1000);
}

function gameOver(scene, won) {
	canFlip = false;
	scene.sound.stopAll(); // Uncomment if you have sound
	let message = won ? "You Won!" : "Game Over";
	victoryText = scene.add.text(config.width / 2, config.height / 2, message, {
		fontSize: "64px",
		fill: "#fff",
	});
	victoryText.setOrigin(0.5);
}

function update() {
	// Game update logic (if any) goes here
}

// Handle window resize
window.addEventListener("resize", () => {
	game.scale.resize(window.innerWidth, window.innerHeight);
	game.scene.scenes.forEach((scene) => {
		createGrid(
			scene,
			Phaser.Utils.Array.NumberArray(1, 52)
				.slice(0, 22)
				.concat(Phaser.Utils.Array.NumberArray(1, 52).slice(0, 22))
				.concat(["joker-1", "joker-1", "joker-2", "joker-2"])
		);
	});
});
