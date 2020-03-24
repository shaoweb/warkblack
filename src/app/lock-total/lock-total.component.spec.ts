import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockTotalComponent } from './lock-total.component';

describe('LockTotalComponent', () => {
  let component: LockTotalComponent;
  let fixture: ComponentFixture<LockTotalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockTotalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
