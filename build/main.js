// Imports
import {
	C, canvas, width, height,
	limit, collides,
	props, ball, paddle, player, bot,
	keydown, init
} from './../dist/declaration';

// Updates
const update = () => {
	// Saves the current `y` position to `py`
	player.ratio.py = player.ratio.y;
	bot.ratio.py = bot.ratio.y;

	// Updates `x` and `y` positions
	player.ratio.y += player.ratio.speed*player.direction;
	bot.ratio.y += bot.ratio.dy;
	ball.ratio.x += ball.ratio.dx;
	ball.ratio.y += ball.ratio.dy;
	bot.move();

	// If the ball hits the floor or ceiling
	if (ball.y-ball.r <= 0 || ball.y+ball.r >= height) { ball.ratio.dy *= -1; }

	// If the ball gets out of screen
	if ((ball.x-ball.r < 0 || ball.x+ball.r > width) && !ball.lost) {
		// Determines whos the point goes to
		(ball.x-ball.r < 0 ? bot : player).points++;

		// Check if anyone has won yet
		if (bot.points > props.goal || player.points > props.goal) {
			props.winner = bot.points > player.points ? bot : player;
		}

		// Reset the ball
		ball.lost = true;
		ball.reset();
	}

	// If `ball` hits either left or right of the paddles
	if (collides(ball.x+ball.dx, ball.y)) {
		// Inverse the direction
		ball.ratio.dx *= -1;

		// Increase speed
		ball.ratio.dx += ball.ratio.increase*Math.sign(ball.ratio.dx);

		// Increase `dy` depending on the `y` velocity of the hitted paddle
		ball.ratio.dy += (ball.x < width/2 ? player : bot).dy*ball.ratio.traction;
	}

	// If the ball hits either top or bottom of the paddles
	if (collides(ball.x, ball.y+ball.dy)) {
		const hit = ball.x < width/2 ? player : bot;

		// Redirect the `y` to snap on top or bottom of the paddle
		ball.ratio.y = (ball.y < hit.y+paddle.h/2 ? hit.y-ball.r : hit.y+paddle.h+ball.r)/height;
		ball.ratio.dy *= -1;
	}

	// Limits values
	player.ratio.y = limit(player.ratio.y, paddle.min, paddle.max);
	bot.ratio.y = limit(bot.ratio.y, paddle.min, paddle.max);
	bot.ratio.dy = limit(bot.ratio.dy, -bot.ratio.terminal, bot.ratio.terminal)*bot.ratio.friction;
	ball.ratio.y = limit(ball.ratio.y, ball.r/height, (height-ball.r)/height);
};

// Draws
const draw = () => {
	C.clearRect(0, 0, width, height);

	// Draws the player's paddle
	C.beginPath();
	C.fillRect(player.x, player.y, paddle.w, paddle.h);

	// Draws the bot's paddle
	C.beginPath();
	C.fillRect(bot.x, bot.y, paddle.w, paddle.h);

	// Draws the divider
	C.strokeStyle = 'white';
	C.lineWidth = ball.r*2;
	for (let i = 0; i < 20; i++) {
		C.beginPath();
		C.moveTo(width/2, height/20*i+height/30);
		C.lineTo(width/2, height/20*(i+1)-height/30);
		C.stroke();
	}

	// Draws points
	C.font = Math.hypot(width, height)*0.05 + 'px \'Press Start 2P\'';
	C.beginPath();
	C.fillText(player.points, width*0.25, height/8);
	C.fillText(bot.points, width*0.75, height/8);

	// Writes winner
	if (props.winner) {
		const x = width*(props.winner.name === 'Player 1' ? 0.25 : 0.75);
		const font = 'px \'Press Start 2P\'';

		C.strokeStyle = 'black';
		C.font = Math.hypot(width, height)*0.025 + font;
		C.beginPath();
		C.strokeText(props.winner.name + ' Won!', x, height/2);
		C.fillText(props.winner.name + ' Won!', x, height/2);

		C.font = Math.hypot(width, height)*0.015 + font;
		C.beginPath();
		C.strokeText('Press Space to Restart', x, height*0.55);
		C.fillText('Press Space to Restart', x, height*0.55);
	} else {
		// Draws the ball
		C.strokeStyle = 'black';
		C.lineWidth = ball.r/2;
		C.beginPath();
		C.strokeRect(ball.x-ball.r, ball.y-ball.r, ball.r*2, ball.r*2);
		C.fillRect(ball.x-ball.r, ball.y-ball.r, ball.r*2, ball.r*2);
	}
};

// Game
const game = () => {
	requestAnimationFrame(game);
	draw();
	if (!props.winner) { update(); }
};

// Events
canvas.onmousemove = E => player.ratio.y = limit((E.y-paddle.h/2)/height, paddle.min, paddle.max);
onkeyup = () => player.direction = 0;
onkeydown = keydown;
onresize = init;
onload = () => {
	ball.reset();
	init();
	game();
};
