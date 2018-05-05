<template>
  <div id="app" style="user-select: none">
    <!-- Cotenido -->
    <!-- Contenido del complement actual -->
    <transition enter-active-class="animated fadeIn" :duration="{ enter: 500 }" >
      <router-view class="content" v-bind:style="{ top: 10 + app_Layout_marginTop + 'px' }"></router-view>
    </transition>
    <!-- Footer-->
    <div class="footer">
      <Row type="flex" justify="space-between">
        <!-- Contenedor Izquierdo -->
        <div class="footer-container">
          <Tag class="footer-item-tag noclicker" v-bind:style="{ backgroundColor: app_Layout_colorVersion}">
            {{require('./libs/settings.js').getDeployVersionApp() + ' ' + require('./libs/settings.js').getVersionApp()}}
          </Tag>
          <Tag class="footer-item-tag text" v-if="app_actualProfile !== ''">
            <h4 style="display: inline-block;">Usuario actual: {{app_actualProfile.username}}</h4>
          </Tag>
        </div>
        <!-- Contenedor Derecho -->
        <div class="footer-container">
          <Tag class="footer-item-tag text" v-if="app_actualProfile !== ''">
            <Icon type="link"/>
            Conectado a: {{ require('./libs/settings.js').getConnectionName() }}
          </Tag>
          
          <Poptip trigger="hover" title="Conexiones a BD" placement="top-end">
            <Tag class="footer-item-tag clicker" style="background-color: #1abc9c" @click="connectionsAssitantShow()">Conexiones</Tag>
            <div slot="content">
              <Row>
                <Button @click="connectionsModal = !connectionsModal" style="width: 100%; margin-bottom: 5px">Cambiar conexion actual</Button>
              </Row>
              <Row>
                <Button @click="connectionsAssitantShow()" style="width: 100%">Asistente de conexiones</Button>
              </Row>
            </div>
          </Poptip>
        </div>
      </Row>
    </div>
    <!-- Titlebar - Barra de titulo -->
    <div class="titlebar-shadow">
      <Row type="flex" justify="center">
        <i-col span="3"></i-col>
        <i-col span="18" style="-webkit-app-region: drag;">
          <label class="titlebar-title">Time
            <div class="titlebar-icon">
              .Squid
            </div>
          </label>
        </i-col>
        <i-col style="text-align: right; z-index: 999" span="3">
          <i-button v-if="app_Platform !== 'darwin'" style="z-index: 99" title="Minizar" type="text" icon="minus" size="small" @click="windowMinimize()"></i-button>
          <i-button v-if="app_Platform !== 'darwin'" style="z-index: 99" :title="app_Layout_windowState === 'maximized' ? 'Restaurar' : 'Maximizar'" type="text" :icon="app_Layout_windowState === 'maximized' ? 'arrow-shrink' : 'arrow-expand'" size="small" @click="app_Layout_windowState === 'maximized' ? windowRestore() : windowMaximize()"></i-button>
          <i-button v-if="app_Platform !== 'darwin'" style="z-index: 99" title="Cerrar" type="text" icon="close" size="small" @click="windowClose()"></i-button>
        </i-col>
      </Row>    
    </div>
    <Spin v-if="app_Layout_visibleLoadObject" fix>
      <div>
        <Icon v-if="app_Layout_visibleLoadType === 'normal'" class="spin-icon-load" type="ios-loop" size="40"/>
        <i-progress v-if="app_Layout_visibleLoadType === 'progress'" :percent="app_Layout_visibleLoadPercent" :status="app_Layout_visibleLoadStatus"></i-progress>
        <p v-if="app_Layout_visibleLoadStatus !== 'success'" class="spin-text-load">{{app_Layout_visibleLoadText}}</p>
        <i-button v-if="app_Layout_visibleLoadStatus === 'success'" @click="visibleLoadAction">{{visibleLoadActionText}}</i-button>
      </div>
    </Spin>
  </div>
</template>

