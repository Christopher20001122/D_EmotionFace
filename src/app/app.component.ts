import { Component,OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public Transmi: any;
  ngOnInit(): void {  
    this.RevisarMultimedia();
  }

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
}
