<template>
  <div class="content-style">
    <Row type="flex" align="middle">
      <i-col span="8">
        <img src="https://www.cootrasmarcta.com/wp-content/uploads/2017/09/LOGO-COOTRASMAR-SIN-SLOGAN-.png" style="width: 80%">
      </i-col>
      <i-col span="8">
        <label for="input1">Documento: </label>
        <Input ref="input1" size="large" v-model="form_numeroidentificacion" placeholder="Ingrese su numero de documento" v-on:on-keyup="keyMonitor"/>
      </i-col>
      <i-col span="8">
        <div style="text-align: center">
          <h1 class="h1time">{{form_time}}</h1>
          <h1 style="opacity: 0.5">JORNADA: {{form_jornada === 0 ? 'MAÑANA' : form_jornada === 1 ? 'TARDE' : 'ADICIONAL'}}</h1>
        </div>
      </i-col>
    </Row>
    <hr>
    <Row type="flex" justify="center" :gutter="16">
      <i-col span="12">
        <div style="text-align: center; margin-top: 20px">
          <img v-if="form_Personal !== null" class="image-personal" :src="form_Personal.foto">
          <!-- <img class="image-personal" :src="form_Personal.objOficina.objEmpresa.logo"> -->
        </div>
        <hr v-if="form_Personal !== null">
        <div v-if="form_Personal !== null" style="text-align: center; margin-bottom: 20px;">
          <h3>Detalles del Asociacio</h3>
        </div>
        <i-form v-if="form_Personal !== null">
          <FormItem label="Nombre del funcionario: ">
            <!-- <Input v-model="form_Personal.nombreCompleto" disabled/> -->
            <h2>{{form_Personal.nombreCompleto}}</h2>
          </FormItem>
          <FormItem label="Cargo del funcionario: ">
            <!-- <Input v-model="form_Personal.cargo" disabled/> -->
            <h2>{{form_Personal.cargo}}</h2>
          </FormItem>
          <FormItem label="Oficina: ">
            <!-- <Input v-model="form_Personal.objOficina.nombre" disabled/> -->
            <h2>{{form_Personal.objOficina.nombre}}</h2>
          </FormItem>
        </i-form>
      </i-col>
      <i-col span="12">
        <Card v-if="form_Personal !== null" style="margin-top: 20px; margin-right: 40px">
          <h1 class="h1accion">PRESIONE ENTER PARA GRABAR SU {{form_typeRecord}}</h1>
          <hr v-if="form_registroInfo !== null">
          <i-form v-if="form_registroInfo !== null ">
            <FormItem label="HORA ENTRADA REGISTRO ACTUAL:">
              <!-- <Input v-model="" disabled/> -->
              <h2>{{form_registroInfo.horallegada.toLocaleString()}}</h2>
            </FormItem>
          </i-form>
          <hr v-if="form_registrosdiarios !== undefined">
          <i-table v-if="form_registrosdiarios !== undefined" border :columns="form_registrosdiariosColumnas" :data="form_registrosdiarios" size="small" :stripe="false" ></i-table>
          <hr v-if="form_registrosdiarios !== undefined">
          <label v-if="form_registrosdiarios !== undefined" style="margin-left: 10px;">ACUMULADO PERMANENCIA: {{(form_permanenciaDiaria / 60).toFixed(0) + ' H ' + (form_permanenciaDiaria % 60) + 'M'}}</label>
        </Card>
      </i-col>
    </Row>   
  </div>
