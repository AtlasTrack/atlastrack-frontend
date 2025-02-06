import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtlastrackerindexComponent } from './atlastrackerindex.component';

describe('AtlastrackerindexComponent', () => {
  let component: AtlastrackerindexComponent;
  let fixture: ComponentFixture<AtlastrackerindexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtlastrackerindexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtlastrackerindexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
