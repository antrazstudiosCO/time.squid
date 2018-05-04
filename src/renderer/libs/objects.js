/**
 * Clase de almacenamiento logico de los datos de la empresa.
 */
export class Empresa {
  /**
   * Constructor de la estructura logica.
   * @param {number} id Numero de identificacion del registro en la tabla de la BD.
   * @param {string} numeroidentificacion Numero de NIT con codigo de verificacion de la empresa.
   * @param {string} nombre Nombre de la empresa en cuestion.
   * @param {object} logo Objeto tipo BLOB que representa el logotipo de la entidad se convierte en una imagen base64-png.
   */
  constructor (id, numeroidentificacion, nombre, logo) {
    this.id = id
    this.numeroidentificacion = numeroidentificacion
    this.nombre = nombre.toUpperCase()
    this.logo = logo
  }
}

/**
 * Clase de almacenamiento logico de los datos de la oficina.
 */
export class Oficina {
  /**
   * Constructor de la estructura logica.
   * @param {number} id Numero de identificacion del registro en la ttabla de la BD.
   * @param {string} nombre Nombre de la oficina.
   * @param {number} jefedirecto Numero de identificacion del responsable de la oficina o jefe directo.
   * @param {Empresa} objEmpresa Objeto de tipo empresa que contiene la informacion de la misma.
   */
  constructor (id, nombre, jefedirecto, objEmpresa) {
    this.id = id
    this.nombre = nombre.toUpperCase()
    this.jefedirecto = jefedirecto
    this.objEmpresa = objEmpresa
  }
}

/**
 * Clase de almacenamiento logico de los datos del personal.
 */
export class Personal {
  /**
   * Constructor de la estructura logica.
   * @param {number} id Numero de identificacion del registro en la tabla de la BD.
   * @param {string} numeroidentificacion Numero de identificacion del usuario de personal.
   * @param {string} apellidos Apellidos del usuario personal.
   * @param {string} nombres Nombres del usuario personal.
   * @param {string} correoelectronico Direccion de correo electronico para el envio de notificaciones.
   * @param {string} cargo Define el cargo del usuario
   * @param {object} foto Objeto de tipo BLOB se convierte en base64-png para visualizar imagen del usuario personal.
   * @param {Oficina} objOficina Objetop de tipo oficina donde se almacena informacion de la misma.
   */
  constructor (id, numeroidentificacion, apellidos, nombres, correoelectronico, cargo, foto, objOficina) {
    this.id = id
    this.numeroidentificacion = numeroidentificacion
    this.apellidos = apellidos.toUpperCase()
    this.nombres = nombres.toUpperCase()
    this.correoelectronico = correoelectronico.toUpperCase()
    this.cargo = cargo
    this.foto = foto
    this.objOficina = objOficina
  }
}

/**
 * Clase de almacenamiento logico de los datos del personal.
 */
export class RegistroAsistencia {
  /**
   * Constructor de la estructura logica.
   * @param {number} id Numero de identificacion del registro en la tabla de la BD.
   * @param {number} jornada Binario que define en que jornada se esta realizando el registro siendo: '0' Mañana, '1' Tarde.
   * @param {Date} horallegada Define la hora de llegada de la jornada del asociado.
   * @param {Date} horasalida Define la hora de la salida de la jornada del asociado.
   * @param {number} estadoreg Binario que define si el registro esta cerrado o abierto.
   * @param {Personal} objPersonal Objeto de tipo Personal que almacena informacion del mismo.
   */
  constructor (id, jornada, horallegada, horasalida, estadoreg, objPersonal) {
    this.id = id
    this.jornada = jornada
    this.horallegada = horallegada
    this.horasalida = horasalida
    this.estadoreg = estadoreg
    this.objPersonal = objPersonal
  }
}
