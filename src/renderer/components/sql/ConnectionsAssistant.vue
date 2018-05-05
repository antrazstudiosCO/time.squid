<style scoped>
  .content{
    width: 100%;
    min-height: 100%;
    padding: 20px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: right;
    user-select: none;
  }
  .layout-text-item{
    margin: 8px 0px;
  }
  .form-text{
    text-align: center;
  }
  .form-object{
    margin-left: auto;
    margin-right: auto;
    display: block;
  }
</style>
<template>
  <div class="content">
    <Row style="margin: 0px 20px 10px 0px;">
      <i-col span="6">
        <i-button icon="arrow-left-c" type="text" @click="returnView()">Regresar</i-button>
      </i-col>
      <i-col span="12">
        <Input ref="searchInput" v-model="searchText" placeholder="Ingrese el dato a buscar">
          <span slot="prepend">Buscar: </span>
          <Tooltip slot="append" content="Ejecutar busqueda">
            <Button ref="searchButtonRun" icon="search" @click="searchClick()"></Button>
            <Button ref="searchButtonCancel" icon="close" @click="searchClick()" style="display: none"></Button>
          </Tooltip>
        </Input>
      </i-col>
      <i-col span="6">
        <Tooltip content="Añadir nueva conexion" style="float: right" placement="left">
          <i-button icon="plus-round" type="info" @click="createNew()"></i-button>
        </Tooltip>
      </i-col>
    </Row>
    <Row>
      <i-table border ref="connTable" stripe height="200" :columns="columnsConnectionsList" :data="connectionsList" size="small" :stripe="false"></i-table>
    </Row>
    <Row>
      <Card ref="connEditor" style="margin: 20px 0px; display: none" dis-hover>
        <div slot="title">
          <p style="display: inline-table">Formulario de Edicion: </p>
          <Tag type="border" style="display: inline-table">{{formType}}</Tag>
        </div>
        <div slot="extra" style="margin: 0">
          <i-button slot="extra" @click="saveClick()">Guardar</i-button>
          <i-button slot="extra" @click="cancelClick()">Cancelar</i-button>
        </div>
        <div>
          <Form class="form-object" ref="connectionEdit" :model="connectionEdit" :rules="ruleInline" :label-width="150">
            <FormItem prop="name" label="Nombre del perfil">
              <Input type="text" v-model="connectionEdit.name"></Input>
            </FormItem>
            <FormItem prop="host" label="Direccion del servidor">
              <Input type="text" v-model="connectionEdit.host"></Input>
            </FormItem>
            <FormItem prop="port" label="Numero del puerto">
              <Input type="text" v-model="connectionEdit.port"></Input>
            </FormItem>
            <FormItem prop="database" label="Nombre de la BD">
              <Input type="text" v-model="connectionEdit.database"></Input>
            </FormItem>
            <FormItem prop="usd" label="Usuario en BD">
              <Input type="text" v-model="connectionEdit.usd"></Input>
            </FormItem>
            <FormItem prop="pwd" label="Contraseña">
              <Input type="password" v-model="connectionEdit.pwd"></Input>
            </FormItem>
          </Form>
        </div>
      </Card>
    </Row>
  </div>
