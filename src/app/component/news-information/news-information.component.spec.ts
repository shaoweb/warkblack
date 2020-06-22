import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsInformationComponent } from './news-information.component';

describe('NewsInformationComponent', () => {
  let component: NewsInformationComponent;
  let fixture: ComponentFixture<NewsInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
