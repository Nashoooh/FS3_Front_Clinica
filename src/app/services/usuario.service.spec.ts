import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUsuarios}/usuarios`;

  const mockUsuario: Usuario = {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@example.com',
    rut: '12345678-9',
    rol: { id: 1, nombre: 'Paciente' }
  };

  const mockUsuarios: Usuario[] = [
    mockUsuario,
    {
      id: 2,
      nombre: 'María',
      apellido: 'González',
      email: 'maria@example.com',
      rut: '98765432-1',
      rol: { id: 2, nombre: 'Trabajador' }
    }
  ];

  const mockPacientes: Usuario[] = [
    mockUsuario,
    {
      id: 3,
      nombre: 'Pedro',
      apellido: 'Martínez',
      email: 'pedro@example.com',
      rut: '11111111-1',
      rol: { id: 1, nombre: 'Paciente' }
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsuarioService]
    });
    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllUsuarios', () => {
    it('debe obtener todos los usuarios', () => {
      service.getAllUsuarios().subscribe(usuarios => {
        expect(usuarios).toEqual(mockUsuarios);
        expect(usuarios.length).toBe(2);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuarios);
    });

    it('debe manejar error al obtener usuarios', () => {
      const errorMessage = 'Error al obtener usuarios';

      service.getAllUsuarios().subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });

    it('debe retornar array vacío cuando no hay usuarios', () => {
      service.getAllUsuarios().subscribe(usuarios => {
        expect(usuarios).toEqual([]);
        expect(usuarios.length).toBe(0);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('getUsuarioById', () => {
    it('debe obtener un usuario por ID', () => {
      const userId = 1;

      service.getUsuarioById(userId).subscribe(usuario => {
        expect(usuario).toEqual(mockUsuario);
        expect(usuario.id).toBe(userId);
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuario);
    });

    it('debe manejar error 404 cuando el usuario no existe', () => {
      const userId = 999;

      service.getUsuarioById(userId).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      req.flush('Usuario no encontrado', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createUsuario', () => {
    it('debe crear un nuevo usuario', () => {
      const nuevoUsuario: Usuario = {
        nombre: 'Carlos',
        apellido: 'López',
        email: 'carlos@example.com',
        rut: '22222222-2',
        rol: { id: 1, nombre: 'Paciente' }
      };

      const usuarioCreado: Usuario = { ...nuevoUsuario, id: 4 };

      service.createUsuario(nuevoUsuario).subscribe(usuario => {
        expect(usuario).toEqual(usuarioCreado);
        expect(usuario.id).toBeDefined();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevoUsuario);
      req.flush(usuarioCreado);
    });

    it('debe manejar error de validación al crear usuario', () => {
      const usuarioInvalido: Usuario = {
        nombre: '',
        apellido: '',
        email: 'invalid',
        rut: '123',
        rol: { id: 1, nombre: 'Paciente' }
      };

      service.createUsuario(usuarioInvalido).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Datos inválidos', { status: 400, statusText: 'Bad Request' });
    });

    it('debe manejar error de email duplicado', () => {
      const usuarioDuplicado: Usuario = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com', // Email ya existe
        rut: '33333333-3',
        rol: { id: 1, nombre: 'Paciente' }
      };

      service.createUsuario(usuarioDuplicado).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(409);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Email ya existe', { status: 409, statusText: 'Conflict' });
    });
  });

  describe('updateUsuario', () => {
    it('debe actualizar un usuario existente', () => {
      const userId = 1;
      const usuarioActualizado: Usuario = {
        ...mockUsuario,
        nombre: 'Juan Carlos',
        apellido: 'Pérez García'
      };

      service.updateUsuario(userId, usuarioActualizado).subscribe(usuario => {
        expect(usuario).toEqual(usuarioActualizado);
        expect(usuario.nombre).toBe('Juan Carlos');
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(usuarioActualizado);
      req.flush(usuarioActualizado);
    });

    it('debe manejar error 404 al actualizar usuario inexistente', () => {
      const userId = 999;
      const usuario: Usuario = { ...mockUsuario };

      service.updateUsuario(userId, usuario).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      req.flush('Usuario no encontrado', { status: 404, statusText: 'Not Found' });
    });

    it('debe manejar error de validación al actualizar', () => {
      const userId = 1;
      const usuarioInvalido: Usuario = {
        ...mockUsuario,
        email: 'invalid-email'
      };

      service.updateUsuario(userId, usuarioInvalido).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      req.flush('Email inválido', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('deleteUsuario', () => {
    it('debe eliminar un usuario existente', () => {
      const userId = 1;

      service.deleteUsuario(userId).subscribe(response => {
        expect(response).toBeDefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('debe manejar error 404 al eliminar usuario inexistente', () => {
      const userId = 999;

      service.deleteUsuario(userId).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      req.flush('Usuario no encontrado', { status: 404, statusText: 'Not Found' });
    });

    it('debe manejar error al eliminar usuario con referencias', () => {
      const userId = 1;

      service.deleteUsuario(userId).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(409);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      req.flush('Usuario tiene referencias', { status: 409, statusText: 'Conflict' });
    });
  });

  describe('getPacientes', () => {
    it('debe obtener todos los pacientes', () => {
      service.getPacientes().subscribe(pacientes => {
        expect(pacientes).toEqual(mockPacientes);
        expect(pacientes.length).toBe(2);
        expect(pacientes.every(p => p.rol?.nombre === 'Paciente')).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/pacientes`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPacientes);
    });

    it('debe manejar error al obtener pacientes', () => {
      service.getPacientes().subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/pacientes`);
      req.flush('Error del servidor', { status: 500, statusText: 'Server Error' });
    });

    it('debe retornar array vacío cuando no hay pacientes', () => {
      service.getPacientes().subscribe(pacientes => {
        expect(pacientes).toEqual([]);
        expect(pacientes.length).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/pacientes`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('debe filtrar solo usuarios con rol paciente', () => {
      service.getPacientes().subscribe(pacientes => {
        expect(pacientes.length).toBe(2);
        pacientes.forEach(paciente => {
          expect(paciente.rol?.id).toBe(1);
          expect(paciente.rol?.nombre).toBe('Paciente');
        });
      });

      const req = httpMock.expectOne(`${apiUrl}/pacientes`);
      req.flush(mockPacientes);
    });
  });

  describe('Manejo de errores de red', () => {
    it('debe manejar error de red al obtener usuarios', () => {
      service.getAllUsuarios().subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.error).toBeDefined();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.error(new ProgressEvent('Network error'));
    });

    it('debe manejar timeout al obtener usuarios', () => {
      service.getAllUsuarios().subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(0);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.error(new ProgressEvent('Timeout'), { status: 0, statusText: 'Unknown Error' });
    });
  });

  describe('Validación de datos', () => {
    it('debe enviar todos los campos requeridos al crear usuario', () => {
      const nuevoUsuario: Usuario = {
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        rut: '12345678-9',
        rol: { id: 1, nombre: 'Paciente' }
      };

      service.createUsuario(nuevoUsuario).subscribe();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.body.nombre).toBeDefined();
      expect(req.request.body.apellido).toBeDefined();
      expect(req.request.body.email).toBeDefined();
      expect(req.request.body.rut).toBeDefined();
      expect(req.request.body.rol).toBeDefined();
      req.flush({ ...nuevoUsuario, id: 5 });
    });

    it('debe enviar ID correcto al actualizar usuario', () => {
      const userId = 1;
      const usuario: Usuario = { ...mockUsuario };

      service.updateUsuario(userId, usuario).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      expect(req.request.url).toContain(`/${userId}`);
      req.flush(usuario);
    });

    it('debe enviar ID correcto al eliminar usuario', () => {
      const userId = 1;

      service.deleteUsuario(userId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      expect(req.request.url).toContain(`/${userId}`);
      req.flush({});
    });

    it('debe enviar ID correcto al obtener usuario', () => {
      const userId = 1;

      service.getUsuarioById(userId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${userId}`);
      expect(req.request.url).toContain(`/${userId}`);
      req.flush(mockUsuario);
    });
  });
});
