import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExamenService, Examen } from './examen.service';
import { environment } from '../../environments/environment';

describe('ExamenService', () => {
  let service: ExamenService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiExamenes + '/examenes';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExamenService]
    });
    service = TestBed.inject(ExamenService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all examenes', () => {
    const mockExamenes: Examen[] = [
      { id: 1, usuarioId: 15, laboratorioId: 1, analisisId: 1, fechaExamen: '2025-12-14', resultado: 'Negativo' }
    ];

    service.getAll().subscribe(examenes => {
      expect(examenes.length).toBe(1);
      expect(examenes).toEqual(mockExamenes);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockExamenes);
  });

  it('should get examen by id', () => {
    const mockExamen: Examen = { id: 1, usuarioId: 15, laboratorioId: 1, analisisId: 1, fechaExamen: '2025-12-14', resultado: 'Negativo' };

    service.getById(1).subscribe(examen => {
      expect(examen).toEqual(mockExamen);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockExamen);
  });

  it('should create examen', () => {
    const newExamen: Examen = { usuarioId: 15, laboratorioId: 1, analisisId: 1, fechaExamen: '2025-12-14', resultado: 'Negativo' };
    const createdExamen: Examen = { id: 1, ...newExamen };

    service.create(newExamen).subscribe(examen => {
      expect(examen).toEqual(createdExamen);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newExamen);
    req.flush(createdExamen);
  });

  it('should update examen', () => {
    const updatedExamen: Examen = { id: 1, usuarioId: 15, laboratorioId: 1, analisisId: 1, fechaExamen: '2025-12-14', resultado: 'Positivo' };

    service.update(1, updatedExamen).subscribe(examen => {
      expect(examen).toEqual(updatedExamen);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedExamen);
    req.flush(updatedExamen);
  });

  it('should get examenes by paciente', () => {
    const mockExamenes: Examen[] = [
      { id: 1, usuarioId: 15, laboratorioId: 1, analisisId: 1, fechaExamen: '2025-12-14', resultado: 'Negativo' }
    ];

    service.getByPaciente(15).subscribe(examenes => {
      expect(examenes.length).toBe(1);
      expect(examenes).toEqual(mockExamenes);
    });

    const req = httpMock.expectOne(`${apiUrl}?usuarioId=15`);
    expect(req.request.method).toBe('GET');
    req.flush(mockExamenes);
  });
});
