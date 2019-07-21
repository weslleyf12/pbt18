setConfig()
createDirectories()

let defaults = new Object();
defaults.URI = window.localStorage.getItem('URI')
defaults.interval = window.localStorage.getItem('interval')

let URL_descartada = '';
let parar = null;
let loop = null;
let interrupt = 0; // to not start loopPhoto twice
let firstPic = 0;  // just the first shot will alert of failure
let cameraCountDown = null;
let acuracia= [];
picNumber = parseInt(Math.random() * 9000);

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  document.getElementById("restoreD").addEventListener("click", changeDefaults);
  
}

function createDirectories() {
  let caminho = "file:///storage/emulated/0/pbt/";

  window.resolveLocalFileSystemURL(caminho, function(dir) {
    dir.getDirectory("fotos", {create:true}, function(fileEntry) {
      fileEntry.getFile("manual.txt", {create:true}, function(file) {
          let logOb = file;        
          logOb.createWriter(function(fileWriter) {
          fileWriter.seek(fileWriter.length);
          let blob = new Blob(["Olá. Nesta pasta fica as fotos tiradas que serão enviadas ao servidor."], {type: "text/plain"});
          fileWriter.write(blob);
        }), function(e){window.logToFile.error((e));}
      })
    })
    dir.getDirectory("classificados", {create:true}, function(fileEntry) {
      fileEntry.getFile("manual.txt", {create:true}, function(file) {
        let logOb1 = file;        
        logOb1.createWriter(function(fileWriter) {
          fileWriter.seek(fileWriter.length);
          let blob1 = new Blob(["Olá. Nesta pasta é onde ficam armazenadas as fotos que foram classificadas, e os resultados obtidos a partir de cada imagem podem ser vistos no arquivo de log 'pbt/log.txt'."], {type: "text/plain"})
          fileWriter.write(blob1);
        }), function(e){window.logToFile.error((e));} 
      })
    })
  });
};


function salvarUsername() {
  if(document.getElementById('user').value != '' || document.getElementById('user').value != null) {
    localStorage.setItem('userValue', document.getElementById('user').value)
  }
}

function setConfig() {
  if (localStorage.getItem('URI') == null) { 
    localStorage.setItem('URI', 'http://10.0.0.2:80/a/index.php') 
  }
  if (localStorage.getItem('interval') == null) {
    localStorage.setItem('interval', '30000')
  }
  if (localStorage.getItem('opcao') == null) {
    localStorage.setItem('opcao', 'op1')
  }
}


function mostraMensagem(valor){
   document.getElementById("progress").innerHTML = valor;
}
// Application Constructor

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
  else if (check != 15 && check != 30 && check != 45 && check != 60){
      alert('Você só pode escolher entre "15", "30", "45" e "60" segundos. Perdão!');
  } else if (check == 15 && window.localStorage.getItem('opcao') == 'op3') {
      alert("Você não pode colocar o intervalo como '15' enquanto escolhe classificar no dispositivo. Classificar requer mais tempo.");
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
    let value = window.localStorage.getItem("key");
    if(value != 'yes') {
        window.location.href = "index.html";
    } else {}
} 

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    let byteCharacters = atob(b64Data);
    let byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        let slice = byteCharacters.slice(offset, offset + sliceSize);

        let byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        let byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    let blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

function savebase64AsImageFile(folderpath,filename,content,contentType){
    // Convert the base64 string in a Blob
    let DataBlob = b64toBlob(content,contentType);
    window.resolveLocalFileSystemURL(folderpath, function(dir) {
      dir.getFile(filename, {create:true}, function(file) {
        file.createWriter(function(fileWriter) {
          if (localStorage.getItem('opcao') == 'op2') {
            mostraMensagem('Salvando fotos: OK.')
            document.getElementById("progress").style.color = "green"  
          }
          fileWriter.write(DataBlob);
        }, function(){
          document.getElementById("progress").style.color = "red";
          mostraMensagem('Salvando fotos: ERROR.');
          window.logToFile.error('Não foi possível salvar a foto em: '+ folderpath);
        });
      });
    });
}

function tela_carregamento() {
  $('#telaCarregamento').removeClass('hidden'); 
  $('#telaCarregamento').addClass('page-active');
}

