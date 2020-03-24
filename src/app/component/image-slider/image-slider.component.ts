import { Component,OnInit,Input,ViewChild,ElementRef,Renderer2 } from '@angular/core';

export interface ImageSlider {
  imgUrl: string;
  link: string;
  caption: string;
}

@Component({
  selector: 'app-image-slider',
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.css']
})
export class ImageSliderComponent implements OnInit {
  @Input() sliders: ImageSlider[] = [];
  @Input() sliderHeight = '100%';
  @ViewChild('imageSlider', { static: true }) imgSlider: ElementRef;
  @Input() intervalBySeconds = 2;
  selectedIndex = 0;
  constructor(private rd2: Renderer2) { }
  intervalId;
  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.intervalId = setInterval(() => {
      this.rd2.setProperty(
        this.imgSlider.nativeElement,
        'scrollLeft',
        (this.getIndex(++this.selectedIndex) *
          this.imgSlider.nativeElement.scrollWidth) /
        this.sliders.length
      );
    }, this.intervalBySeconds * 3000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  getIndex(idx: number): number {
    return idx >= 0
      ? idx % this.sliders.length
      : this.sliders.length - (Math.abs(idx) % this.sliders.length);
  }

  // 左移
  leftMobile(): void {
    this.rd2.setProperty(
      this.imgSlider.nativeElement,
      'scrollLeft',
      (this.getIndex(++this.selectedIndex) *
        this.imgSlider.nativeElement.scrollWidth) /
      this.sliders.length
    );
  }

  // 右移
  rightMobile(): void{
    this.rd2.setProperty(
      this.imgSlider.nativeElement,
      'scrollLeft',
      (this.getIndex(--this.selectedIndex) *
        this.imgSlider.nativeElement.scrollWidth) /
      this.sliders.length
    );
  }


}
