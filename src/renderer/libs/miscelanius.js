
// const q = require('q')

exports.removeObjectinArray = (arr, attr, value) => {
  var i = arr.length
  while (i--) {
    if (arr[i] && arr[i].hasOwnProperty(attr) && (arguments.length > 2 && arr[i][attr] === value)) {
      arr.splice(i, 1)
    }
  }
  return arr
}

exports.filterMethod = (obj, columns, value) => {
  return obj.filter((row) => {
    for (let i = 0; i < columns.length - 1; i++) {
      if (String(row[columns[i].key]).toLowerCase().indexOf(value.toLowerCase()) !== -1) {
        return true
      }
    }
  })
}

// Verifica el tipo de dato de una cadena String y la regresa en su tipo Original
// recibe en type: numeric, double, string, string-numeric, string-special, date
exports.verifiedType = (type, value, format = null) => {
  let result = 'ERROR'
  let permitidosNumeric = '1234567890'
  let permitidosDate = '1234567890' + '/'
  let permitidosStringUPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let permitidosSpecial = '-+[](){}'
  switch (type) {
    case 'numeric':
      const valuesPermitidosN = this._verifiedValuesPermitidos(permitidosNumeric, value, 'number')
      if (valuesPermitidosN === false) {
        return result
      }
      result = parseInt(value)
      break
    case 'date':
      const valuesPermitidosD = this._verifiedValuesPermitidos(permitidosDate, value, 'date')
      if (valuesPermitidosD === false) {
        return result
      }
      let tempDate = this.convertStringToDate(value, format)
      if (tempDate === 'ERROR') {
        return tempDate
      } else {
        result = tempDate
      }
      break
    case 'string-numeric':
      const valuesPermitidosSN = this._verifiedValuesPermitidos(permitidosStringUPPER + permitidosNumeric, value, 'string')
      if (valuesPermitidosSN === false) {
        return result
      }
      result = value
      break
    case 'string-special':
      const valuesPermitidosSS = this._verifiedValuesPermitidos(permitidosNumeric + permitidosSpecial, value, 'string')
      if (valuesPermitidosSS === false) {
        return result
      }
      result = value
      break
    default:
      break
  }
  return result
}

exports._verifiedValuesPermitidos = (permitidos, value, typeadditional = null) => {
  // verificamos el tipo de valor recepcionado
  if (this._getType(value) === 'string') { // en caso de ser string
    let splitValue = [] // creamos un split del value recepcionado, para eliminar valores vacios
    for (var i = 0; i < value.length; i++) { // recorremos caracter por caracter el string
      let tempValue = value.charAt(i).toString() // descomponemos el string
      if (tempValue.charCodeAt(0) !== 13) { // verificamos que no este vacio el char actual
        splitValue.push(tempValue) // si no esta vacio se agrega al nuevo arreglo
      }
    }
    // Recorremos el nuevo array generado limpio
    for (let i = 0; i < splitValue.length; i++) {
      let coincidencia = 0 // bandera de coincidencias
      for (let j = 0; j < permitidos.split('').length; j++) { // recorremos los valores permitidos
        if (splitValue[i] === permitidos.split('')[j]) { // comparamos que el char actual del array generado este entre los permitidos
          coincidencia = 1 // definimos que existe coincidencia
        }
      }
      // al teminar el recorrido de los array, verificamos si no existio coincidencia para retornar false
      if (coincidencia === 0) {
        return false
      }
    }
  } else {
    if (this._getType(value) === typeadditional) { // en caso que no sea string, verificamos coincidencia del formato requerido frente al real
      return true
    } else {
      return false
    }
  }
  return true
}

exports._getType = (obj) => {
  // var type
  // faster than if/else
  return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase()
}

exports.convertDateToStringStorage = (val) => {
  let dateWork = new Date(val)
  return dateWork.toLocaleDateString() + ' ' + dateWork.toLocaleTimeString()
}

exports.convertStringToDate = (value, format) => {
  let dateSplit
  let result
  switch (format) {
    case 'dd/mm/aaaa':
      dateSplit = value.split('/')
      result = new Date(parseInt(dateSplit[2]), parseInt(dateSplit[1]) - 1, parseInt(dateSplit[0]), 12, 0, 0, 0)
      break
    default:
      result = 'ERROR DE CONVERSION, FORMATO NO RECONOCIDO'
      break
  }
  return result
}

exports.convertDateToStringSQL = (val) => {
  let dateWork = new Date(val)
  let dateMatriz = dateWork.toLocaleDateString().split('/')
  return dateMatriz[2] + '-' + dateMatriz[1] + '-' + dateMatriz[0]
}

exports.convertBase64ToBLOB = (val, contentType) => {
  var byteCharacters = atob(val)
  var byteNumbers = new Array(byteCharacters.length)
  for (var i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  var byteArray = new Uint8Array(byteNumbers)
  var blob = new Blob([byteArray], {type: contentType})
  return blob
}
