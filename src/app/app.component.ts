import { Component,OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { VideoService } from './video.service';
import { FaceApiService } from './face-api.service';

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

  constructor(
    private faceApiService : FaceApiService,
    private videoService: VideoService,
    private renderer2 : Renderer2,
    private elementRef: ElementRef ){

  }

  ngOnInit(): void { 
    this.Eventos(); 
    this.RevisarMultimedia();
    this.getTamañoCamara();
  }
  ngOnDestroy(): void {
    this.listaEventos.forEach(event => event.unsubscribe());
  }

  Eventos = ()=>{
    const observador1$ = this.videoService.respuestaAI
    //Cada vez que la IA consiga estos valores los emite a VideoComponent
    .subscribe(({redimensionDetec, tamañoPantalla,expresiones,elementoVideo})=>{
      redimensionDetec = redimensionDetec[0]||null;
    //Aqui dibujamos 
    if(redimensionDetec){
      //Va crear un liezo apenas detecte una cara
      this.crearLienzoPrevio(elementoVideo);
      this.DibujarCara(redimensionDetec, tamañoPantalla);
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
