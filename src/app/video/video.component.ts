import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {


  @ViewChild('elementoVideo') elementoVideo: ElementRef | undefined;
  @Input() transmision:any;
  @Input() ancho: any;
  @Input() alto: any;


  constructor(){
  }
  ngOnInit(): void {
    
  }
  PrecargaCompleta(): void {
    
    }
    
  VideoReproduciendo():void {
    
    }
}
