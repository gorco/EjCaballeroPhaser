import Box from '../objetos/box.js';

export default class Pool {
	/**
	 * Pool de objetos. En este caso usaremos la pool para reutilizar las cajas del juego y tener un máximo.
	 * La pool nos evita, además, tener que hacer todo el rato new y destroy de los objetos. Nos evitamos perder
	 * tiempo de CPU en la creación de nuevos objetos, reservar memoria, y en su destrucción o liberación de memoria
	 * por el recolector de basura.
	 * @param {Scene} scene - escena en la que aparecen los elementos de la pool
	 * @param {Number} max - elemento html que define la cantidad máxima de la pool sobre la que no queremos que crezca más
	 * @param {Boolean} reuse - decimos si queremos reutilizar elementos de la pool que están vivos si no hay más remedio
	 */
	constructor (scene, max, reuse) {
		this._group = scene.add.group();		
		this.max = max;
		this.scene = scene;
		this.reuse = reuse;
	}
	
	/**
	 * Método para añadir nuevos objetos a la pool.
	 * Nos servirá para crear una pool inicial si no lo hemos hecho en el constructor.
	 * Todos los elementos añadidos los activamos como disponibles para reutilizar
	 * @param {Array} entities - array de objetos que añadir a la pool
	 */
	addMultipleEntity(entities) {
		this._group.addMultiple(entities);
		entities.forEach(c => {
			this._group.killAndHide(c);
			c.body.checkCollision.none = true;
		});
	}
	
	spawn (x, y, animationKey='none') {
		let entity = this._group.getFirstDead();
		
		/* 
			En caso de no tener entidades disponibles en la pool, hay que decidir que hacer
			Aquí podemos seguir varias estrategias, por ejemplo:
			 - aumentar el tamaño de la pool en una cantidad concreta 
			 - duplicar el tamaño
			 - reutilizar la entidad que más tiempo ha estado viva
		*/
		if(!entity){
			if (this._group.getLength() < this.max.value || this.max.value === 0) {
				let newEntities = [];
				let newMax = this.max.value < this._group.getLength()*2 ? this.max.value-this._group.getLength() : this._group.getLength()
				for(let i=0; i<newMax; i++){ //En este caso hemos elegido duplicar el tamaño
					entity = new Box(this.scene, x, y, this)
					newEntities.push(entity);
				}	
				this.addMultipleEntity(newEntities);
			} 
			 //Como hemos mencionado podemos querer reutilizar el elemento que más tiempo ha estado vivo si no tenemos otra opción
			else if (this.reuse.checked) { 
				entity = this._group.getFirstNth(1, true);
				this._group.remove(entity);
				this._group.add(entity);	
			}
			
		}
		

		// Cuando ya hemos conseguido la entidad de alguna forma la reutilizamos
		if (entity) {
			entity.x = x;
			entity.y = y;
			entity.play(animationKey)
			entity.setActive(true);
			entity.setVisible(true); 
			entity.body.checkCollision.none = false;
		} 
		console.log(entity)
		return entity;
	}
	
	/**
	 * Método para liberar una entidad
	 * @param {Object} entity - entidad de la pool que queremos marcar como libre
	 */
	release (entity) {
		entity.body.checkCollision.none = true;
		this._group.killAndHide(entity);
	}


	getPhaserGroup(){
		return this._group;
	}
}