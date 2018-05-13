// Core variables
export const canvas = document.querySelector('canvas');
export const C = canvas.getContext('2d');
export let width = canvas.width;
export let height = canvas.height;

// Methods
export const limit = (n, min, max) => Math.min(Math.max(n, min), max);
const random = (min, max) => max ? Math.random()*(max-min)+min : Math.random()*(min*2)+-min;

// Objects
export const props = { goal: 10, winner: null };

export const ball = {
	get x() { return width*this.ratio.x; },
	get y() { return height*this.ratio.y; },
	get dx() { return width*this.ratio.dx; },
	get dy() { return height*this.ratio.dy; },
	get r() { return Math.min(width, height)*this.ratio.r; },
	reset() {
		this.ratio.x = this.ratio.y = 0.5;
		this.ratio.dx = random(this.ratio.max);
		this.ratio.dy = random(this.ratio.max);
		this.ratio.dx += this.ratio.dx < 0 ? -this.ratio.min : this.ratio.min;
		this.ratio.dy += this.ratio.dy < 0 ? -this.ratio.min : this.ratio.min;
	},
	ratio: {
		x: 0.5, y: 0.5,
		dx: null, dy: null,
		r: 0.01, increase: 0.0005,
		min: 0.0025, max: 0.005,
		traction: 0.0001
	}
};

export const paddle = {
	get x() { return width*this.ratio.x; },
	get w() { return width*this.ratio.w; },
	get h() { return height*this.ratio.h; },
	get min() { return this.ratio.limit; },
	get max() { return 1-this.ratio.limit-this.ratio.h; },
	ratio: {
		x: 0.05,
		w: 0.015, h: 0.1,
		limit: 0.05
	}
};

export const player = {
	get x() { return paddle.x; },
	get y() { return height*this.ratio.y; },
	get dy() { return this.y-height*this.ratio.py; },
	direction: 0, points: 0, name: 'Player 1',
	ratio: {
		y: (height-paddle.h)/2/height,
		py: (height-paddle.h)/2/height,
		speed: 0.025
	}
};

export const bot = {
	get x() { return width-paddle.x-paddle.w; },
	get y() { return height*this.ratio.y; },
	get dy() { return this.y-height*this.ratio.py; },
	points: 0, name: 'Player 2',
	ratio: {
		y: (height-paddle.h)/2/height,
		py: (height-paddle.h)/2/height,
		dy: 0, speed: 0.005, reaction: 0.05,
		friction: 0.75, change: 0.1,
		get terminal() { return player.ratio.speed+Math.abs(ball.dx)+Math.abs(ball.dy); }
	},

	move() {
		if (
			// If the ball is going away from `bot`, is on the other side, and a 10% chance
			ball.dx < 0 && ball.ratio.x < 0.5 && random(0, 100) > 90 ||

			// If the ball is about randomly halfway going towards `bot` and 25% chance
			(ball.ratio.x > (width/2+random(this.ratio.reaction)*width)/width || ball.dx > 0 && random(0, 100) > 75)
		) {

			// If `ball` is above `bot`
			if (ball.y < this.y) {
				this.ratio.dy -= this.ratio.speed;
			}

			// Else if `ball` is above `bot`
			else if (ball.y > this.y+paddle.h) {
				this.ratio.dy += this.ratio.speed;
			}

			// Else `ball` is in range with the `bot` y axis wise
			else {
				this.ratio.dy *= this.ratio.friction;
			}

			// Random speed/slow ups
			this.ratio.dy += this.ratio.dy*random(this.ratio.change);
		}

		// Else slow down `bot` speed
		else { this.ratio.dy *= this.ratio.friction; }
	}
};

// Functions
export const collides = (x, y) => {
	return (
		// `Player` collision
		x-ball.r < player.x+paddle.w && x+ball.r > player.x &&
		y-ball.r < player.y+paddle.h && y+ball.r > player.y
		||
		// `Bot` collison
		x-ball.r < bot.x+paddle.w && x+ball.r > bot.x &&
		y-ball.r < bot.y+paddle.h && y+ball.r > bot.y
	);
};

export const keydown = E => {
	if (E.code === 'Space') {
		player.points = bot.points = 0;
		props.winner = null;
		ball.reset();
	} else {
		player.direction =
			E.code === 'KeyW' || E.code === 'ArrowUp' ? -1 :
				E.code === 'KeyS' || E.code === 'ArrowDown' ? 1 :
					player.direction;
	}
};

export const init = () => {
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	({ width, height } = canvas);
	C.fillStyle = C.strokeStyle = 'white';
	C.textAlign = 'center';
	C.textBaseline = 'middle';
};
