import Knight from '../objetos/knight.js';
import Floor from '../objetos/floor.js';
import Box from '../objetos/box.js';

/**
 * Escena principal de juego.
 * @extends Phaser.Scene
 */
export default class Animation extends Phaser.Scene {
	
	constructor() {
		super({ key: 'maingame' });
	}
	
	preload(){
		this.load.image('castle', 'assets/castle.gif');
		this.load.spritesheet('knight', 'assets/Knight/knight.png', {frameWidth: 72, frameHeight: 86})
		this.load.spritesheet('box', 'assets/Box/box.png', {frameWidth: 64, frameHeight: 64})
	}
	
	/**
	* Creación de los elementos de la escena principal de juego
	*/
	create() {
		console.log("me he creado", this.scene.key);

		//Imagen de fondo
		this.add.image(0, 0, 'castle').setOrigin(0, 0);

		let boxes = this.physics.add.group();
		
		//Instanciamos nuestro personaje, que es un caballero, y la plataforma invisible que hace de suelo
		let knight = new Knight(this, 50, 0);
		let floor = new Floor(this, 50);
		let box1 = new Box(this, 200, 0, boxes);
		let box2 = new Box(this, 400, 0, boxes);

		knight.body.onCollide = true; // Activamos onCollide para poder detectar la colisión del caballero con el suelo

		let scene = this; // Nos guardamos una referencia a la escena para usarla en la función anidada que viene a continuación
		
		this.physics.add.collider(knight, floor, function(){
			if(scene.physics.world.overlap(knight, floor)) {
				knight.enableJump(); // Hemos tocado el suelo, permitimos volver a saltar
			}
		});

		// Decimos que cuerpos colisionan
		this.physics.add.collider(floor, boxes); // Suelo con cajas
		this.physics.add.collider(knight, boxes); // Caballero con cajas
		
		/*
		 * Escuchamos los eventos de colisión en el mundo para poder actuar ante ellos
		 * En este caso queremos detectar cuando el caballero colisiona con el suelo para activar el salto del personaje
		 * El salto del caballero lo desactivamos en su "clase" (archivo knight.js) para evitar dobles saltos
		 * También comprobamos si está en contacto con alguna caja mientras ataca, en ese caso destruimos la caja
		 */
		scene.physics.world.on('collide', function(gameObject1, gameObject2, body1, body2) {
			// Comprobamos si la colisión es del caballero con una caja (grupo boxes)
			if(gameObject1 === knight && boxes.contains(gameObject2)){
				if(gameObject1.isAttackInProcess()) {
					gameObject2.destroyMe()
				} 				
			}
		});	

		// Registramos que el motor nos avise si las cajas se solapan con el caballero
		// y le decimos la funcion que debe ejecutar si esto pasa
		// Esto sucede cuando nos movemos y atacamos a la vez
		this.physics.add.overlap(knight, boxes, (knight, box) => {
			if(knight.isAttackInProcess()) {
				box.destroyMe()
			} 				
		});
	}

	init(){

		// Guardamos la referencia a los elementos del DOM (HTML) que nos interesen.
		this.maxBoxes = document.getElementById('targetBox');
		this.maxTime = document.getElementById('targetTime');

		// Nuestra escena tendrá un time y un score
		this.score = 0;
		this.time = 0;

		// Creamos las animaciones de las cajas
		this.anims.create({
			key: 'none',
			frames: this.anims.generateFrameNumbers('box', {start:0, end:0}),
			frameRate: 5,
			repeat: -1
		});
		this.anims.create({
			key: 'hit',
			frames: this.anims.generateFrameNumbers('box', {start:1, end:4}),
			frameRate: 18,
			repeat: 0
		});	
	}

	update(time, dt){
		this.time += dt;
		if ( this.time > this.maxTime.value*1000 || this.score >= this.maxBoxes.value) { // Si pasan 30 segundos o se destruyen 5 cajas termina el juego
			this.scene.pause(this.scene.key); // paramos la escena actual para evitar su movimiento
			
			this.scene.launch('gameover',  					// lanzamos encima la escena 'gameover' (convivirá con la escena actual)
				{"time":this.time, "score":this.score})     // y pasamos en un objeto la información sobre puntuación y tiempo
		}

	}

}
