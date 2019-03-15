setConfig()

let defaults = new Object();
defaults.URI = window.localStorage.getItem('URI')
defaults.interval = window.localStorage.getItem('interval')

let URL_descartada = '';
let parar = null;
let loop = null;
let interrupt = 0; // to not start loopPhoto twice
let firstPic = 0;  // just the first shot will alert of failure
let cameraCountDown = null;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  document.getElementById("restoreD").addEventListener("click", changeDefaults);
}

function salvarUsername() {
  if(document.getElementById('user').value != '' || document.getElementById('user').value != null) {
    localStorage.setItem('userValue', document.getElementById('user').value)
  }
}

function setConfig() {
  if (localStorage.getItem('URI') == null) { 
    localStorage.setItem('URI', 'http://10.0.0.2:80/a/index.php') 
  } else {}
  if (localStorage.getItem('interval') == null) {
    localStorage.setItem('interval', '30000')
  }
  if (localStorage.getItem('opcao') == null) {
    localStorage.setItem('opcao', 'op1')
  }
}

function restaurar() {
  localStorage.setItem('opcao', 'op1')
  defaults.URI = window.localStorage.setItem('URI','http://10.0.0.2:80/a/index.php')
  defaults.interval = window.localStorage.setItem('interval', '30000')
  $('#telaDoneMessage').removeClass('hidden');
  let intervalo = window.setTimeout(function(){$('#telaDoneMessage').addClass('hidden');}, 300);
}

function changeThings() {
  let changeURL = document.getElementById("_URL").value   
  if (changeURL == "") {}
  else {    
      window.localStorage.setItem('URI', changeURL) 
  }
  let check = document.getElementById("frequency").value
  if (check == "") {verificaRadio();}
  else if (check != 15 && check != 30 && check != 60){
      alert('You can only pick "15", "30" or "60" seconds. Sorry!');
  } else {
      check = check*1000;
      window.localStorage.setItem('interval', check)
      verificaRadio();
  }
}

function verificaRadio() {
    const radios = document.getElementsByName('opcoes')
    for (let i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {window.localStorage.setItem('opcao', radios[i].value);
        } else {}
    }
}

function verificaAutenticacao() {
    var value = window.localStorage.getItem("key");
    if(value != 'yes') {
        window.location.href = "index.html";
    } else {}
} 

function tela_carregamento() {
  $('#telaCarregamento').removeClass('hidden'); 
  $('#telaCarregamento').addClass('page-active');
}

function loopPhoto() {
  interrupt ++;
  if (interrupt == 1) {
      if (window.localStorage.getItem('opcao') == "op1") {capturePhoto(); loop = window.setInterval(capturePhoto, defaults.interval);
          } else {capturePhoto2(); loop = window.setInterval(capturePhoto2, defaults.interval);}
  } else {}
}

function stop() {
  window.clearInterval(loop); 
  CameraPreview.stopCamera(); 
}

function clearCache() {
  navigator.camera.cleanup();
}

function countd() {
  let countdownNumberEl = document.getElementById('countdown-number');
  let countdown = 5;

  countdownNumberEl.textContent = countdown;

  cameraCountdown = window.setInterval(function() {countdown = --countdown <= 0 ? 5 : countdown;countdownNumberEl.textContent = countdown;}, 1000);
}

function logout(option) {
  if (option == '1') {
    window.location.href = 'index.html'
    window.localStorage.setItem('key', 'no')
  } else {window.location.href = 'telaBotoes.html'}
}

//=-=-=-=-=-=-=-=-=-ENVIAR=-=-=-=-=-=-=-=-=-=-=-

function prepareCamera() {
    let options = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: CameraPreview.CAMERA_DIRECTION.FRONT,
      toBack: true,
      tapPhoto: false,
      tapFocus: false,
      previewDrag: false,
      storeToFile: false
    };

    CameraPreview.startCamera(options);
}

function capturePhoto() {
    CameraPreview.takePicture({width:640, height:640, quality: 85}, function(base64PictureData){
        path = 'data:image/jpeg;base64,' +base64PictureData;
        onCapturePhoto(path);
    });
}

function onCapturePhoto(fileURI) {
//firstPic permite que, se houver algum erro, tente novamente. Caso haja um erro, o else chama a
//funcao de novo. Caso haja dois, dá erro.
    var win = function (r) {
        clearCache();
        firstPic = 0;
    }

    var fail = function (error) {
        firstPic = firstPic + 1;
        if (firstPic == 2) {
            alert("ERROR. Gallery option now." + error);
            window.localStorage.setItem('opcao', 'op2');
            stop();
            telaCamera();
            loopPhoto();
            firstPic = 0;
        } else {onCapturePhoto(fileURI);}
    }

    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    options.params = {};
    var ft = new FileTransfer();
    ft.upload(fileURI, encodeURI(defaults.URI), win, fail, options);
}

//===================-=-=-=-=-=-=-=-=-ARMAZENAR=-=-=-=-=-=-=-=-=-=-=-===============================
function prepareCamera2() {
    let optionsGallery = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: CameraPreview.CAMERA_DIRECTION.FRONT,
      toBack: true,
      tapPhoto: true,
      tapFocus: false,
      previewDrag: false,
      storeToFile: true
    };

     CameraPreview.startCamera(optionsGallery);
}

function capturePhoto2() {
    CameraPreview.takePicture({width:640, height:640, quality: 85}, function(path){
        let image = 'file://' + path;
        window.cordova.plugins.imagesaver.saveImageToGallery(image, onSaveImageSuccess, onSaveImageError);
        function onSaveImageSuccess() {}

        function onSaveImageError(error) {
            alert(error);
        }
    });
}
//Media Capture acima
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// funcao lista, que chama help e outros
function lista() {
  $('#telaListagem').removeClass('hidden');
  $('#telaListagem').addClass('page-active');
}

function voltar() {
  $('#telaListagem').addClass('hidden');
  $('#telaListagem').removeClass('page-active');
}

function closeTelaHelp() {
  $('#telaHelp').removeClass('page-active');
  $('#telaHelp').addClass('hidden');
}

function help() {
  $('#telaHelp').removeClass('hidden');
  $('#telaHelp').addClass('page-active');
  voltar();
}

function telaCamera() {
    window.location.href = 'telaCamera.html'
    if (localStorage.getItem('opcao') == "op1") {prepareCamera()
    } else {prepareCamera2()}
}

//Telas de Login, Usuário e de transição acima.
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-