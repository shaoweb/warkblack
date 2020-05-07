import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiverBasionComponent } from './river-basion.component';

describe('RiverBasionComponent', () => {
  let component: RiverBasionComponent;
  let fixture: ComponentFixture<RiverBasionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiverBasionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiverBasionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