<script>
  const settings = require('./libs/settings')
  export default {
    name: 'TimeSquid',
    data () {
      return {
        system_electronRemote: null,
        app_Platform: 'windows',
        app_Layout_colorVersion: '',
        app_Layout_marginTop: 20,
        app_actualProfile: '',
        app_Layout_windowState: 'normal',
        app_Layout_visibleLoadObject: true,
        app_Layout_visibleLoadType: 'normal',
        app_Layout_visibleLoadText: 'Un momento por favor',
        app_Layout_visibleLoadPercent: 0,
        app_Layout_visibleLoadStatus: 'active'
      }
    },
    created () {
      // Obtiene el Remote de la instancia de Electron
      this.system_electronRemote = require('electron').remote
      // Obtencion del maximo de una tabla dependiendo del tamaño de la app
      // this.system_electronRemote.getCurrentWindow().on('resize', () => {
      //   this.maxHeightTable = this.system_electronRemote.getCurrentWindow().getSize()[1] - 240
      //   this.actualWidthWindow = this.system_electronRemote.getCurrentWindow().getSize()[0]
      //   this.actualHeightWindow = this.system_electronRemote.getCurrentWindow().getSize()[1]
      // })
      // Cambiar el estado de la ventana para visualizar el cambio de controles de ventana
      this.system_electronRemote.getCurrentWindow().on('maximize', () => {
        this.app_Layout_windowState = 'maximized'
      })
      // Cambiar el estado de la ventana para visualizar el cambio de controles de ventana
      this.system_electronRemote.getCurrentWindow().on('unmaximize', () => {
        this.app_Layout_windowState = 'restored'
      })
      // Obtenemos el nombre de la plataforma desde donde se obtuvo
      this.appapp_Platform = process.platform
      // Se crea el archivo de configuracion general
      settings.createConfigContent()
      // Se elimina cualquier sesion que pueda existir
      settings.endSesion()
      // Obtenemos el numero de la version
      switch (settings.getDeployVersionApp()) {
        case 'ALPHA':
          this.app_Layout_colorVersion = '#ff7675'
          break
        case 'BETA':
          this.app_Layout_colorVersion = '#fab1a0'
          break
        case 'RELEASE CANDIDATE':
          this.app_Layout_colorVersion = '#ffeaa7'
          break
        case 'STABLE':
          this.app_Layout_colorVersion = '#55efc4'
          break
      }
      // Nos movemos al path del register
      this.changePath('/register-index')
    },
    methods: {
      windowMaximize () {
        this.system_electronRemote.getCurrentWindow().maximize()
      },
      windowRestore () {
        this.system_electronRemote.getCurrentWindow().unmaximize()
      },
      windowMinimize () {
        this.system_electronRemote.getCurrentWindow().minimize()
      },
      windowClose () {
        this.system_electronRemote.getCurrentWindow().close()
      },
      changePath (to, params = null) {
        this.$router.push({
          path: to,
          query: params
        })
        // for (let i = 0; i < this.routeIndexes.length; i++) {
        //   if (this.routeIndexes[i].name === this.$route.name) {
        //     this.activeName = this.routeIndexes[i].id
        //   }
        // }
      },
      handleSpinShow (message = 'Un momento por favor, esta operacion solo tardara unos minutos', type = 'normal', percent = 0) { // type ? normal : progress;;;; percent ? progreso del proceso
        this.app_Layout_visibleLoadObject = true
        this.app_Layout_visibleLoadType = type
        this.app_Layout_visibleLoadText = message
        this.app_Layout_visibleLoadPercent = percent
        this.app_Layout_visibleLoadStatus = 'active'
      },
      handleSpinProgressUpdate (percent, message = 'no-update', action = null, actionText = 'Listo!') {
        if (message !== 'no-update') {
          this.app_Layout_visibleLoadText = message
        }
        this.app_Layout_visibleLoadPercent = Number(percent).toFixed(0)
        this.visibleLoadActionText = actionText
        this.visibleLoadAction = action
        if (this.app_Layout_visibleLoadPercent >= 100) {
          this.app_Layout_visibleLoadStatus = 'success'
        }
      },
      handleSpinHide () {
        this.app_Layout_visibleLoadObject = false
      }
    }
  }
</script>

<style>
  @font-face {
    font-family: 'Poppins';
    src: url('./assets/fonts/Poppins-Regular.ttf');
  }
  @font-face {
    font-family: 'Gill Sans';
    src: url('./assets/fonts/GillSansStd.otf');
  }
  @font-face {
    font-family: 'Product Sans';
    src: url('./assets/fonts/Product Sans Regular.ttf');
  }
  #app {
    font-family: 'Poppins', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  /* Animacion de Loading */
  .spin-icon-load{
    animation: ani-load-spin 2s linear infinite;
  }
  .spin-text-load{
    animation: ani-load-text 1.5s linear infinite;
  }
  @keyframes ani-load-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
  }
  @keyframes ani-load-text {
    from { opacity: 1; }
    50% { opacity: 0.5; }
    to { opacity: 1; }
  }
