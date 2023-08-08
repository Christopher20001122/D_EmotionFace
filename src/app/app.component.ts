import { Component,OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { VideoService } from './video.service';
import { FaceApiService } from './face-api.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public Transmi: any;
  public dimensionVideo : any;
  listaEventos : Array<any> = [];
  sobreLienzo : any;
  listaExpresiones : any [];
  EmocionAlta: { name: string, value: number } = { name: "", value: 0 };
  EmocionAltaCapturada: { name: string, value: number,timestamp: number } | null = null;
  
  constructor(
    private faceApiService : FaceApiService,
    private videoService: VideoService,
    private renderer2 : Renderer2,
    private elementRef: ElementRef,
    private router: Router ){

  }

  ngOnInit(): void { 
    this.Eventos(); 
    this.RevisarMultimedia();
    this.getTamañoCamara();
  }
  ngOnDestroy(): void {
    this.listaEventos.forEach(event => event.unsubscribe());
  }
  emotionToLinkMap: { [emotion: string]: string } = {
    'neutral': 'https://www.youtube.com/?hl=es-419',
    'happy': 'https://www.facebook.com/',
    'sad': 'https://enlace-emotion2.com',
    'angry': 'https://enlace-emotion2.com',
    'fearful': 'https://enlace-emotion2.com',
    'disgusted': 'https://enlace-emotion2.com',
    'surprised': 'https://academico.uce.edu.ec/aplicacion/academico/generalidades/login.jsp',
    // Agrega más emociones y enlaces según sea necesario
  };
  Eventos = ()=>{
    const observador1$ = this.videoService.respuestaAI
    //Cada vez que la IA consiga estos valores los emite a VideoComponent
    .subscribe(({redimensionDetec, tamañoPantalla,expresiones,elementoVideo})=>{
      redimensionDetec = redimensionDetec[0]||null;
    //Aqui dibujamos 
    if(redimensionDetec){
      this.listaExpresiones = _.map(expresiones,(value,name)=>{
        return {name, value};
      });
      //console.log(this.listaExpresiones);   
      //console.log(expresiones);
      //capturamos el valor con la expresion más alta
      let EmocionAlta = { name: "", value: 0 };
        this.listaExpresiones.forEach(({ name, value }) => {
          if (value > EmocionAlta.value) {
            EmocionAlta = { name, value };       
          }
        });
      //Va crear un liezo apenas detecte una cara
      this.crearLienzoPrevio(elementoVideo);
      this.DibujarCara(redimensionDetec, tamañoPantalla);
      //Comparamos que la emocion sea superior al 95%
      const currentTime = new Date().getTime();
      if (EmocionAlta.value >= 0.95) {
        if (!this.EmocionAltaCapturada || currentTime - this.EmocionAltaCapturada.timestamp >= 10000) {
          this.EmocionAltaCapturada = { ...EmocionAlta, timestamp: currentTime };
      
          const emotionName = EmocionAlta.name;
          if (this.emotionToLinkMap[emotionName]) {
            setTimeout(() => {
              window.open(this.emotionToLinkMap[emotionName], '_blank');
            }, 3000); // 3000 milisegundos (3 segundos)
          }
        }
      }
    }
    });

    this.listaEventos = [observador1$]
  };


  DibujarCara = (redimensionDetec, tamañoPantalla)=>{
    //Dibujamos los puntos de referencia en el cuadro 
    if(this.sobreLienzo){
      const {global} = this.faceApiService;
      this.sobreLienzo.getContext('2d').clearRect(0,0,tamañoPantalla.width,tamañoPantalla.height);
      global.draw.drawFaceLandmarks(this.sobreLienzo, redimensionDetec);
    }
  };

  RevisarMultimedia =()=>{
    //Solo se va a ejecutar si detecta fuentes de multimedia 
    if(navigator&&navigator.mediaDevices){
      navigator.mediaDevices.getUserMedia({
        video:true
        //Si es que acepta
      }).then(Stream=> {
        this.Transmi = Stream
        //Si es que no acepta
      }).catch(()=>{
        console.log('<><><>Error permisos denegados<><><>');     
      });
    }else{
      console.log('<><><>Error, no se encontro una Camara<><><>');
      
    }
  };

  //Funcion para tomar el elemento
  getTamañoCamara=()=>{   
    const elementCam: HTMLElement = document.querySelector('.cam');
    //obtenemos el ancho y alto de la camara (bordes)
    const {width, height} = elementCam.getBoundingClientRect();
    this.dimensionVideo = {width, height};
  };

  crearLienzoPrevio = (elementoVideo:any)=>{
    if(!this.sobreLienzo){
      const {global}= this.faceApiService;
      //guardamos la creacion del lienzo si es que no existe un lienzo
      this.sobreLienzo = global.createCanvasFromMedia(elementoVideo.nativeElement);
      this.renderer2.setProperty(this.sobreLienzo, 'id', 'new-lienzo-previo');
      const elementoPrevio = document.querySelector('.canvas-preview');
      this.renderer2.appendChild(elementoPrevio, this.sobreLienzo);
    }

  };
}
