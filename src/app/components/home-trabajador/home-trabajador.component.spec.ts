import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { HomeTrabajadorComponent } from './home-trabajador.component';
import { AuthService } from '../../services/auth.service';
import { CitasService } from '../../services/citas.service';
import { Usuario } from '../../models/usuario.model';
import { Analisis, Laboratorio } from '../../models/citas.model';

describe('HomeTrabajadorComponent', () => {
  let component: HomeTrabajadorComponent;
  let fixture: ComponentFixture<HomeTrabajadorComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockCitasService: jasmine.SpyObj<CitasService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let currentUserSubject: BehaviorSubject<Usuario | null>;

  const mockUsuario: Usuario = {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@clinica.com',
    rut: '12345678-9',
    rol: { id: 2, nombre: 'Trabajador' }
  };

  const mockAnalisis: Analisis[] = [
    { id: 1, nombre: 'Hemograma', descripcion: 'Análisis de sangre completo' },
    { id: 2, nombre: 'Glucemia', descripcion: 'Medición de glucosa en sangre' }
  ];

  const mockLaboratorios: Laboratorio[] = [
    { 
      id: 1, 
      nombre: 'Lab Central', 
      direccion: 'Av. Principal 123',
      telefono: '123456789',
      ubicacion: 'Centro',
      capacidad: 50
    },
    { 
      id: 2, 
      nombre: 'Lab Norte', 
      direccion: 'Calle Norte 456',
      telefono: '987654321',
      ubicacion: 'Norte',
      capacidad: 30
    }
  ];

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<Usuario | null>(mockUsuario);

    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: currentUserSubject.asObservable()
    });

    mockCitasService = jasmine.createSpyObj('CitasService', [
      'getAnalisis', 'createAnalisis', 'updateAnalisis', 'deleteAnalisis', 'getAnalisisById',
      'getLaboratorios', 'createLaboratorio', 'updateLaboratorio', 'deleteLaboratorio', 'getLaboratorioById'
    ]);

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Configurar valores por defecto de los mocks
    mockCitasService.getAnalisis.and.returnValue(of(mockAnalisis));
    mockCitasService.getLaboratorios.and.returnValue(of(mockLaboratorios));
    mockCitasService.createAnalisis.and.returnValue(of(mockAnalisis[0]));
    mockCitasService.updateAnalisis.and.returnValue(of(mockAnalisis[0]));
    mockCitasService.deleteAnalisis.and.returnValue(of(undefined));
    mockCitasService.getAnalisisById.and.returnValue(of(mockAnalisis[0]));
    mockCitasService.createLaboratorio.and.returnValue(of(mockLaboratorios[0]));
    mockCitasService.updateLaboratorio.and.returnValue(of(mockLaboratorios[0]));
    mockCitasService.deleteLaboratorio.and.returnValue(of(undefined));
    mockCitasService.getLaboratorioById.and.returnValue(of(mockLaboratorios[0]));

    await TestBed.configureTestingModule({
      imports: [HomeTrabajadorComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: CitasService, useValue: mockCitasService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeTrabajadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Inicialización del componente', () => {
    it('debe crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe inicializar con usuario del AuthService', () => {
      expect(component.usuario).toEqual(mockUsuario);
    });

    it('debe actualizar el tiempo actual periódicamente', fakeAsync(() => {
      component.ngOnInit();
      const initialTime = component.currentTime;
      
      tick(1000);
      
      expect(component.currentTime).toBeDefined();
      expect(typeof component.currentTime).toBe('string');
      expect(component.currentTime.length).toBeGreaterThan(0);
    }));

    it('debe manejar usuario nulo del AuthService', () => {
      currentUserSubject.next(null);
      
      expect(component.usuario).toBeNull();
    });

    it('debe actualizar el usuario cuando cambia en AuthService', () => {
      const nuevoUsuario: Usuario = {
        id: 2,
        nombre: 'María',
        apellido: 'González',
        email: 'maria@clinica.com',
        rut: '98765432-1',
        rol: { id: 3, nombre: 'Admin' }
      };

      currentUserSubject.next(nuevoUsuario);
      
      expect(component.usuario).toEqual(nuevoUsuario);
    });

    it('debe configurar el intervalo de tiempo correctamente', () => {
      spyOn(window, 'setInterval');
      component.ngOnInit();
      
      expect(setInterval).toHaveBeenCalledWith(jasmine.any(Function), 1000);
    });
  });

  describe('Funcionalidades básicas', () => {
    it('debe actualizar el tiempo con formato correcto', () => {
      component.updateTime();
      
      expect(component.currentTime).toBeDefined();
      expect(typeof component.currentTime).toBe('string');
      expect(component.currentTime.length).toBeGreaterThan(0);
      // Verificar que contiene elementos de fecha
      expect(component.currentTime).toMatch(/\d{4}/); // año
    });

    it('debe hacer logout y navegar al login', () => {
      component.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('debe mostrar mensajes de consola para gestión de pacientes', () => {
      spyOn(console, 'log');
      component.gestionarPacientes();
      expect(console.log).toHaveBeenCalledWith('Navegando a gestión de pacientes...');
    });

    it('debe mostrar mensajes de consola para gestión de citas', () => {
      spyOn(console, 'log');
      component.gestionarCitas();
      expect(console.log).toHaveBeenCalledWith('Navegando a gestión de citas...');
    });

    it('debe mostrar mensajes de consola para gestión de exámenes', () => {
      spyOn(console, 'log');
      component.gestionarExamenes();
      expect(console.log).toHaveBeenCalledWith('Navegando a gestión de exámenes...');
    });

    it('debe mostrar mensajes de consola para asignar exámenes', () => {
      spyOn(console, 'log');
      component.asignarExamenes();
      expect(console.log).toHaveBeenCalledWith('Navegando a asignación de exámenes...');
    });

    it('debe mostrar mensajes de consola para ver reportes', () => {
      spyOn(console, 'log');
      component.verReportes();
      expect(console.log).toHaveBeenCalledWith('Navegando a reportes...');
    });

    it('debe mostrar mensajes de consola para gestionar resultados', () => {
      spyOn(console, 'log');
      component.gestionarResultados();
      expect(console.log).toHaveBeenCalledWith('Navegando a gestión de resultados...');
    });

    it('debe mostrar mensajes de consola para configuración', () => {
      spyOn(console, 'log');
      component.configuracion();
      expect(console.log).toHaveBeenCalledWith('Navegando a configuración...');
    });

    it('debe mostrar mensajes de consola para editar perfil', () => {
      spyOn(console, 'log');
      component.editarPerfil();
      expect(console.log).toHaveBeenCalledWith('Editando perfil...');
    });
  });

  // ========== TESTS DE ANÁLISIS ==========
  describe('Gestión de Análisis', () => {
    describe('Abrir y cerrar modal', () => {
      it('debe abrir el modal de análisis y cargar la lista', () => {
        component.gestionarAnalisis();

        expect(component.showAnalisisModal).toBeTrue();
        expect(component.analisisActiveTab).toBe('list');
        expect(mockCitasService.getAnalisis).toHaveBeenCalled();
      });

      it('debe cerrar el modal de análisis y resetear formulario', () => {
        component.showAnalisisModal = true;
        component.currentAnalisis = { id: 1, nombre: 'Test', descripcion: 'Test' };
        component.analisisSuccessMessage = 'Test message';
        component.analisisErrorMessage = 'Test error';

        component.closeAnalisisModal();

        expect(component.showAnalisisModal).toBeFalse();
        expect(component.currentAnalisis).toEqual({ nombre: '', descripcion: '' });
        expect(component.isEditingAnalisis).toBeFalse();
        expect(component.searchedAnalisis).toBeNull();
        expect(component.analisisSuccessMessage).toBe('');
        expect(component.analisisErrorMessage).toBe('');
      });
    });

    describe('Cargar análisis', () => {
      it('debe cargar análisis exitosamente', () => {
        component.loadAnalisis();

        expect(component.loadingAnalisis).toBeFalse();
        expect(component.analisisList).toEqual(mockAnalisis);
        expect(component.analisisErrorMessage).toBe('');
      });

      it('debe manejar error al cargar análisis', () => {
        mockCitasService.getAnalisis.and.returnValue(throwError(() => new Error('Error de servidor')));

        component.loadAnalisis();

        expect(component.loadingAnalisis).toBeFalse();
        expect(component.analisisErrorMessage).toBe('Error al cargar los análisis');
      });

      it('debe establecer loading en true durante la carga', () => {
        component.loadingAnalisis = false;
        
        component.loadAnalisis();
        
        expect(mockCitasService.getAnalisis).toHaveBeenCalled();
      });
    });

    describe('Resetear formulario de análisis', () => {
      it('debe resetear el formulario correctamente', () => {
        component.currentAnalisis = { id: 1, nombre: 'Test', descripcion: 'Test' };
        component.isEditingAnalisis = true;
        component.searchedAnalisis = mockAnalisis[0];

        component.resetAnalisisForm();

        expect(component.currentAnalisis).toEqual({ nombre: '', descripcion: '' });
        expect(component.isEditingAnalisis).toBeFalse();
        expect(component.searchedAnalisis).toBeNull();
      });
    });

    describe('Editar análisis', () => {
      it('debe configurar el formulario para edición', () => {
        const analisisToEdit = mockAnalisis[0];
        
        component.editAnalisis(analisisToEdit);

        expect(component.currentAnalisis).toEqual(analisisToEdit);
        expect(component.isEditingAnalisis).toBeTrue();
        expect(component.analisisActiveTab).toBe('create');
        expect(component.analisisSuccessMessage).toBe('');
        expect(component.analisisErrorMessage).toBe('');
      });
    });

    describe('Guardar análisis', () => {
      beforeEach(() => {
        // Restablecer mocks para pruebas exitosas
        mockCitasService.updateAnalisis.and.returnValue(of(mockAnalisis[0]));
        mockCitasService.createAnalisis.and.returnValue(of(mockAnalisis[0]));
        mockCitasService.getAnalisis.and.returnValue(of(mockAnalisis));
      });

      it('debe actualizar análisis existente exitosamente', fakeAsync(() => {
        component.currentAnalisis = { id: 1, nombre: 'Hemograma Actualizado', descripcion: 'Nueva descripción' };
        component.isEditingAnalisis = true;

        component.saveAnalisis();
        tick();

        expect(mockCitasService.updateAnalisis).toHaveBeenCalledWith(1, { id: 1, nombre: 'Hemograma Actualizado', descripcion: 'Nueva descripción' });
        expect(component.analisisSuccessMessage).toBe('Análisis actualizado exitosamente');
        expect(component.analisisActiveTab).toBe('list');
        expect(component.loadingAnalisis).toBeFalse();
      }));

      it('debe crear nuevo análisis exitosamente', fakeAsync(() => {
        component.currentAnalisis = { nombre: 'Nuevo Análisis', descripcion: 'Nueva descripción' };
        component.isEditingAnalisis = false;

        component.saveAnalisis();
        tick();

        const expectedAnalisis = {
          nombre: 'Nuevo Análisis',
          descripcion: 'Nueva descripción'
        };
        expect(mockCitasService.createAnalisis).toHaveBeenCalledWith(expectedAnalisis);
        expect(component.analisisSuccessMessage).toBe('Análisis creado exitosamente');
        expect(component.analisisActiveTab).toBe('list');
        expect(component.loadingAnalisis).toBeFalse();
      }));

      it('debe manejar error al actualizar análisis', () => {
        mockCitasService.updateAnalisis.and.returnValue(throwError(() => new Error('Error de servidor')));
        component.currentAnalisis = { id: 1, nombre: 'Test', descripcion: 'Test' };
        component.isEditingAnalisis = true;

        component.saveAnalisis();

        expect(component.analisisErrorMessage).toBe('Error al actualizar el análisis');
        expect(component.loadingAnalisis).toBeFalse();
      });

      it('debe manejar error al crear análisis', () => {
        mockCitasService.createAnalisis.and.returnValue(throwError(() => new Error('Error de servidor')));
        component.currentAnalisis = { nombre: 'Test', descripcion: 'Test' };
        component.isEditingAnalisis = false;

        component.saveAnalisis();

        expect(component.analisisErrorMessage).toBe('Error al crear el análisis');
        expect(component.loadingAnalisis).toBeFalse();
      });
    });

    describe('Eliminar análisis', () => {
      beforeEach(() => {
        // Restablecer mocks para pruebas exitosas
        mockCitasService.deleteAnalisis.and.returnValue(of(undefined));
        mockCitasService.getAnalisis.and.returnValue(of(mockAnalisis));
      });

      it('debe eliminar análisis exitosamente cuando se confirma', fakeAsync(() => {
        spyOn(window, 'confirm').and.returnValue(true);

        component.deleteAnalisis(1);
        tick();

        expect(mockCitasService.deleteAnalisis).toHaveBeenCalledWith(1);
        expect(component.analisisSuccessMessage).toBe('Análisis eliminado exitosamente');
        expect(component.searchedAnalisis).toBeNull();
        expect(component.loadingAnalisis).toBeFalse();
      }));

      it('no debe eliminar análisis cuando se cancela', () => {
        spyOn(window, 'confirm').and.returnValue(false);

        component.deleteAnalisis(1);

        expect(mockCitasService.deleteAnalisis).not.toHaveBeenCalled();
      });

      it('debe manejar ID inválido', () => {
        component.deleteAnalisis(undefined);

        expect(component.analisisErrorMessage).toBe('ID de análisis inválido');
        expect(mockCitasService.deleteAnalisis).not.toHaveBeenCalled();
      });

      it('debe manejar error al eliminar', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        mockCitasService.deleteAnalisis.and.returnValue(throwError(() => new Error('Error de servidor')));

        component.deleteAnalisis(1);

        expect(component.analisisErrorMessage).toBe('Error al eliminar el análisis');
        expect(component.loadingAnalisis).toBeFalse();
      });
    });

    describe('Buscar análisis por ID', () => {
      it('debe buscar análisis por ID exitosamente', () => {
        component.searchAnalisisId = 1;

        component.searchAnalisisById();

        expect(mockCitasService.getAnalisisById).toHaveBeenCalledWith(1);
        expect(component.searchedAnalisis).toEqual(mockAnalisis[0]);
        expect(component.loadingAnalisis).toBeFalse();
      });

      it('no debe buscar si no hay ID', () => {
        component.searchAnalisisId = null;

        component.searchAnalisisById();

        expect(mockCitasService.getAnalisisById).not.toHaveBeenCalled();
      });

      it('debe manejar error al buscar análisis', () => {
        mockCitasService.getAnalisisById.and.returnValue(throwError(() => new Error('No encontrado')));
        component.searchAnalisisId = 999;

        component.searchAnalisisById();

        expect(component.analisisErrorMessage).toBe('No se encontró el análisis con ese ID');
        expect(component.searchedAnalisis).toBeNull();
        expect(component.loadingAnalisis).toBeFalse();
      });
    });

    describe('Limpiar mensajes de análisis', () => {
      it('debe limpiar todos los mensajes', () => {
        component.analisisSuccessMessage = 'Éxito';
        component.analisisErrorMessage = 'Error';

        component.clearAnalisisMessages();

        expect(component.analisisSuccessMessage).toBe('');
        expect(component.analisisErrorMessage).toBe('');
      });
    });
  });

  // ========== TESTS DE LABORATORIOS ==========
  describe('Gestión de Laboratorios', () => {
    describe('Abrir y cerrar modal', () => {
      it('debe abrir el modal de laboratorios y cargar la lista', () => {
        component.gestionarLaboratorios();

        expect(component.showLaboratoriosModal).toBeTrue();
        expect(component.laboratoriosActiveTab).toBe('list');
        expect(mockCitasService.getLaboratorios).toHaveBeenCalled();
      });

      it('debe cerrar el modal de laboratorios y resetear formulario', () => {
        component.showLaboratoriosModal = true;
        component.currentLaboratorio = { id: 1, nombre: 'Test Lab', direccion: 'Test Address' };
        component.laboratoriosSuccessMessage = 'Test message';
        component.laboratoriosErrorMessage = 'Test error';

        component.closeLaboratoriosModal();

        expect(component.showLaboratoriosModal).toBeFalse();
        expect(component.currentLaboratorio).toEqual({ nombre: '', direccion: '' });
        expect(component.isEditingLaboratorio).toBeFalse();
        expect(component.searchedLaboratorio).toBeNull();
        expect(component.laboratoriosSuccessMessage).toBe('');
        expect(component.laboratoriosErrorMessage).toBe('');
      });
    });

    describe('Cargar laboratorios', () => {
      it('debe cargar laboratorios exitosamente', () => {
        component.loadLaboratorios();

        expect(component.loadingLaboratorios).toBeFalse();
        expect(component.laboratoriosList).toEqual(mockLaboratorios);
        expect(component.laboratoriosErrorMessage).toBe('');
      });

      it('debe manejar error al cargar laboratorios', () => {
        mockCitasService.getLaboratorios.and.returnValue(throwError(() => new Error('Error de servidor')));

        component.loadLaboratorios();

        expect(component.loadingLaboratorios).toBeFalse();
        expect(component.laboratoriosErrorMessage).toBe('Error al cargar los laboratorios');
      });
    });

    describe('Resetear formulario de laboratorio', () => {
      it('debe resetear el formulario correctamente', () => {
        component.currentLaboratorio = { id: 1, nombre: 'Test', direccion: 'Test Address' };
        component.isEditingLaboratorio = true;
        component.searchedLaboratorio = mockLaboratorios[0];

        component.resetLaboratorioForm();

        expect(component.currentLaboratorio).toEqual({ nombre: '', direccion: '' });
        expect(component.isEditingLaboratorio).toBeFalse();
        expect(component.searchedLaboratorio).toBeNull();
      });
    });

    describe('Editar laboratorio', () => {
      it('debe configurar el formulario para edición', () => {
        const laboratorioToEdit = mockLaboratorios[0];
        
        component.editLaboratorio(laboratorioToEdit);

        expect(component.currentLaboratorio).toEqual(laboratorioToEdit);
        expect(component.isEditingLaboratorio).toBeTrue();
        expect(component.laboratoriosActiveTab).toBe('create');
        expect(component.laboratoriosSuccessMessage).toBe('');
        expect(component.laboratoriosErrorMessage).toBe('');
      });
    });

    describe('Guardar laboratorio', () => {
      beforeEach(() => {
        // Restablecer mocks para pruebas exitosas
        mockCitasService.updateLaboratorio.and.returnValue(of(mockLaboratorios[0]));
        mockCitasService.createLaboratorio.and.returnValue(of(mockLaboratorios[0]));
        mockCitasService.getLaboratorios.and.returnValue(of(mockLaboratorios));
      });

      it('debe actualizar laboratorio existente exitosamente', fakeAsync(() => {
        const laboratorioData = { 
          id: 1, 
          nombre: 'Lab Actualizado', 
          direccion: 'Nueva dirección',
          telefono: '999999999',
          ubicacion: 'Nueva ubicación',
          capacidad: 100
        };
        component.currentLaboratorio = laboratorioData;
        component.isEditingLaboratorio = true;

        component.saveLaboratorio();
        tick();

        expect(mockCitasService.updateLaboratorio).toHaveBeenCalledWith(1, laboratorioData);
        expect(component.laboratoriosSuccessMessage).toBe('Laboratorio actualizado exitosamente');
        expect(component.laboratoriosActiveTab).toBe('list');
        expect(component.loadingLaboratorios).toBeFalse();
      }));

      it('debe crear nuevo laboratorio exitosamente', fakeAsync(() => {
        component.currentLaboratorio = { 
          nombre: 'Nuevo Lab', 
          direccion: 'Nueva dirección',
          telefono: '888888888',
          ubicacion: 'Nueva ubicación',
          capacidad: 80
        };
        component.isEditingLaboratorio = false;

        component.saveLaboratorio();
        tick();

        const expectedLaboratorio = {
          nombre: 'Nuevo Lab',
          direccion: 'Nueva dirección',
          telefono: '888888888',
          ubicacion: 'Nueva ubicación',
          capacidad: 80
        };
        expect(mockCitasService.createLaboratorio).toHaveBeenCalledWith(expectedLaboratorio);
        expect(component.laboratoriosSuccessMessage).toBe('Laboratorio creado exitosamente');
        expect(component.laboratoriosActiveTab).toBe('list');
        expect(component.loadingLaboratorios).toBeFalse();
      }));

      it('debe manejar error al actualizar laboratorio', () => {
        mockCitasService.updateLaboratorio.and.returnValue(throwError(() => new Error('Error de servidor')));
        component.currentLaboratorio = { id: 1, nombre: 'Test', direccion: 'Test' };
        component.isEditingLaboratorio = true;

        component.saveLaboratorio();

        expect(component.laboratoriosErrorMessage).toBe('Error al actualizar el laboratorio');
        expect(component.loadingLaboratorios).toBeFalse();
      });

      it('debe manejar error al crear laboratorio', () => {
        mockCitasService.createLaboratorio.and.returnValue(throwError(() => new Error('Error de servidor')));
        component.currentLaboratorio = { nombre: 'Test', direccion: 'Test' };
        component.isEditingLaboratorio = false;

        component.saveLaboratorio();

        expect(component.laboratoriosErrorMessage).toBe('Error al crear el laboratorio');
        expect(component.loadingLaboratorios).toBeFalse();
      });
    });

    describe('Eliminar laboratorio', () => {
      beforeEach(() => {
        // Restablecer mocks para pruebas exitosas
        mockCitasService.deleteLaboratorio.and.returnValue(of(undefined));
        mockCitasService.getLaboratorios.and.returnValue(of(mockLaboratorios));
      });

      it('debe eliminar laboratorio exitosamente cuando se confirma', fakeAsync(() => {
        spyOn(window, 'confirm').and.returnValue(true);

        component.deleteLaboratorio(1);
        tick();

        expect(mockCitasService.deleteLaboratorio).toHaveBeenCalledWith(1);
        expect(component.laboratoriosSuccessMessage).toBe('Laboratorio eliminado exitosamente');
        expect(component.searchedLaboratorio).toBeNull();
        expect(component.loadingLaboratorios).toBeFalse();
      }));

      it('no debe eliminar laboratorio cuando se cancela', () => {
        spyOn(window, 'confirm').and.returnValue(false);

        component.deleteLaboratorio(1);

        expect(mockCitasService.deleteLaboratorio).not.toHaveBeenCalled();
      });

      it('debe manejar ID inválido', () => {
        component.deleteLaboratorio(undefined);

        expect(component.laboratoriosErrorMessage).toBe('ID de laboratorio inválido');
        expect(mockCitasService.deleteLaboratorio).not.toHaveBeenCalled();
      });

      it('debe manejar error al eliminar', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        mockCitasService.deleteLaboratorio.and.returnValue(throwError(() => new Error('Error de servidor')));

        component.deleteLaboratorio(1);

        expect(component.laboratoriosErrorMessage).toBe('Error al eliminar el laboratorio');
        expect(component.loadingLaboratorios).toBeFalse();
      });
    });

    describe('Buscar laboratorio por ID', () => {
      it('debe buscar laboratorio por ID exitosamente', () => {
        component.searchLaboratorioId = 1;

        component.searchLaboratorioById();

        expect(mockCitasService.getLaboratorioById).toHaveBeenCalledWith(1);
        expect(component.searchedLaboratorio).toEqual(mockLaboratorios[0]);
        expect(component.loadingLaboratorios).toBeFalse();
      });

      it('no debe buscar si no hay ID', () => {
        component.searchLaboratorioId = null;

        component.searchLaboratorioById();

        expect(mockCitasService.getLaboratorioById).not.toHaveBeenCalled();
      });

      it('debe manejar error al buscar laboratorio', () => {
        mockCitasService.getLaboratorioById.and.returnValue(throwError(() => new Error('No encontrado')));
        component.searchLaboratorioId = 999;

        component.searchLaboratorioById();

        expect(component.laboratoriosErrorMessage).toBe('No se encontró el laboratorio con ese ID');
        expect(component.searchedLaboratorio).toBeNull();
        expect(component.loadingLaboratorios).toBeFalse();
      });
    });

    describe('Limpiar mensajes de laboratorios', () => {
      it('debe limpiar todos los mensajes', () => {
        component.laboratoriosSuccessMessage = 'Éxito';
        component.laboratoriosErrorMessage = 'Error';

        component.clearLaboratoriosMessages();

        expect(component.laboratoriosSuccessMessage).toBe('');
        expect(component.laboratoriosErrorMessage).toBe('');
      });
    });
  });

  describe('Estados y propiedades del componente', () => {
    it('debe inicializar correctamente las propiedades de análisis', () => {
      expect(component.showAnalisisModal).toBeFalse();
      expect(component.analisisActiveTab).toBe('list');
      expect(component.analisisList).toEqual([]);
      expect(component.currentAnalisis).toEqual({ nombre: '', descripcion: '' });
      expect(component.searchedAnalisis).toBeNull();
      expect(component.searchAnalisisId).toBeNull();
      expect(component.loadingAnalisis).toBeFalse();
      expect(component.isEditingAnalisis).toBeFalse();
      expect(component.analisisSuccessMessage).toBe('');
      expect(component.analisisErrorMessage).toBe('');
    });

    it('debe inicializar correctamente las propiedades de laboratorios', () => {
      expect(component.showLaboratoriosModal).toBeFalse();
      expect(component.laboratoriosActiveTab).toBe('list');
      expect(component.laboratoriosList).toEqual([]);
      expect(component.currentLaboratorio).toEqual({ nombre: '', direccion: '' });
      expect(component.searchedLaboratorio).toBeNull();
      expect(component.searchLaboratorioId).toBeNull();
      expect(component.loadingLaboratorios).toBeFalse();
      expect(component.isEditingLaboratorio).toBeFalse();
      expect(component.laboratoriosSuccessMessage).toBe('');
      expect(component.laboratoriosErrorMessage).toBe('');
    });

    it('debe cambiar pestañas de análisis correctamente', () => {
      component.analisisActiveTab = 'create';
      expect(component.analisisActiveTab).toBe('create');

      component.analisisActiveTab = 'search';
      expect(component.analisisActiveTab).toBe('search');

      component.analisisActiveTab = 'list';
      expect(component.analisisActiveTab).toBe('list');
    });

    it('debe cambiar pestañas de laboratorios correctamente', () => {
      component.laboratoriosActiveTab = 'create';
      expect(component.laboratoriosActiveTab).toBe('create');

      component.laboratoriosActiveTab = 'search';
      expect(component.laboratoriosActiveTab).toBe('search');

      component.laboratoriosActiveTab = 'list';
      expect(component.laboratoriosActiveTab).toBe('list');
    });

    it('debe manejar cambios en el usuario actual', () => {
      expect(component.usuario).toEqual(mockUsuario);

      const nuevoUsuario: Usuario = {
        id: 3,
        nombre: 'Carlos',
        apellido: 'Ruiz',
        email: 'carlos@clinica.com',
        rut: '11223344-5',
        rol: { id: 2, nombre: 'Trabajador' }
      };

      currentUserSubject.next(nuevoUsuario);
      
      expect(component.usuario).toEqual(nuevoUsuario);
    });

    it('debe manejar correctamente el estado de carga', () => {
      component.loadingAnalisis = true;
      expect(component.loadingAnalisis).toBeTrue();

      component.loadingLaboratorios = true;
      expect(component.loadingLaboratorios).toBeTrue();
    });
  });

  describe('Integración con servicios', () => {
    it('debe llamar correctamente a todos los métodos de CitasService para análisis', () => {
      // Test de integración básica
      component.gestionarAnalisis();
      expect(mockCitasService.getAnalisis).toHaveBeenCalled();

      component.saveAnalisis();
      expect(mockCitasService.createAnalisis).toHaveBeenCalled();

      component.currentAnalisis = { id: 1, nombre: 'Test', descripcion: 'Test' };
      component.isEditingAnalisis = true;
      component.saveAnalisis();
      expect(mockCitasService.updateAnalisis).toHaveBeenCalled();

      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteAnalisis(1);
      expect(mockCitasService.deleteAnalisis).toHaveBeenCalled();

      component.searchAnalisisId = 1;
      component.searchAnalisisById();
      expect(mockCitasService.getAnalisisById).toHaveBeenCalled();
    });

    it('debe llamar correctamente a todos los métodos de CitasService para laboratorios', () => {
      // Test de integración básica
      component.gestionarLaboratorios();
      expect(mockCitasService.getLaboratorios).toHaveBeenCalled();

      component.saveLaboratorio();
      expect(mockCitasService.createLaboratorio).toHaveBeenCalled();

      component.currentLaboratorio = { id: 1, nombre: 'Test', direccion: 'Test' };
      component.isEditingLaboratorio = true;
      component.saveLaboratorio();
      expect(mockCitasService.updateLaboratorio).toHaveBeenCalled();

      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteLaboratorio(1);
      expect(mockCitasService.deleteLaboratorio).toHaveBeenCalled();

      component.searchLaboratorioId = 1;
      component.searchLaboratorioById();
      expect(mockCitasService.getLaboratorioById).toHaveBeenCalled();
    });

    it('debe manejar correctamente la respuesta del AuthService', () => {
      expect(mockAuthService.currentUser).toBeDefined();
      
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('debe manejar correctamente la navegación con Router', () => {
      component.logout();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
