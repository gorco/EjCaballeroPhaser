import Knight from '../objetos/knight.js';
import Floor from '../objetos/floor.js';
import Box from '../objetos/box.js';
import Pool from '../objetos/pool.js';

/**
 * Escena principal de juego.
 * @extends Phaser.Scene
 */
export default class MainGame extends Phaser.Scene {
	
	constructor() {
		super({ key: 'maingame' });
	}
	
	preload(){
		this.load.image('castle', 'assets/castle.gif');
		this.load.spritesheet('knight', 'assets/Knight/knight.png', {frameWidth: 72, frameHeight: 86})
		this.load.spritesheet('box', 'assets/Box/box.png', {frameWidth: 64, frameHeight: 64})
	}
	
	init(){

		// Guardamos la referencia a los elementos del DOM (HTML) que nos interesen.
		this.maxBoxes = document.getElementById('targetBox');
		this.maxTime = document.getElementById('targetTime');
		this.poolMax = document.getElementById('poolMax');
		this.sBtwBoxes = document.getElementById('sBtwBoxes');
		this.reuseCheckbox = document.getElementById('reuseActive');

		// Tamaño inicial de la pool
		this.initPoolSize = 2;

		// Nuestra escena tendrá un time y un score
		this.score = 0;
		this.time = 0;

		// Tiempo pasado entre el spawn de la última caja
		this.lastBoxTime = 0;

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

		/**
	* Creación de los elementos de la escena principal de juego
	*/
	create() {
		//Imagen de fondo
		this.add.image(0, 0, 'castle').setOrigin(0, 0);
		
		//Instanciamos nuestro personaje, que es un caballero, y la plataforma invisible que hace de suelo
		let knight = new Knight(this, 50, 0);
		let floor = new Floor(this, 50);

		knight.body.onCollide = true; // Activamos onCollide para poder detectar la colisión del caballero con el suelo

		//Creamos una pool de cajas
		this.boxesPool = new Pool(this, this.poolMax, this.reuseCheckbox);	
		let boxes = []	
		for (let i = 0; i < this.initPoolSize; i++) {
			let box = new Box(this, 0, 0, this.boxesPool);
			boxes.push(box);
		}
		this.boxesPool.addMultipleEntity(boxes);
		
		// Decimos que cuerpos colisionan
		this.physics.add.collider(floor, this.boxesPool.getPhaserGroup()); // Suelo con cajas
		this.physics.add.collider(knight, this.boxesPool.getPhaserGroup()); // Caballero con cajas
		this.physics.add.collider(knight, floor); // Caballero con suelo
		
		/*
		 * Escuchamos los eventos de colisión en el mundo para poder actuar ante ellos
		 * En este caso queremos detectar cuando el caballero colisiona con el suelo para activar el salto del personaje
		 * El salto del caballero lo desactivamos en su "clase" (archivo knight.js) para evitar dobles saltos
		 * También comprobamos si está en contacto con alguna caja mientras ataca, en ese caso destruimos la caja
		 */
		this.physics.world.on('collide', (gameObject1, gameObject2, body1, body2) => {
			// Comprobamos si la colisión es del caballero con una caja (grupo boxes)
			if(gameObject1 === knight && this.boxesPool.getPhaserGroup().contains(gameObject2)){
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

	update(time, dt){
		this.time += dt;
		this.lastBoxTime += dt;

		if ( this.time > this.maxTime.value*1000 || this.score >= this.maxBoxes.value) { // Si pasan 30 segundos o se destruyen 5 cajas termina el juego
			this.scene.pause(this.scene.key); // paramos la escena actual para evitar su movimiento
			
			this.scene.launch('gameover',  					// lanzamos encima la escena 'gameover' (convivirá con la escena actual)
				{"time":this.time, "score":this.score})     // y pasamos en un objeto la información sobre puntuación y tiempo
		}

		if (this.lastBoxTime > this.sBtwBoxes.value){
			this.lastBoxTime = 0;
			this.boxesPool.spawn(Phaser.Math.Between(50, this.sys.game.canvas.width-100),20);
		}

	}

}