function loopPhoto() {
  interrupt ++;
  if (interrupt == 1) {
    capturePhoto(); loop = window.setInterval(capturePhoto, defaults.interval);
  }
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

function capturePhoto(x) {
  CameraPreview.takePicture({width:299, height:299, quality: 85}, function(base64PictureData){
    imgReady = 'data:image/jpeg;base64,' +base64PictureData;
    let block = imgReady.split(";");//essas três linhas fazem parte do salvamento #1
    let dataType = block[0].split(":")[1];//#2
    let realData = block[1].split(",")[1];//#3
    if (window.localStorage.getItem('opcao') == 'op3') { //salvar e classificar

      let folderpath = "file:///storage/emulated/0/pbt/classificados/";
      picNumber++;
      let filename = `pbt${picNumber}.jpg`;
      window.logToFile.setLogfilePath('/pbt/log.txt', function () {
      }, function (err) {
        alert('Erro:' + err);
      });
      savebase64AsImageFile(folderpath,filename,realData,dataType);
      //========================SALVANDO ACIMA=====================
      tfClassifier(imgReady);//===CLASSIFICANDO===

    } else if (window.localStorage.getItem('opcao') == "op1") { //enviar

      enviarFoto(imgReady);

    } else if (window.localStorage.getItem('opcao') == "op2") { //salvar

      let folderpath = "file:///storage/emulated/0/pbt/fotos/";
      picNumber++;
      let filename = `pbt${picNumber}.jpg`;
      window.logToFile.setLogfilePath('/pbt/log.txt', function () {
      }, function (err) {
        alert('Erro:' + err);
      });
      savebase64AsImageFile(folderpath,filename,realData,dataType);
      document.getElementById("progress").style.color = "green";
      mostraMensagem('Tentando salvar imagens...')
    }
  });
}

function tfClassifier(imgData) {
  let tf = new TensorFlow('custom-model', {
                     'label': 'My Custom Model',
                     'label_path': "http://10.0.0.2:80/modelo/driver.zip#driver_labels.txt",
                     'model_path': "http://10.0.0.2:80/modelo/driver.zip#driver_graph_rounded.pb",
                     'input_size': 299,
                     'image_mean': 128,
                     'image_std': 128,
                     'input_name': 'Mul',
                     'output_name': 'final_result'
                 });
  mostraMensagem("Carregando...");

  tf.onprogress = function(evt) {
    if (evt['status'] == 'downloading') {
        stop();
        $('#CarregarDownload').removeClass('hidden');
        $('#CarregarDownload').addClass('page-active');
        mostraMensagem("Fazendo download do modelo...");
        if (evt.detail) {
            let carregados = evt.detail.loaded/1024/1024;
            let total = evt.detail.total/1024/1024;

            carregados = carregados.toFixed(2);
            total = total.toFixed(2);
         
            let perc = (carregados * 100 / total).toFixed(2);
         
            mostraMensagem(`${perc}% ${carregados}MB de ${total}MB`);
        } 
    } else if (evt['status'] == 'unzipping') {
        mostraMensagem("Extraindo...");
        interrupt = 0;
        loopPhoto();
        prepareCamera();
    } else if (evt['status'] == 'initializing') {
        $('#CarregarDownload').removeClass('page-active');
        $('#CarregarDownload').addClass('hidden');
        mostraMensagem("Iniciando Tensorflow");
    }
  }

  let aData = imgData.split(',');
  
  tf.classify(aData[1]).then(function(results) {
    let maiorValor = 0;
    let classified = '';
    results.forEach(function(result) {
      if (result.confidence > maiorValor) {
        maiorValor = result.confidence * 100;
        classified = result.title;
      }
      let confidence = maiorValor.toFixed(2);
      mostraMensagem(`${classified} = ${confidence}%`);
      if (classified != 'c0') {
        document.getElementById("progress").style.color = "red";
      } else {
        document.getElementById("progress").style.color = "green";
      }
      let porcentagem = result.confidence*100;
      window.logToFile.info(`Foto: ${picNumber} = ${result.title} ${porcentagem}%`);
    });
  });
}
//Parte que envia ao servidor.
function enviarFoto(fileURI) {
//firstPic permite que, se houver algum erro, tente novamente. Caso haja um erro, o else chama a
//funcao de novo. Caso haja dois, dá erro.
    let win = function (r) {
        mostraMensagem('Conexão OK');
        clearCache();
        firstPic = 0;
    }

    let fail = function (error) {
        mostraMensagem('Tentando conectar...')
        firstPic = firstPic + 1;
        if (firstPic == 2) {
            mostraMensagem('Conexão falhou');
            alert("Erro. Fotos irão para a galeria, agora. " + error);
            document.getElementById("progress").style.color = "red";
            window.localStorage.setItem('opcao', 'op2');
            stop();
            telaCamera();
            loopPhoto();
            firstPic = 0;
        } else {enviarFoto(fileURI);}
    }

    let options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    options.params = {};
    let ft = new FileTransfer();
    ft.upload(fileURI, encodeURI(defaults.URI), win, fail, options);
}

// funcao lista, que chama help e outros
function lista() {
  painel.porta = "aberto"
  $('#telaListagem').removeClass('hidden');
  $('#telaListagem').addClass('page-active');
}

function painel() {
  this.porta = fechada
}

new painel

function voltar() {
  if (painel.porta == 'aberto') {
    painel.porta = 'desbloqueada'
  } else if (painel.porta == 'desbloqueada') {
    $('#telaListagem').addClass('hidden');
    $('#telaListagem').removeClass('page-active');
  } else {}
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
  window.location.href = 'telaCamera.html';
  prepareCamera();
}
//Telas de Login, Usuário e de transição acima.
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-