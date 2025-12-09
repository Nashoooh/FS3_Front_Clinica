import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { HomePacienteComponent } from './home-paciente.component';
import { AuthService } from '../../services/auth.service';
import { CitasService } from '../../services/citas.service';
import { Usuario } from '../../models/usuario.model';

describe('HomePacienteComponent', () => {
  let component: HomePacienteComponent;
  let fixture: ComponentFixture<HomePacienteComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockCitasService: jasmine.SpyObj<CitasService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let currentUserSubject: BehaviorSubject<Usuario | null>;

  const mockUsuario: Usuario = {
    id: 1,
    nombre: 'Test',
    apellido: 'User',
    email: 'test@email.com',
    rut: '12345678-9',
    rol: { id: 1, nombre: 'Paciente' }
  };

  const mockAnalisis = [
    { id: 1, nombre: 'Hemograma', descripcion: 'Análisis de sangre completo' },
    { id: 2, nombre: 'Glucemia', descripcion: 'Medición de glucosa' }
  ];

  const mockLaboratorios = [
    { id: 1, nombre: 'Lab Central', direccion: 'Av. Principal 123' },
    { id: 2, nombre: 'Lab Norte', direccion: 'Calle Norte 456' }
  ];

  const mockSolicitudes = [
    {
      id: 1,
      usuarioId: 1,
      analisisId: 1,
      laboratorioId: 1,
      fechaSolicitud: '2025-11-18',
      estado: 'pendiente'
    }
  ];

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<Usuario | null>(mockUsuario);
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: currentUserSubject.asObservable()
    });
    const citasServiceSpy = jasmine.createSpyObj('CitasService', [
      'getAnalisis', 'getLaboratorios', 'getSolicitudes', 'createSolicitud', 'deleteSolicitud'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HomePacienteComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CitasService, useValue: citasServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePacienteComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockCitasService = TestBed.inject(CitasService) as jasmine.SpyObj<CitasService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Configurar mocks por defecto
    mockCitasService.getAnalisis.and.returnValue(of(mockAnalisis));
    mockCitasService.getLaboratorios.and.returnValue(of(mockLaboratorios));
    mockCitasService.getSolicitudes.and.returnValue(of(mockSolicitudes));
    
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar con usuario del AuthService', () => {
    expect(component.usuario).toEqual(mockUsuario);
  });

  it('debe inicializar el tiempo actual', () => {
    expect(component.currentTime).toBeDefined();
    expect(typeof component.currentTime).toBe('string');
    expect(component.currentTime.length).toBeGreaterThan(0);
  });

  it('debe hacer logout y navegar al login', () => {
    component.logout();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debe abrir modal de solicitar examen', () => {
    component.solicitarExamen();

    expect(component.showSolicitarModal).toBeTrue();
    expect(mockCitasService.getAnalisis).toHaveBeenCalled();
    expect(mockCitasService.getLaboratorios).toHaveBeenCalled();
  });

  it('debe cerrar modal de solicitar examen', () => {
    component.showSolicitarModal = true;
    component.nuevaSolicitud = { analisisId: 1, laboratorioId: 1, fecha: '2025-11-18' };

    component.closeSolicitarModal();

    expect(component.showSolicitarModal).toBeFalse();
    expect(component.nuevaSolicitud.analisisId).toBe(0);
    expect(component.nuevaSolicitud.laboratorioId).toBe(0);
    expect(component.nuevaSolicitud.fecha).toBe('');
  });

  it('debe cargar catálogos correctamente', async () => {
    component.cargarCatalogos();
    
    // Esperar múltiples ciclos de event loop para que se resuelvan las promesas
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(component.analisisList).toEqual(mockAnalisis);
    expect(component.laboratoriosList).toEqual(mockLaboratorios);
    expect(component.loading).toBeFalse();
  });

  it('debe manejar error al cargar catálogos', async () => {
    mockCitasService.getAnalisis.and.returnValue(throwError(() => new Error('Error')));
    
    component.cargarCatalogos();
    
    // Esperar múltiples ciclos de event loop para que se ejecute el catch
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(component.errorMessage).toContain('Error al cargar los datos');
    expect(component.loading).toBeFalse();
  });

  it('debe validar campos requeridos antes de enviar solicitud', () => {
    component.nuevaSolicitud = { analisisId: 0, laboratorioId: 0, fecha: '' };

    component.enviarSolicitud();

    expect(component.errorMessage).toContain('completa todos los campos');
    expect(mockCitasService.createSolicitud).not.toHaveBeenCalled();
  });

  it('debe validar usuario antes de enviar solicitud', () => {
    component.usuario = null;

    component.enviarSolicitud();

    expect(component.errorMessage).toContain('Usuario no identificado');
    expect(mockCitasService.createSolicitud).not.toHaveBeenCalled();
  });

  it('debe enviar solicitud exitosamente', () => {
    component.nuevaSolicitud = { analisisId: 1, laboratorioId: 1, fecha: '2025-11-18' };
    const mockResponse = { id: 1, usuarioId: 1, analisisId: 1, laboratorioId: 1, fechaSolicitud: '2025-11-18', estado: 'pendiente' };
    mockCitasService.createSolicitud.and.returnValue(of(mockResponse));

    component.enviarSolicitud();

    expect(component.loading).toBeFalse();
    expect(component.successMessage).toContain('Solicitud de examen creada exitosamente');
    expect(mockCitasService.createSolicitud).toHaveBeenCalledWith(jasmine.objectContaining({
      usuarioId: 1,
      laboratorio: { id: 1 },
      analisis: { id: 1 },
      fechaSolicitud: '2025-11-18',
      estado: 'pendiente'
    }));
  });

  it('debe manejar error al enviar solicitud', () => {
    component.nuevaSolicitud = { analisisId: 1, laboratorioId: 1, fecha: '2025-11-18' };
    const error = { error: { error: 'Error personalizado' } };
    mockCitasService.createSolicitud.and.returnValue(throwError(() => error));

    component.enviarSolicitud();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Error personalizado');
  });

  it('debe abrir modal de consultar examenes', () => {
    component.consultarExamenes();

    expect(component.showConsultarModal).toBeTrue();
    expect(mockCitasService.getSolicitudes).toHaveBeenCalled();
  });

  it('debe cerrar modal de consultar examenes', () => {
    component.showConsultarModal = true;

    component.closeConsultarModal();

    expect(component.showConsultarModal).toBeFalse();
  });

  it('debe cargar solicitudes del usuario actual', () => {
    const allSolicitudes = [
      ...mockSolicitudes,
      { id: 2, usuarioId: 2, analisisId: 2, laboratorioId: 2, fechaSolicitud: '2025-11-18', estado: 'pendiente' }
    ];
    mockCitasService.getSolicitudes.and.returnValue(of(allSolicitudes));

    component.cargarMisSolicitudes();

    expect(component.misSolicitudes).toEqual(mockSolicitudes);
    expect(component.loading).toBeFalse();
  });

  it('debe manejar error al cargar solicitudes', () => {
    mockCitasService.getSolicitudes.and.returnValue(throwError(() => new Error('Error')));

    component.cargarMisSolicitudes();

    expect(component.errorMessage).toContain('Error al cargar las reservas');
    expect(component.loading).toBeFalse();
  });

  it('debe abrir modal de anular examen', () => {
    component.cancelarExamen();

    expect(component.showAnularModal).toBeTrue();
    expect(mockCitasService.getSolicitudes).toHaveBeenCalled();
  });

  it('debe cerrar modal de anular examen', () => {
    component.showAnularModal = true;

    component.closeAnularModal();

    expect(component.showAnularModal).toBeFalse();
  });

  it('debe validar ID antes de anular solicitud', () => {
    component.anularSolicitud(undefined);

    expect(component.errorMessage).toContain('ID de solicitud inválido');
    expect(mockCitasService.deleteSolicitud).not.toHaveBeenCalled();
  });

  it('debe anular solicitud exitosamente', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockCitasService.deleteSolicitud.and.returnValue(of(undefined));

    component.anularSolicitud(1);

    expect(component.successMessage).toContain('Reserva anulada exitosamente');
    expect(mockCitasService.deleteSolicitud).toHaveBeenCalledWith(1);
    expect(mockCitasService.getSolicitudes).toHaveBeenCalled(); // Recargar lista
  });

  it('debe cancelar anulación si usuario no confirma', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.anularSolicitud(1);

    expect(mockCitasService.deleteSolicitud).not.toHaveBeenCalled();
  });

  it('debe manejar error al anular solicitud', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockCitasService.deleteSolicitud.and.returnValue(throwError(() => new Error('Error')));

    component.anularSolicitud(1);

    expect(component.errorMessage).toContain('Error al anular la reserva');
    expect(component.loading).toBeFalse();
  });

  it('debe limpiar mensajes', () => {
    component.successMessage = 'Mensaje exitoso';
    component.errorMessage = 'Mensaje de error';

    component.clearMessages();

    expect(component.successMessage).toBe('');
    expect(component.errorMessage).toBe('');
  });

  it('debe obtener nombre de análisis', () => {
    component.analisisList = mockAnalisis;

    const nombre = component.getNombreAnalisis(1);

    expect(nombre).toBe('Hemograma');
  });

  it('debe retornar Desconocido para análisis no encontrado', () => {
    component.analisisList = mockAnalisis;

    const nombre = component.getNombreAnalisis(999);

    expect(nombre).toBe('Desconocido');
  });

  it('debe obtener nombre de laboratorio', () => {
    component.laboratoriosList = mockLaboratorios;

    const nombre = component.getNombreLaboratorio(1);

    expect(nombre).toBe('Lab Central');
  });

  it('debe retornar Desconocido para laboratorio no encontrado', () => {
    component.laboratoriosList = mockLaboratorios;

    const nombre = component.getNombreLaboratorio(999);

    expect(nombre).toBe('Desconocido');
  });

  it('debe llamar console.log al ver resultados', () => {
    spyOn(console, 'log');

    component.verResultados();

    expect(console.log).toHaveBeenCalledWith('Navegando a resultados...');
  });

  it('debe llamar console.log al ver historial', () => {
    spyOn(console, 'log');

    component.verHistorial();

    expect(console.log).toHaveBeenCalledWith('Navegando a historial...');
  });

  it('debe llamar console.log al editar perfil', () => {
    spyOn(console, 'log');

    component.editarPerfil();

    expect(console.log).toHaveBeenCalledWith('Navegando a perfil...');
  });
});
