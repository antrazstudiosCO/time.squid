const Config = require('electron-config')
const config = new Config({
  encryptionKey: 'oiV32mVp5lOwYneFESjrWq2xFByNOvNj'
})
const sesion = new Config({
  name: 'sesion',
  encryptionKey: 'SLctEZS0NNqt4poRexN9ZdBvFJbUdlbf18r'
})
const fs = require('fs')

exports.getDocumentsExist = (_callback) => {
  let pathIndexDoc = config.path.replace('config.json', '') + 'packages-documentation/README.md'
  require('fs').access(pathIndexDoc, (err) => {
    if (!err) {
      _callback(true)
    } else {
      _callback(false)
    }
  })
}

exports.getDocumentsPath = () => {
  return config.path.replace('config.json', '')
}

exports.updateTempPath = () => {
  const fs = require('fs')
  const fsextra = require('fs-extra')
  fs.stat(config.path.replace('config.json', '') + 'temps', (err, stats) => {
    if (err) {
      console.log('fs.stat', err)
      fs.mkdirSync(config.path.replace('config.json', '') + 'temps')
    } else {
      fsextra.remove(config.path.replace('config.json', '') + 'temps', (err) => {
        if (err) {
          console.log('fs.unlink', err)
        } else {
          fs.mkdirSync(config.path.replace('config.json', '') + 'temps')
        }
      })
    }
  })
}

exports.getVersionApp = () => {
  return require('../../../package.json').version
}

exports.getDeployVersionApp = () => {
  return require('../../../package.json').deployVersion
}

exports.createSesion = (user, connectionName) => {
  sesion.set('user', user)
  sesion.set('connectionName', connectionName)
}

exports.endSesion = () => {
  let location = sesion.path // Ubicacion del archivo de sesion para el inicio de sesion
  if (location === undefined) {
    return {'message': 'La sesion se ha perdido, no ha sido posible terminarla'}
  } else {
    // Verificacion de la existencia del path
    if (fs.existsSync(location)) {
      fs.unlink(location, (err) => {
        if (err) {
          return {'message': 'Ha ocurrido un error al intentar eliminar la sesion'}
        }
      })
    } else {
      return {'message': 'No es posible terminar la sesion, no hay una sesion iniciada'}
    }
    return {'message': 'Sesion terminada'}
  }
}

exports.getSesionProfile = () => {
  let userfile = sesion.get('user')
  return require('./objects.js').createUserToken(userfile.id, userfile.identificacion, userfile.tipoidentificacion, userfile.primernombre, userfile.segundonombre, userfile.primerapellido, userfile.segundoapellido, userfile.username, userfile.cargo, userfile.fechanacimiento, userfile.imagenperfil, userfile.oficina, userfile.isactive, userfile.permissions, userfile.entidad, userfile.operador, userfile.config, userfile.gestor)
}

exports.getConnectionName = () => {
  return sesion.get('connectionName')
}

/**
 * Obtiene la ubicacion actual del archivo de configuracion cifrado
 */
exports.getPath = () => {
  return config.path
}

/**
 * Verifica y restaura el archivo de configuraciones cifrado
 */
exports.createConfigContent = () => {
  let verificacion = false // Variable de almacenamiento de las verificaciones
  let message = 'Na'
  // Verificacion de la existencia de la llave de version del APP
  verificacion = config.has('versionApp')
  // Creacion de la llave con el valor predeterminado en caso de que no exista la llave
  if (verificacion === false) {
    // se crea la llave versionApp junto con la version obtenida del archivo de la configuracion
    config.set('versionApp', require('electron').remote.app.getVersion())
    message = 'Se han insertado los siguientes datos en la configuracion del sistema:  \r\n ' + 'versionApp: ' + require('electron').remote.app.getVersion() + '\r\n'
  }
  // Verificacion de la existencia de la llave de conexion por defecto
  verificacion = config.has('defaultConn')
  if (verificacion === false) {
    // se crea la llave defaultConn con el contenido de conexion por defecto
    config.set('defaultConn', 0)
    message = message + 'Se han insertado los siguientes datos en la configuracion del sistema:  \r\n ' + 'defaultConn: 0' + '\r\n'
  }
  // verificacion de la existencia de la llave de la lista de conexiones
  verificacion = config.has('connections')
  if (verificacion === false) {
    config.set('connections', [{ 'id': 0, 'name': 'localhost', 'host': '127.0.0.1', 'port': 3306, 'database': 'billsdelivery_1', 'usd': 'root', 'pwd': 'gata1125' }])
    message = message + 'Se han insertado los siguientes datos en la configuracion del sistema:  \r\n ' + '*Conexion por defecto : localhost' + '\r\n'
  }
  return {'message': '*createConfigContent* Acciones realizadas: \r\n ' + message}
}

