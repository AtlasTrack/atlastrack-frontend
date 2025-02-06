import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendervalueformComponent } from './rendervalueform.component';

describe('RendervalueformComponent', () => {
  let component: RendervalueformComponent;
  let fixture: ComponentFixture<RendervalueformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendervalueformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendervalueformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
