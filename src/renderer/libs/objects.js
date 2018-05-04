/**
 * Clase de almacenamiento logico de los datos de la empresa
 */
export class Empresa {
  /**
   * Constructor de la estructura logica
   * @param {number} id Numero de identificacion del registro en la tabla de la BD
   * @param {string} numeroidentificacion Numero de NIT con codigo de verificacion de la empresa
   * @param {string} nombre Nombre de la empresa en cuestion
   * @param {object} logo Objeto tipo BLOB que representa el logotipo de la entidad se convierte en una imagen base64-png
   */
  constructor (id, numeroidentificacion, nombre, logo) {
    this.id = id
    this.numeroidentificacion = numeroidentificacion
    this.nombre = nombre.toUpperCase()
    this.logo = logo
  }
}

/**
 * Clase de almacenamiento logico de los datos de la oficina
 */
export class Oficina {
  /**
   * Constructor de la estructura logica
   * @param {number} id Numero de identificacion del registro en la ttabla de la BD
   * @param {string} nombre Nombre de la oficina
   * @param {number} jefedirecto Numero de identificacion del responsable de la oficina o jefe directo
   * @param {Empresa} objEmpresa Objeto de tipo empresa que contiene la informacion de la misma
   */
  constructor (id, nombre, jefedirecto, objEmpresa) {
    this.id = id
    this.nombre = nombre.toUpperCase()
    this.jefedirecto = jefedirecto
    this.objEmpresa = objEmpresa
  }
}
