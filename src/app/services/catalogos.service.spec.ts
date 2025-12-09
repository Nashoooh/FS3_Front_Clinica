import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CatalogosService } from './catalogos.service';
import { Prevision, Rol } from '../models/prevision-rol.model';
import { environment } from '../../environments/environment';

describe('CatalogosService', () => {
  let service: CatalogosService;
  let httpMock: HttpTestingController;

  const mockPrevisiones: Prevision[] = [
    { id: 1, nombre: 'Fonasa A' },
    { id: 2, nombre: 'Fonasa B' },
    { id: 3, nombre: 'Fonasa C' },
    { id: 4, nombre: 'Fonasa D' },
    { id: 5, nombre: 'Isapre' }
  ];

  const mockRoles: Rol[] = [
    { id: 1, nombre: 'Paciente' },
    { id: 2, nombre: 'Trabajador' },
    { id: 3, nombre: 'Administrador' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CatalogosService]
    });
    service = TestBed.inject(CatalogosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener lista de previsiones', () => {
    service.getPrevisiones().subscribe(previsiones => {
      expect(previsiones).toEqual(mockPrevisiones);
      expect(previsiones.length).toBe(5);
      
      // Verificar que incluye las previsiones esperadas
      expect(previsiones.find(p => p.nombre === 'Fonasa A')).toBeTruthy();
      expect(previsiones.find(p => p.nombre === 'Isapre')).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/previsiones`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPrevisiones);
  });

  it('debe obtener lista de roles', () => {
    service.getRoles().subscribe(roles => {
      expect(roles).toEqual(mockRoles);
      expect(roles.length).toBe(3);
      
      // Verificar que incluye los roles esperados
      expect(roles.find(r => r.nombre === 'Paciente')).toBeTruthy();
      expect(roles.find(r => r.nombre === 'Trabajador')).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/roles`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRoles);
  });

  it('debe manejar lista vacía de previsiones', () => {
    service.getPrevisiones().subscribe(previsiones => {
      expect(previsiones).toEqual([]);
      expect(previsiones.length).toBe(0);
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/previsiones`);
    req.flush([]);
  });

  it('debe manejar lista vacía de roles', () => {
    service.getRoles().subscribe(roles => {
      expect(roles).toEqual([]);
      expect(roles.length).toBe(0);
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/roles`);
    req.flush([]);
  });

  it('debe manejar error 404 al obtener previsiones', () => {
    service.getPrevisiones().subscribe({
      next: () => fail('Debería haber fallado'),
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/previsiones`);
    req.flush({ message: 'Previsiones no encontradas' }, { status: 404, statusText: 'Not Found' });
  });

  it('debe manejar error 500 al obtener roles', () => {
    service.getRoles().subscribe({
      next: () => fail('Debería haber fallado'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/roles`);
    req.flush({ message: 'Error interno del servidor' }, { status: 500, statusText: 'Internal Server Error' });
  });

  it('debe manejar error de red al obtener previsiones', () => {
    service.getPrevisiones().subscribe({
      next: () => fail('Debería haber fallado'),
      error: (error) => {
        expect(error.name).toBe('HttpErrorResponse');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/previsiones`);
    req.error(new ProgressEvent('Network error'));
  });

  it('debe manejar error de red al obtener roles', () => {
    service.getRoles().subscribe({
      next: () => fail('Debería haber fallado'),
      error: (error) => {
        expect(error.name).toBe('HttpErrorResponse');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/roles`);
    req.error(new ProgressEvent('Network error'));
  });

  it('debe realizar múltiples llamadas simultáneas correctamente', () => {
    let previsionesResult: Prevision[] = [];
    let rolesResult: Rol[] = [];

    // Realizar ambas llamadas al mismo tiempo
    service.getPrevisiones().subscribe(previsiones => {
      previsionesResult = previsiones;
    });

    service.getRoles().subscribe(roles => {
      rolesResult = roles;
    });

    // Verificar que se hicieron ambas peticiones
    const previsionesReq = httpMock.expectOne(`${environment.apiUsuarios}/previsiones`);
    const rolesReq = httpMock.expectOne(`${environment.apiUsuarios}/roles`);

    expect(previsionesReq.request.method).toBe('GET');
    expect(rolesReq.request.method).toBe('GET');

    // Responder ambas peticiones
    previsionesReq.flush(mockPrevisiones);
    rolesReq.flush(mockRoles);

    // Verificar resultados
    expect(previsionesResult).toEqual(mockPrevisiones);
    expect(rolesResult).toEqual(mockRoles);
  });
});
