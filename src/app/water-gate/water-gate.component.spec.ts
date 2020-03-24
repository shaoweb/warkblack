import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterGateComponent } from './water-gate.component';

describe('WaterGateComponent', () => {
  let component: WaterGateComponent;
  let fixture: ComponentFixture<WaterGateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaterGateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterGateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
