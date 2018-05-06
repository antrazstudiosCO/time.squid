const moments = require('moment')

/**
 * Clase de almacenamiento logico de configuracion de empresa
 */
export class Config {
  /**
   * Constructor de la estructura logica
   * @param {number} id Numero de identificacion del registro en la tabla de la BD.
   * @param {string} emailSend Email al que seran enviadas las notificaciones de correo electronico.
   * @param {string} maxtime0 Tiempo maximo de llegada en la jornada 0
   * @param {string} maxtime1 Tiempo maximo de llegada en la jornada 1
   * @param {string} maxtime2 Tiempo maximo de llegada en la jornada 2.
   * @param {number} emailState Puede ser 0 o 1, define si se envian correos o no
   */
  constructor (id, emailSend, maxtime0, maxtime1, maxtime2, emailState) {
    this.id = id
    this.emailSend = emailSend
    this.maxtime0 = maxtime0
    this.maxtime1 = maxtime1
    this.maxtime2 = maxtime2
    this.emailState = emailState
  }
}

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
   * @param {Config} objConfig Objeto de tipo CONFIG para almacenar la configuracion de la empresa
   */
  constructor (id, numeroidentificacion, nombre, logo, objConfig) {
    this.id = id
    this.numeroidentificacion = numeroidentificacion
    this.nombre = nombre.toUpperCase()
    this.logo = 'data:image/png;base64, ' + logo.toString('base64').replace('data:image/png;base64 ', '')
    this.objConfig = objConfig
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
    this.nombreCompleto = this.nombres + ' ' + this.apellidos
    this.correoelectronico = correoelectronico.toUpperCase()
    this.cargo = cargo
    this.foto = 'data:image/png;base64, ' + foto.toString('base64').replace('data:image/png;base64 ', '')
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
    if (estadoreg === 1) {
      let moment1, moment2
      moment1 = moments(this.horallegada)
      moment2 = moments(this.horasalida)
      this.permanencia = moment2.diff(moment1, 'm')
    } else if (estadoreg === 0) {
      let moment1, moment2
      let fechactual = new Date(Date.now())
      let diaactual, mesactual, anoactual
      diaactual = fechactual.getDay() - 1
      mesactual = fechactual.getMonth() + 1
      anoactual = fechactual.getFullYear()
      if (diaactual < 10) {
        diaactual = '0' + diaactual.toString()
      }
      if (mesactual < 10) {
        mesactual = '0' + mesactual.toString()
      }
      moment1 = moments(this.horallegada)
      moment2 = moments(anoactual + '-' + mesactual + '-' + diaactual + ' ' + fechactual.toLocaleTimeString())
      this.permanencia = moment2.diff(moment1, 'm')
    }
  }
}

export class Usuario {
  /**
   * Constructor de la estructura logica.
   * @param {number} id Numero de identificacion del registro en la tabla de la BD.
   * @param {string} nombresapellidos Nombres y apellidos del dueño del usuario.
   * @param {string} identificacion Numero de identificacion del dueño del usuario.
   * @param {string} nickname Nickname de inicio de sesion.
   * @param {string} password Contraseña de inicio de sesion.
   */
  constructor (id, nombresapellidos, identificacion, nickname, password) {
    this.id = id
    this.nombresapellidos = nombresapellidos.toUpperCase()
    this.identificacion = identificacion
    this.nickname = nickname.toUpperCase()
    this.password = password
  }
}
