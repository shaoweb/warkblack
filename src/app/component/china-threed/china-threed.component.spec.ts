import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChinaThreedComponent } from './china-threed.component';

describe('ChinaThreedComponent', () => {
  let component: ChinaThreedComponent;
  let fixture: ComponentFixture<ChinaThreedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChinaThreedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChinaThreedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