/**
 * Añade un valor a una llave, sean valores directos o colecciones
 * @param {string} key
 *  La llave a utilizarse para añadir un nuevo item en la configuracion
 * @param {object} value
 *  El valor a almacenarse en dicha llave, puede ser tambien un JSON
 */
exports.addContentToLocalKey = (key, value) => {
  config.set(key, value)
}

/**
 * Obtiene todo el contenido del archivo de configuraciones
 */
exports.getAllContent = () => {
  return config.store
}

/**
 * Obtiene un contenido en especifico de las llaves del archivo de configuracion local
 * @param {string} key
 *  La llave a utilizarse para encontrar el valor a obtenerse
 */
exports.getContentFromLocalKey = (key) => {
  return config.get(key)
}

/**
 * Creacion de una nueva conexion en el archivo de configuracion
 * @param {string} nameConn
 *  Nombre del perfil de conexion a la base de datos en MySQL
 * @param {string} hostConn
 *  Host o nombre del servidor de destino
 * @param {string} databaseConn
 *  Nombre de la base de datos a la cual se desea conectar
 * @param {string} usdConn
 *  Usuario con el cual desea realizar la conexion
 * @param {string} pwdConn
 *  Contraseña con la cual desea realizar la conexion
 * @param {int} portConn
 *  Puerto para establecer conexion con el servidor, por defecto tiene el puerto 3306 de MySQl definido
 */
exports.createConnectionLocalFile = (nameConn, hostConn, databaseConn, usdConn, pwdConn, portConn = 3306) => {
  // se obtienen todas las conexiones actualmente disponibles
  let connections = config.get('connections')
  // se recorren todas la coneixones actualmente disponible para evitar duplicados
  let i = 0
  for (i; i <= connections.length - 1; i++) {
    if (connections[i].name === nameConn) {
      return {'type': 'error', 'message': 'El nombre de perfil de conexion ya esta siendo utilizado'}
    }
    if (connections[i].host === hostConn && connections[i].database === databaseConn && connections[i].usd === usdConn && connections[i].pwd === pwdConn && connections[i].port === portConn) {
      return {'type': 'error', 'message': 'Ya existe una conexion con los parametros que usted especifico'}
    }
  }
  // luego de la verificacion procede a realizar el alamcenamiento de los datos
  connections.push({id: connections.length, name: nameConn, host: hostConn, database: databaseConn, port: portConn, usd: usdConn, pwd: pwdConn})
  this.addContentToLocalKey('connections', connections)
  return {'type': 'info', 'message': 'Se ha creado el item de conexion con exito'}
}

/**
 * Retorna el id de una conexion en archiv local, con el nombre de la misma
 * @param {string} name
 */
exports.getKeyConnectionbyName = (name) => {
  let connections = this.getContentFromLocalKey('connections')
  let i = 0
  for (i; i <= connections.length - 1; i++) {
    if (connections[i].name === name) {
      return connections[i].id
    }
  }
}

exports.getConnectionbyId = (id) => {
  let connections = this.getContentFromLocalKey('connections')
  let i = 0
  for (i; i <= connections.length - 1; i++) {
    if (connections[i].id === id) {
      return connections[i]
    }
  }
}

exports.editConnectionWithName = (name, connection) => {
  let connections = config.get('connections')
  let i = 0
  for (i; i <= connections.length - 1; i++) {
    if (connections[i].name === name) {
      connections[i].host = connection.host
      connections[i].port = connection.port
      connections[i].database = connection.database
      connections[i].usd = connection.usd
      connections[i].pwd = connection.pwd
      config.set('connections', connections)
      return {'type': 'info', 'message': 'Se ha modificado el item de conexion con exito'}
    }
  }
  return {'type': 'error', 'message': 'No ha sido posible modificar la conexion, no existe una conexion bajo el nombre de perfil: ' + name}
}

exports.removeConnectionWithName = (name) => {
  let connections = config.get('connections')
  let i = 0
  for (i; i <= connections.length - 1; i++) {
    if (connections[i].name === name) {
      require('./miscelanius.js').removeObjectinArray(connections, 'name', name)
    }
  }
  config.set('connections', connections)
  return {'type': 'info', 'message': 'Se ha modificado el item de conexion con exito'}
}
