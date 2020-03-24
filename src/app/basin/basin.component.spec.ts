import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasinComponent } from './basin.component';

describe('BasinComponent', () => {
  let component: BasinComponent;
  let fixture: ComponentFixture<BasinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
