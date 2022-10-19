export default class Gameover extends Phaser.Scene {
	
	constructor() {
		super({ key: 'gameover' });
	}
	
	preload(){
		this.load.image('end', 'assets/GUI/gameover.png');
	}
	
	/**
	* Creación de los elementos de la escena principal de juego
	*/
	create() {
		console.log("me he creado", this.scene.key);

		var sprite = this.add.image(this.sys.game.canvas.width/2, this.sys.game.canvas.height/2, 'end')
		sprite.setInteractive(); // Hacemos el sprite interactivo para que lance eventos

		// Escuchamos los eventos del ratón cuando interactual con nuestro sprite de "Start"
	    sprite.on('pointerup', pointer => {
	    	this.scene.stop('maingame'); // Paramos la escena que habíamos dejado en pausa
			this.scene.start('title'); //Cambiamos a la escena de juego
	    });

	}
}