</template>
<script>
import fs from 'fs'
import path from 'path'
const sql = require('../../libs/sql')
const settings = require('../../libs/settings')
const mailer = require('../../libs/mailer')
export default {
  name: 'register-index',
  data () {
    return {
      form_numeroidentificacion: '',
      form_numIdUser: null,
      form_Personal: null,
      form_typeRecord: 'ENTRADA',
      form_jornada: 0,
      form_registroInfo: null,
      form_registrosdiarios: undefined,
      form_registrosdiariosColumnas: [
        {
          title: 'Hora entrada',
          render: (h, {row}) => {
            return h('label', {}, row.horallegada.toLocaleString())
          }
        },
        {
          title: 'Hora salida',
          render: (h, {row}) => {
            return h('label', {}, row.horasalida !== null ? row.horasalida.toLocaleString() : 'SIN SALIDA')
          }
        },
        {
          title: 'Permanencia',
          render: (h, {row}) => {
            return h('label', {}, (row.permanencia / 60).toFixed(0) + ' H ' + row.permanencia % 60 + 'M')
          }
        }
      ],
      form_permanenciaDiaria: 0,
      form_time: '',
      form_timeH: 0,
      form_timeM: 0,
      form_timeS: 0,
      form_maxTime: '',
      form_htmlmailContent: ''
    }
  },
  mounted () {
    // funciones de hora
    this.startTime()
    // funciones de datos
    let connection = sql.getActualConn()
    sql.createSesion('ROOT', 'Gata1125*', connection).then((respuesta) => {
      let actualConn = settings.getConnectionbyId(settings.getContentFromLocalKey('defaultConn'))
      settings.createSesion(respuesta.result, actualConn.name)
      this.form_numIdUser = respuesta.result.id
      this.$Message.info('Sesion iniciada correctamente')
      this.$parent.handleSpinHide()
      this.setFocus()
    }).catch((err) => {
      this.form_numIdUser = null
      this.$Modal.error({
        title: 'Ha ocurrido un error en tiempo de ejecucion',
        content: err
      })
    })
    // leer archivo de plantilla html
    this.form_htmlmailContent = fs.readFileSync(path.join(__static, '/laternoti-responsive.html'), 'utf8')
  },
  methods: {
    keyMonitor (event) {
      // prueba
      if (event.key === 'Enter') {
        if (this.form_Personal === null) {
          this.form_registrosdiarios = undefined
          sql.getPersonalInfo(this.form_numeroidentificacion, sql.getActualConn()).then((rta) => {
            if (rta.rtaType === 'ERROR') {
              this.$Message.error({
                content: 'FUNCIONARIO NO HA SIDO LOCALIZADO, REVISE EL NUMERO DE DOCUMENTO',
                duration: 8
              })
            } else {
              this.form_Personal = rta.result1
              if (rta.result2 === undefined) {
                this.form_typeRecord = 'ENTRADA'
              } else {
                this.form_typeRecord = 'SALIDA'
                this.form_registroInfo = rta.result2
              }
              // Obtener registros de la fecha actual
              let fechactual = new Date(Date.now())
              fechactual = fechactual.toLocaleDateString().split('/')
              let diaactual, mesactual, anoactual
              diaactual = parseInt(fechactual[0])
              mesactual = parseInt(fechactual[1])
              anoactual = parseInt(fechactual[2])
              if (diaactual < 10) {
                diaactual = '0' + diaactual.toString()
              }
              if (mesactual < 10) {
                mesactual = '0' + mesactual.toString()
              }
              sql.getRegistrosDiarios(this.form_numeroidentificacion, anoactual + '-' + mesactual + '-' + diaactual + ' 00:00:00', anoactual + '-' + mesactual + '-' + diaactual + ' 23:59:59', sql.getActualConn()).then((rta) => {
                if (rta.result['length']) {
                  if (rta.result.length !== 0) {
                    this.form_registrosdiarios = rta.result
                    this.form_registrosdiarios.forEach(element => {
                      this.form_permanenciaDiaria = this.form_permanenciaDiaria + element.permanencia
                    })
                  } else {
                    this.form_registrosdiarios = undefined
                  }
                } else {
                  this.form_registrosdiarios = undefined
                }
              }).catch((err) => {
                this.$Message.error('Ha ocurrido un error en tiempo de ejecucion: ' + err)
              })
              // obtener el tiempo maximo
              this.form_maxTime = this.form_jornada === 0 ? this.form_Personal.objOficina.objEmpresa.objConfig.maxtime0 : this.form_jornada === 1 ? this.form_Personal.objOficina.objEmpresa.objConfig.maxtime1 : this.form_Personal.objOficina.objEmpresa.objConfig.maxtime2
              this.form_maxTime = this.form_maxTime.split(':')
            }
            this.setFocus()
          })
        } else {
          if (this.form_typeRecord === 'ENTRADA') {
            sql.createRegistroInfo(this.form_numIdUser, this.form_numeroidentificacion, this.form_jornada, sql.getActualConn()).then((rta) => {
              // Verificacion si estan activados los emails
              if (this.form_Personal.objOficina.objEmpresa.objConfig.emailState === 1) {
                // verificar si es la primera vez que entra en la jornada actual
                let contador = 0
                if (this.form_registrosdiarios !== undefined) {
                  this.form_registrosdiarios.forEach(element => {
                    if (element.jornada === this.form_jornada) {
                      contador = contador + 1
                    }
                  })
                }
                if (contador === 0) {
                  // Verifica si esta retrasada
                  if (this.form_maxTime[0] <= this.form_timeH && this.form_maxTime[1] < this.form_timeM) {
                    this.$parent.handleSpinShow('Un momento por favor')
                    let htmlContent = this.form_htmlmailContent
                    console.log(htmlContent)
                    // reemplazamos valores
                    htmlContent = htmlContent.replace('[##EMPRESA:NAME##]', this.form_Personal.objOficina.objEmpresa.nombre)
                    htmlContent = htmlContent.replace('[##FUNCIONARIO:NOMBRE##]', this.form_Personal.nombreCompleto)
                    htmlContent = htmlContent.replace('[##JORNADA##]', this.form_jornada === 0 ? 'MAÑANA' : this.form_jornada === 1 ? 'TARDE' : 'ADICIONAL')
                    // mailer.sendMail('ingcarlosvasquez@outlook.com, antrazstudios@gmail.com', 'NOTIFICACION AUTOMATICA DE LLEGADA TARDE A: ' + this.form_Personal.objOficina.objEmpresa.nombre, htmlContent).then((info) => {
                    //   console.log('Mailer', info)
                    //   this.$parent.handleSpinHide()
                    //   this.restart()
                    //   this.$Message.success({
                    //     content: 'ENTRADA REGISTRADA EXITOSAMENTE!',
                    //     duration: 8
                    //   })
                    // }).catch((err) => {
                    //   this.$parent.handleSpinHide()
                    //   this.$Message.error({
                    //     content: 'ERROR EN TIEMPO DE EJECUCION: ' + err,
                    //     duration: 8
                    //   })
                    //   this.restart()
                    //   this.$Message.success({
                    //     content: 'ENTRADA REGISTRADA EXITOSAMENTE!',
                    //     duration: 8
                    //   })
                    // })
                    mailer.sendMail(this.form_Personal.correoelectronico.toLowerCase() + ', ' + this.form_Personal.objOficina.objEmpresa.objConfig.emailSend.toLowerCase(), 'NOTIFICACION AUTOMATICA DE LLEGADA TARDE A: ' + this.form_Personal.objOficina.objEmpresa.nombre, htmlContent).then((info) => {
                      console.log('Mailer', info)
                      this.$parent.handleSpinHide()
                      this.restart()
                      this.$Message.success({
                        content: 'ENTRADA REGISTRADA EXITOSAMENTE!',
                        duration: 8
                      })
                    }).catch((err) => {
                      this.$parent.handleSpinHide()
                      this.$Message.error({
                        content: 'ERROR EN TIEMPO DE EJECUCION: ' + err,
                        duration: 8
                      })
                      this.restart()
                      this.$Message.success({
                        content: 'ENTRADA REGISTRADA EXITOSAMENTE!',
                        duration: 8
                      })
                    })
                  }
                } else {
                  this.restart()
                  this.$Message.success({
                    content: 'ENTRADA REGISTRADA EXITOSAMENTE!',
                    duration: 8
                  })
                }
              } else {
                this.$Message.success({
                  content: 'ENTRADA REGISTRADA EXITOSAMENTE!',
                  duration: 8
                })
                this.restart()
              }
            }).catch((err) => {
              this.$Message.error('HA OCURRIDO UN ERROR VUELVA A INTENTARLO: ' + err)
              this.restart()
            })
          } else {
            sql.updateRegistroInfo(this.form_numIdUser, this.form_registroInfo.id, sql.getActualConn()).then((rta) => {
              this.$Message.success({
                content: 'SALIDA REGISTRADA EXITOSAMENTE!',
                duration: 8
              })
            }).catch((err) => {
              this.$Message.error('HA OCURRIDO UN ERROR VUELVA A INTENTARLO: ' + err)
            })
            this.restart()
          }
        }
      } else if (event.key === '-') {
        this.restart()
      }
    },
    startTime () {
      var today = new Date()
      this.form_timeH = today.getHours()
      this.form_timeM = today.getMinutes()
      this.form_timeS = today.getSeconds()
      this.form_timeM = this.checkTime(this.form_timeM)
      this.form_timeS = this.checkTime(this.form_timeS)
      this.form_time = this.form_timeH + ':' + this.form_timeM + ':' + this.form_timeS
      if (this.form_timeH > 12 && this.form_timeH < 18) {
        this.form_jornada = 1
      } else if (this.form_timeH < 13) {
        this.form_jornada = 0
      } else if (this.form_timeH > 17) {
        this.form_jornada = 2
      }
      setTimeout(this.startTime, 500)
    },
    checkTime (i) {
      if (i < 10) { i = '0' + i }
      return i
    },
    setFocus () {
      this.$refs['input1'].focus()
    },
    restart () {
      this.form_registrosdiarios = undefined
      this.form_numeroidentificacion = ''
      this.form_Personal = null
      this.form_typeRecord = 'ENTRADA'
      this.form_registroInfo = null
      this.form_permanenciaDiaria = 0
      this.form_maxTime = ''
      this.setFocus()
    }
  }
}
</script>
<style scoped>
  .content-style {
    margin-top: 0px;
    margin-left: 20px;
    margin-left: 20px;
  }
  .image-personal {
    border-radius: 50px;
    /* width: 30%; */
    height: 250px;
  }
  .h1time {
    font-size: 70px;
    opacity: 0.5;
  }
  .h1accion {
    font-size: 50px;
    color: #be355e;
  }
  .inputDocumento {
    font-size: 30px;
    width: 100%;
  }
  h2 {
    font-size: 30px;
    color: #498be2;
  }
</style>

