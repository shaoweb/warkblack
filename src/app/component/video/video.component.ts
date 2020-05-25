import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {

  
  url = 'assets/image/oceans.mp4';
  safeUrl: any;

  constructor(private sanitizer: DomSanitizer) {
    this.getUrl(this.url);
  }

  ngOnInit() {
  }

  getUrl(url: string): void{
    this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(url);
  }

}
