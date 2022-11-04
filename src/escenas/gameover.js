export default class Gameover extends Phaser.Scene {
	
	constructor() {
		super({ key: 'gameover' });
	}
	
	init(data){
		this.score = data.score;
		this.time = (data.time/1000).toFixed(2); // Cambiamos el tiempo de milisegundos a segundos con dos decimales
	}

	preload(){
		this.load.image('end', 'assets/GUI/gameover.png');
	}
	
	/**
	* Creación de los elementos de la escena principal de juego
	*/
	create() {

		var sprite = this.add.image(this.sys.game.canvas.width/2, 20, 'end').setOrigin(0.5,0)
		sprite.setInteractive(); // Hacemos el sprite interactivo para que lance eventos

		// Escuchamos los eventos del ratón cuando interactual con nuestro sprite de "Start"
	    sprite.on('pointerup', pointer => {
	    	this.scene.stop('maingame'); // Paramos la escena que habíamos dejado en pausa
			this.scene.start('title'); //Cambiamos a la escena de juego
	    });

	    // Mostramos el número de cajas destruidas mediante texto
	    let scoreText = this.add.text(0, this.sys.game.canvas.height/2+50,
	    	"Cajas destruidas: "+this.score);
	    scoreText.setFontSize(34);
	    scoreText.setStroke('#b30098', 3);
	    scoreText.x = this.sys.game.canvas.width/2 - scoreText.width/2;

	    // Mostramos el tiempo de juego mediante texto
	    let timeText = this.add.text(0, this.sys.game.canvas.height/2+100,
	    	"Tiempo total: "+this.time+" segundos");
	    timeText.setFontSize(34);
	    timeText.setStroke('#b30098', 3);
	    timeText.x = this.sys.game.canvas.width/2 - timeText.width/2;

	}
}