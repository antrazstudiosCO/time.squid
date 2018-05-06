
const sql = require('mysql')
const q = require('q')
const objects = require('./objects')

export function testConnection (hostVar, portVar, userVar, passVar, databaseVar, _callback) {
  let mysql = require('mysql')
  let mysqlConnection = mysql.createConnection({
    port: portVar,
    host: hostVar,
    user: userVar,
    password: passVar,
    database: databaseVar
  })
  mysqlConnection.connect((err) => {
    if (err === null) {
      mysqlConnection.end(() => {
        _callback(null)
      })
    } else {
      return _callback(err)
    }
  })
}

export function getActualConn () {
  let settings = require('./settings.js')
  let connObj = settings.getConnectionbyId(settings.getContentFromLocalKey('defaultConn'))
  return sql.createConnection({
    port: connObj.port,
    host: connObj.host,
    user: connObj.usd,
    password: connObj.pwd,
    database: connObj.database
  })
}

export function _runQuery (configuracion, connection) {
  // --------------------------| Description |--------------------------
  // Description: Corre un query que puede o no regresar una serie de datos
  // Parameters:
  // * configuracion. query = Es el query que se correra en el servidor
  // * configuracion. parameters = aqui se especifica los parametros de un procedimiento almacenado
  // * configuracion. useActualConn = Define si se utiliza la conexion actual del sistema o si utiliza otra, por defecto esta propiedad esta establecida en true
  // * configuracion. alterConn = Define una conexion alternativa en caso de definir la propiedad useActualConn en false
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  // Se ejecuta el respectivo query con la consulta, y retorna el valor de la misma
  if (configuracion['parameters']) {
    connection.query(configuracion.query, configuracion.parameters, (err, results, fields) => {
      if (err !== null && err !== '') {
        deferred.reject('Ha ocurrido un error al ejecutar la consulta o el procedimiento en el servidor: ' + connection.host + ' => ' + err)
      } else {
        deferred.resolve({
          message: 'Operacion ejecuta con exito en el servidor',
          result: results,
          field: fields
        })
      }
    })
  } else {
    connection.query(configuracion.query, (err, results, fields) => {
      if (err !== null && err !== '') {
        deferred.reject('Ha ocurrido un error al ejecutar la consulta o el procedimiento en el servidor: ' + connection.host + ' => ' + err)
      } else {
        deferred.resolve({
          message: 'Operacion ejecuta con exito en el servidor',
          result: results,
          field: fields
        })
      }
    })
  }
  if (connection === null) {
    // Finalizamos la conexion actual con el servidor
    connection.end()
  }
  // Regresa como respuesta una promesa
  return deferred.promise
}

export function createSesion (nickname, password, connection) {
  let data = {}
  let deferred = q.defer()
  this._runQuery({ query: 'call loginUser(?, ?)', parameters: [nickname, password] }, connection).then((rta) => {
    if (rta.result[0][0].result === 1) {
      data.rtaType = 'OK'
      data.rtaContent = 'Sesion iniciada'
      data.result = new objects.Usuario(rta.result[1][0].idtb_usuarios, rta.result[1][0].tb_usuarios_nombresapellidos, rta.result[1][0].tb_usuarios_identificacion, rta.result[1][0].tb_usuarios_nickname, rta.result[1][0].tb_usuarios_password)
    } else {
      data.rtaType = 'ERROR'
      data.rtaContent = 'Usuario no localizado'
      data.result = {}
    }
    deferred.resolve(data)
  }).catch((err) => {
    deferred.reject(err)
  })
  return deferred.promise
}

