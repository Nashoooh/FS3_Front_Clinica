import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CitasService } from './citas.service';
import { Analisis, Laboratorio, SolicitudAnalisis } from '../models/citas.model';
import { environment } from '../../environments/environment';

describe('CitasService', () => {
  let service: CitasService;
  let httpMock: HttpTestingController;

  const mockAnalisis: Analisis[] = [
    { id: 1, nombre: 'Hemograma', descripcion: 'Análisis de sangre completo' },
    { id: 2, nombre: 'Glucemia', descripcion: 'Medición de glucosa en sangre' }
  ];

  const mockLaboratorios: Laboratorio[] = [
    { id: 1, nombre: 'Lab Central', direccion: 'Av. Principal 123', telefono: '987654321' },
    { id: 2, nombre: 'Lab Norte', direccion: 'Calle Norte 456' }
  ];

  const mockSolicitudes: SolicitudAnalisis[] = [
    {
      id: 1,
      usuarioId: 1,
      analisisId: 1,
      laboratorioId: 1,
      fechaSolicitud: '2025-11-18',
      estado: 'pendiente'
    },
    {
      id: 2,
      usuarioId: 2,
      analisisId: 2,
      laboratorioId: 2,
      fechaSolicitud: '2025-11-19',
      estado: 'completado'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CitasService]
    });
    service = TestBed.inject(CitasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('Métodos de Análisis', () => {
    it('debe obtener lista de análisis', () => {
      service.getAnalisis().subscribe(analisis => {
        expect(analisis).toEqual(mockAnalisis);
        expect(analisis.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/analisis`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAnalisis);
    });

    it('debe obtener análisis por ID', () => {
      const analisisId = 1;
      const expectedAnalisis = mockAnalisis[0];

      service.getAnalisisById(analisisId).subscribe(analisis => {
        expect(analisis).toEqual(expectedAnalisis);
      });

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/analisis/${analisisId}`);
      expect(req.request.method).toBe('GET');
      req.flush(expectedAnalisis);
    });

    it('debe crear nuevo análisis', () => {
      const nuevoAnalisis: Analisis = { nombre: 'Nuevo Test', descripcion: 'Descripción del test' };
      const analisisCreado = { id: 3, ...nuevoAnalisis };

      service.createAnalisis(nuevoAnalisis).subscribe(analisis => {
        expect(analisis).toEqual(analisisCreado);
      });

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/analisis`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevoAnalisis);
      req.flush(analisisCreado);
    });

    it('debe actualizar análisis existente', () => {
      const analisisId = 1;
      const analisisActualizado: Analisis = { id: 1, nombre: 'Test Actualizado', descripcion: 'Nueva descripción' };

      service.updateAnalisis(analisisId, analisisActualizado).subscribe(analisis => {
        expect(analisis).toEqual(analisisActualizado);
      });

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/analisis/${analisisId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(analisisActualizado);
      req.flush(analisisActualizado);
    });

    it('debe eliminar análisis', () => {
      const analisisId = 1;

      service.deleteAnalisis(analisisId).subscribe();

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/analisis/${analisisId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('Métodos de Laboratorios', () => {
    it('debe obtener lista de laboratorios', () => {
      service.getLaboratorios().subscribe(laboratorios => {
        expect(laboratorios).toEqual(mockLaboratorios);
        expect(laboratorios.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/laboratorios`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLaboratorios);
    });

    it('debe obtener laboratorio por ID', () => {
      const laboratorioId = 1;
      const expectedLaboratorio = mockLaboratorios[0];

      service.getLaboratorioById(laboratorioId).subscribe(laboratorio => {
        expect(laboratorio).toEqual(expectedLaboratorio);
      });

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/laboratorios/${laboratorioId}`);
      expect(req.request.method).toBe('GET');
      req.flush(expectedLaboratorio);
    });

    it('debe crear nuevo laboratorio', () => {
      const nuevoLaboratorio: Laboratorio = { nombre: 'Lab Sur', direccion: 'Av. Sur 789' };
      const laboratorioCreado = { id: 3, ...nuevoLaboratorio };

      service.createLaboratorio(nuevoLaboratorio).subscribe(laboratorio => {
        expect(laboratorio).toEqual(laboratorioCreado);
      });

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/laboratorios`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevoLaboratorio);
      req.flush(laboratorioCreado);
    });

    it('debe actualizar laboratorio existente', () => {
      const laboratorioId = 1;
      const laboratorioActualizado: Laboratorio = { id: 1, nombre: 'Lab Central Actualizado', direccion: 'Nueva dirección' };

      service.updateLaboratorio(laboratorioId, laboratorioActualizado).subscribe(laboratorio => {
        expect(laboratorio).toEqual(laboratorioActualizado);
      });

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/laboratorios/${laboratorioId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(laboratorioActualizado);
      req.flush(laboratorioActualizado);
    });

    it('debe eliminar laboratorio', () => {
      const laboratorioId = 1;

      service.deleteLaboratorio(laboratorioId).subscribe();

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/laboratorios/${laboratorioId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('Métodos de Solicitudes', () => {
    it('debe obtener lista de solicitudes', () => {
      service.getSolicitudes().subscribe(solicitudes => {
        expect(solicitudes).toEqual(mockSolicitudes);
        expect(solicitudes.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/solicitud-analisis`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSolicitudes);
    });

    it('debe crear nueva solicitud', () => {
      const nuevaSolicitud: SolicitudAnalisis = {
        usuarioId: 1,
        analisisId: 1,
        laboratorioId: 1,
        fechaSolicitud: '2025-11-20',
        estado: 'pendiente'
      };
      const solicitudCreada = { id: 3, ...nuevaSolicitud };

      service.createSolicitud(nuevaSolicitud).subscribe(solicitud => {
        expect(solicitud).toEqual(solicitudCreada);
      });

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/solicitud-analisis`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevaSolicitud);
      req.flush(solicitudCreada);
    });

    it('debe eliminar solicitud', () => {
      const solicitudId = 1;

      service.deleteSolicitud(solicitudId).subscribe();

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/solicitud-analisis/${solicitudId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar error 404 al obtener análisis', () => {
      service.getAnalisis().subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/analisis`);
      req.flush({ message: 'No encontrado' }, { status: 404, statusText: 'Not Found' });
    });

    it('debe manejar error 500 al crear laboratorio', () => {
      const nuevoLaboratorio: Laboratorio = { nombre: 'Lab Error', direccion: 'Error St.' };

      service.createLaboratorio(nuevoLaboratorio).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/laboratorios`);
      req.flush({ message: 'Error interno' }, { status: 500, statusText: 'Internal Server Error' });
    });

    it('debe manejar error de red', () => {
      service.getSolicitudes().subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.name).toBe('HttpErrorResponse');
        }
      });

      const req = httpMock.expectOne(`${environment.apiLaboratorios}/solicitud-analisis`);
      req.error(new ProgressEvent('Network error'));
    });
  });
});