/* Scrollbars */
  ::-webkit-scrollbar {
    background-color: rgba(255, 255, 255, 0);
    width: .2em;
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgb(143, 143, 143);
  }
  ::-webkit-scrollbar-corner {
    background-color: transparent;
  }
  ::-webkit-scrollbar-button {
    width: 0;
    height: 0;
    display: none;
  }
  /* Body */
  body {
    font-family: 'Poppins', sans-serif;
    width: 100%;
    height:100%;
    background-color: white;
    overflow-x: hidden;
    border-color: black;
    border-width: 1px;
  }
  .titlebar-title{
    font-weight: bold;
    opacity: 0.8;
    font-size: 15px;
    vertical-align: middle;
    font-family: 'Gill Sans', sans-serif;
  }
  .titlebar-icon{
    display: inline;
    padding-left: 7px;
    padding-top: 3px;
    padding-right: 5px;
    padding-bottom: 2px;
    vertical-align: middle;
    background-color: rgb(73, 80, 96);
    color: white;
    border-radius: 4px;
  }
  .titlebar{
    font-family: 'Gill Sans', sans-serif;
    position: fixed;
    padding-top: 4px;
    padding-bottom: 4px;
    text-align: center;
    width: 100%;
    top: 0px;
    z-index: 100;
    background-color: white;
  }
  .titlebar-shadow {
    -webkit-box-shadow: 0 4px 6px -6px #222;
    -moz-box-shadow: 0 4px 6px -6px #222;
    box-shadow: 0 4px 6px -6px #222;
    font-family: 'Gill Sans', sans-serif;
    position: fixed;
    padding-top: 4px;
    padding-bottom: 4px;
    text-align: center;
    width: 100%;
    top: 0px;
    z-index: 100;
    background-color: white;
  }
  .footer{
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: white;
    color: rgba(0, 0, 0, 0.43);
    -webkit-box-shadow: 0px -6px 4px -6px #949494;
    -moz-box-shadow: 0px -6px 4px -6px #949494;
    box-shadow: 0px -6px 4px -6px #949494;
    /* z-index: 999; */
    padding-bottom: 3px;
    padding-left: 3px;
  }
  .footer-container{
    display: inline-block;
  }
  .footer-item-tag{
    margin-top: 1px;
    margin-bottom: 0px;
    vertical-align: middle;
    font-weight: bold;
    font-size: 11px;
    text-transform: uppercase;
    border-radius: 6px;
  }
  .footer-item-tag.clicker{
    cursor: pointer;
    color: white!important;
  }
  .footer-item-tag.noclicker{
    cursor: not-allowed;
    background-color: #87898a;
    color: white;
  }
  .footer-item-tag.text{
    cursor: not-allowed;
    background-color: rgba(0, 0, 0, 0);
    border-color: rgba(0, 0, 0, 0);
  }
  .content {
    overflow-y: scroll;
    position: relative;
    height: 100%;
    width: 100%;
    top: 20px;
    bottom: 32px;
    overflow-x: hidden;
    background: transparent;
  }
  .layout-nav{
      display: block;
      margin: auto;
  }
  .layout-fixed{
    margin-top: 0px;
    margin-bottom: 0px;
    width: 100%;
    background-color: white;
    position: fixed;
    -webkit-box-shadow: 0 4px 6px -6px #222;
    -moz-box-shadow: 0 4px 6px -6px #222;
    box-shadow: 0 4px 6px -6px #222;
    z-index: 98;
  }
  .layout-buttons{
    float: right;
    position: relative;
    right: 0px;
  }
  .layout-return{
    float: left;
    position: relative;
    left: 0px;
  }
  .modal-contenedor--label{
      display: block;
      margin: 4%;
      text-align: center;
      color: rgba(41, 41, 41, 0.6);
  }
  .img-circle{
    border-radius: 80%;
    width: 100px;
    height: 100px;
    display: block;
    margin: 0 auto;
  }
  .button-center{
    margin-left: auto;
    margin-right: auto;
    display: block;
    margin-top: 5px;
  }
  .text-highlight{
    color: #a3a3a3;
    margin: 5px 0px;
    text-align: center;
  }
  .text-center-layout{
    text-align: center;
  }
  .text-right-layout{
    text-align: right;
  }
   hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid #ebe5e5;
    margin: 1em 0;
    padding: 0;
  }
</style>