export function getPersonalInfo (numIdentificacion, connection) {
  let data = {}
  let deferred = q.defer()
  this._runQuery({ query: 'call getPersonalinfo(?)', parameters: [numIdentificacion] }, connection).then((rta) => {
    if (rta.result[0].length !== 0) {
      // creacion de objetos
      let config = new objects.Config(rta.result[0][0].idtb_config, rta.result[0][0].tb_config_emailsend, rta.result[0][0].tb_config_maxtime0, rta.result[0][0].tb_config_maxtime1, rta.result[0][0].tb_config_maxtime2, rta.result[0][0].tb_config_emailstate)
      let empresa = new objects.Empresa(rta.result[0][0].idtb_empresa, rta.result[0][0].tb_empresa_nit, rta.result[0][0].tb_empresa_nombre, rta.result[0][0].tb_empresa_logo, config)
      let oficina = new objects.Oficina(rta.result[0][0].idtb_oficinas, rta.result[0][0].tb_oficinas_nombre, rta.result[0][0].tb_oficinas_jefedirecto, empresa)
      let persona = new objects.Personal(rta.result[0][0].idtb_personal, rta.result[0][0].tb_personal_numeroidentificacion, rta.result[0][0].tb_personal_apellidos, rta.result[0][0].tb_personal_nombres, rta.result[0][0].tb_personal_correoelectronico, rta.result[0][0].tb_personal_cargo, rta.result[0][0].tb_personal_foto, oficina)
      data.rtaType = 'OK'
      data.rtaContent = 'Funcionario localizado'
      data.result1 = persona
      if (rta.result[1][0] !== undefined) {
        data.result2 = new objects.RegistroAsistencia(rta.result[1][0].idtb_registroasistencia, rta.result[1][0].tb_registroasistencia_jornada, rta.result[1][0].tb_registroasistencia_horallegada, rta.result[1][0].tb_registroasistencia_horasalida, rta.result[1][0].tb_registroasistencia_estadoreg, data.result1)
      } else {
        data.result2 = undefined
      }
    } else {
      data.rtaType = 'ERROR'
      data.rtaContent = 'El funcionario que esta consultando no existe'
      data.result1 = {}
    }
    deferred.resolve(data)
  }).catch((err) => {
    console.log(err)
    deferred.reject(err)
  })
  return deferred.promise
}

export function createRegistroInfo (numIdUser, numIdentificacion, jornada, connection) {
  let data = {}
  let deferred = q.defer()
  this._runQuery({ query: 'call createRegistroinfo(?, ?, ?)', parameters: [numIdUser, numIdentificacion, jornada] }, connection).then((rta) => {
    data.rtaType = 'OK'
    data.rtaContent = 'Registro creado'
    deferred.resolve(data)
  }).catch((err) => {
    console.log(err)
    deferred.reject(err)
  })
  return deferred.promise
}

export function updateRegistroInfo (numIdUser, numIdRegistro, connection) {
  let data = {}
  let deferred = q.defer()
  this._runQuery({ query: 'call updateRegistroinfo(?, ?)', parameters: [numIdUser, numIdRegistro] }, connection).then((rta) => {
    data.rtaType = 'OK'
    data.rtaContent = 'Registro creado'
    deferred.resolve(data)
  }).catch((err) => {
    console.log(err)
    deferred.reject(err)
  })
  return deferred.promise
}

export function getRegistrosDiarios (numIdentificacion, fechainicial, fechafinal, connection) {
  let data = {}
  let deferred = q.defer()
  this._runQuery({ query: 'call getDailyEntryRegistroInfo(?, ?, ?)', parameters: [numIdentificacion, fechainicial, fechafinal] }, connection).then((rta) => {
    if (rta.result[0].length !== 0) {
      data.rtaType = 'OK'
      data.rtaContent = 'Funcionario localizado'
      data.result = []
      for (let i = 0; i < rta.result[0].length; i++) {
        const element = rta.result[0][i]
        data.result.push(new objects.RegistroAsistencia(element.idtb_registroasistencia, element.tb_registroasistencia_jornada, element.tb_registroasistencia_horallegada, element.tb_registroasistencia_horasalida, element.tb_registroasistencia_estadoreg, data.result1))
      }
    } else {
      data.rtaType = 'ERROR'
      data.rtaContent = 'El funcionario que esta consultando no existe'
      data.result = {}
    }
    deferred.resolve(data)
  }).catch((err) => {
    console.log(err)
    deferred.reject(err)
  })
  return deferred.promise
}
