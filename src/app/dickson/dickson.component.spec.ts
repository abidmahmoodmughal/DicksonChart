import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DicksonComponent } from './dickson.component';

describe('DicksonComponent', () => {
  let component: DicksonComponent;
  let fixture: ComponentFixture<DicksonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DicksonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DicksonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
