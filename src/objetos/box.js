export default class Box extends Phaser.GameObjects.Sprite {
	/**
	 * Constructor de Box, nuestras cajas destructibles
	 * @param {Scene} scene - escena en la que aparece
	 * @param {number} x - coordenada x
	 * @param {number} y - coordenada y
	 * @param {Pool} pool - object pool
	 */
	constructor(scene, x, y, pool) {
		super(scene, x, y, 'box');
		this.setScale(0.5,.5);
		this.scene.add.existing(this, true); //Añadimos la caja a la escena con 'true' para marcar que es un objeto estático, servirá de suelo

		this.pool = pool;
		this.destroyNow = false;

		/*
		 * Si la animación de la caja siendo destruida se completa 
		 * creamos una nueva caja y marcamos que la actual debe desaparecer
		 */
		this.on('animationcomplete', end => {
			if (this.anims.currentAnim.key === 'hit'){
				this.destroyNow = true;
			}
		})

		// Agregamos la caja a las físicas para que Phaser lo tenga en cuenta
		this.scene.physics.add.existing(this);

		// Decimos que la caja colisiona con los límites del mundo
		this.body.setCollideWorldBounds();
	}

	/**
	 * Bucle principal de la caja, comprobamos la velocidad para reducirla y setearla a 0 en ciertos umbrales
	 * Así no se movera de manera infinita cuando la golpeemos
	 * @param {number} t - Tiempo total
	 * @param {number} dt - Tiempo entre frames
	 */
	preUpdate(t, dt) {
		super.preUpdate(t, dt);
		
		if(this.body.velocity.x > 5){
			this.body.velocity.x -= 5;
		} else if(this.body.velocity.x < -5){
			this.body.velocity.x += 5;
		}

		if(this.body.velocity.x <= 5 && this.body.velocity.x > 0 || this.body.velocity.x >= -5 && this.body.velocity.x < 0){
			 this.body.velocity.x = 0;
		}

		if (this.destroyNow){
			this.scene.score++;
			this.body.velocity.x = 0;
			this.destroyNow = false;
			this.pool.release(this)
		}
	}

	/**
	 * Ejecutamos la animación de la caja siendo destruida
	 */
	destroyMe(){
		if (this.anims.currentAnim && this.anims.currentAnim.key !== 'hit'){
			this.play('hit');
		}
	}
}

