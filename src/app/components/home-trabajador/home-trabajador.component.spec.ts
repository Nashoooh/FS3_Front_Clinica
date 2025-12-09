import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HomeTrabajadorComponent } from './home-trabajador.component';

describe('HomeTrabajadorComponent', () => {
  let component: HomeTrabajadorComponent;
  let fixture: ComponentFixture<HomeTrabajadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeTrabajadorComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeTrabajadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