</template>
<script>
  export default {
    name: 'connectionsassistant',
    data () {
      return {
        // Lista de conexiones
        connectionsList: [],
        // Lista de Columnas para mostrar en la tabla
        columnsConnectionsList: [
          {
            title: 'Nombre del perfil',
            key: 'name'
          },
          {
            title: 'Servidor',
            key: 'host'
          },
          {
            title: 'Puerto',
            key: 'port'
          },
          {
            title: 'Nombre de base de datos',
            key: 'database'
          },
          {
            title: 'Usuario en BD',
            key: 'usd'
          },
          {
            title: 'Actions',
            key: 'actions',
            width: 150,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Tooltip', {
                  props: {
                    content: 'Editar',
                    placement: 'left'
                  }
                }, [
                  h('i-button', {
                    props: {
                      type: 'success',
                      size: 'small',
                      shape: 'circle'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.selectRow(params.row)
                      }
                    }
                  }, [
                    h('Icon', {
                      props: {
                        type: 'edit'
                      }
                    })
                  ])
                ]),
                h('Tooltip', {
                  props: {
                    content: 'Eliminar',
                    placement: 'bottom'
                  }
                }, [
                  h('i-button', {
                    props: {
                      type: 'error',
                      size: 'small',
                      shape: 'circle'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.removeClick(params.row.name)
                      }
                    }
                  }, [
                    h('Icon', {
                      props: {
                        type: 'close-round'
                      }
                    })
                  ])
                ]),
                h('Tooltip', {
                  props: {
                    content: 'Testear',
                    placement: 'bottom'
                  }
                }, [
                  h('i-button', {
                    props: {
                      type: 'info',
                      size: 'small',
                      shape: 'circle'
                    },
                    on: {
                      click: () => {
                        this.testClick(params.row)
                      }
                    }
                  }, [
                    h('Icon', {
                      props: {
                        type: 'play'
                      }
                    })
                  ])
                ])
              ])
            }
          }
        ],
        connectionEdit: {
          id: 0,
          name: '',
          host: '',
          port: '',
          database: '',
          usd: '',
          pwd: ''
        },
        formType: 'edicion',
        ruleInline: {
          name: [
            { required: true, message: 'Este campo es obligatorio', trigger: 'blur' },
            { type: 'string', min: 5, message: 'El nombre de perfil debe ser de 5 caractereres minimo', trigger: 'blur' }
          ],
          host: [
            { required: true, message: 'Este campo es obligatorio', trigger: 'blur' }
          ],
          port: [
            { required: true, message: 'Este campo es obligatorio', trigger: 'blur' }
          ],
          database: [
            { required: true, message: 'Este campo es obligatorio', trigger: 'blur' }
          ],
          usd: [
            { required: true, message: 'Este campo es obligatorio', trigger: 'blur' }
          ],
          pwd: [
            { required: true, message: 'Este campo es obligatorio', trigger: 'blur' }
          ]
        },
        searchText: '',
        searchState: false
      }
    },
    created: function () {
      this.loadConnections()
    },
    methods: {
      returnView () {
        this.$parent.returnPath()
      },
      loadConnections () {
        let settings = require('../../libs/settings.js')
        this.connectionsList = settings.getContentFromLocalKey('connections')
      },
      changeVisibilityEdition (show) {
        if (show === true) {
          this.$refs.connEditor.$el.style.display = ''
          this.$refs.connTable.$el.style.display = 'none'
        } else {
          this.$refs.connEditor.$el.style.display = 'none'
          this.$refs.connTable.$el.style.display = ''
        }
      },
      selectRow (row) {
        // Se des-serializa la matriz original y se almacena en la copia de edicion
        this.connectionEdit = require('jquery').extend({}, row)
        // Se cambia la accion del formulario
        this.formType = 'edicion'
        // Se cambia la visibilidad de los objetos tabla y editor
        this.changeVisibilityEdition(true)
      },
      saveClick () {
        this.$refs.connectionEdit.validate((valid) => {
          if (valid) {
            let rta = ''
            if (this.formType === 'nueva') {
              rta = require('../../libs/settings.js').createConnectionLocalFile(this.connectionEdit.name, this.connectionEdit.host, this.connectionEdit.database, this.connectionEdit.usd, this.connectionEdit.pwd, this.connectionEdit.port)
            } else if (this.formType === 'edicion') {
              rta = require('../../libs/settings.js').editConnectionWithName(this.connectionEdit.name, this.connectionEdit)
            }
            if (rta.type === 'error') {
              this.$Message.error({
                content: rta.message,
                duration: 6
              })
            } else {
              this.$Message.info({
                content: rta.message,
                duration: 6
              })
              this.cancelClick()
            }
          } else {
            this.$Modal.error({
              title: 'Error de Validacion',
              content: 'Aun existen campos obligatorios sin diligenciar'
            })
          }
        })
      },
      createNew () {
        // Se crea una nueva conexion para editar
        this.connectionEdit = {
          id: 0,
          name: '',
          host: '',
          port: '',
          database: '',
          usd: '',
          pwd: ''
        }
        // Se cambia la accion del formulario
        this.formType = 'nueva'
        // Se cambia la visibilidad de los objetos tabla y editor
        this.changeVisibilityEdition(true)
      },
      cancelClick () {
        this.connectionEdit = {
          id: 0,
          name: '',
          host: '',
          port: '',
          database: '',
          usd: '',
          pwd: ''
        }
        this.formType = 'none'
        // Se cambia la visibilidad de los objetos tabla y editor
        this.changeVisibilityEdition(false)
        // Reestablece los controles
        this.$refs.connectionEdit.resetFields()
        this.loadConnections()
        this.$parent.chargeConnections()
      },
      removeClick (name) {
        this.$Modal.confirm({
          title: 'Confirmacion',
          content: '¿Esta seguro de querer eliminar este item?',
          onText: 'Si, Eliminar',
          onOk: () => {
            require('../../libs/settings.js').removeConnectionWithName(name)
            this.loadConnections()
            this.$parent.chargeConnections()
          }
        })
      },
      testClick (connection) {
        this.$parent.handleSpinShow('Conectando con el servidor, verificando conexion')
        require('../../libs/storage.js').testConnection(connection.host, connection.port, connection.usd, connection.pwd, connection.database, (rta) => {
          if (rta === null) {
            this.$Notice.success({
              title: 'Resultado de prueba de Conexion',
              desc: 'Conexion Establecida, esta conexion puede ser utilizada'
            })
            this.$parent.handleSpinHide()
          } else {
            this.$Notice.error({
              title: 'Resultado de prueba de Conexion',
              desc: 'No ha sido posible establecer la conexion: \r\n ' + rta
            })
            this.$parent.handleSpinHide()
          }
        })
      },
      searchClick () {
        if (this.searchText !== '') {
          if (this.searchState === false) {
            this.connectionsList = require('../../libs/miscelanius.js').filterValueinArray(this.connectionsList, this.columnsConnectionsList, this.searchText)
            this.searchState = true
            this.$refs.searchButtonRun.$el.style.display = 'none'
            this.$refs.searchButtonCancel.$el.style.display = ''
            this.$refs.searchInput.disabled = true
          } else {
            this.loadConnections()
            this.searchState = false
            this.searchText = ''
            this.$refs.searchButtonRun.$el.style.display = ''
            this.$refs.searchButtonCancel.$el.style.display = 'none'
            this.$refs.searchInput.disabled = false
          }
        }
      },
      resetID () {
        for (let i = 0; i < this.connectionsList; i++) {
          // this.connectionsList[this.connectionsList.length - 1].id + 1
          this.connectionsList[i] = i + 1
        }
      }
    }
  }
</script>
