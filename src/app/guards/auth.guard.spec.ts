import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Crear mocks de route y state
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/home-paciente' } as RouterStateSnapshot;
  });

  it('debe crear el guard', () => {
    expect(guard).toBeTruthy();
  });

  it('debe permitir acceso cuando usuario está logueado', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);

    const result = guard.canActivate(mockRoute, mockState);

    expect(result).toBeTrue();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('debe denegar acceso cuando usuario NO está logueado', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    const result = guard.canActivate(mockRoute, mockState);

    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/home-paciente' }
    });
  });

  it('debe navegar a login con returnUrl correcta', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    mockState.url = '/home-trabajador';

    guard.canActivate(mockRoute, mockState);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/home-trabajador' }
    });
  });

  it('debe navegar a login con returnUrl para ruta protegida', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    mockState.url = '/agendar-cita';

    guard.canActivate(mockRoute, mockState);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/agendar-cita' }
    });
  });

  it('debe verificar estado de login en cada activación', () => {
    // Primera llamada - usuario logueado
    mockAuthService.isLoggedIn.and.returnValue(true);
    let result = guard.canActivate(mockRoute, mockState);
    expect(result).toBeTrue();

    // Segunda llamada - usuario deslogueado
    mockAuthService.isLoggedIn.and.returnValue(false);
    result = guard.canActivate(mockRoute, mockState);
    expect(result).toBeFalse();

    // Verificar que se llamó isLoggedIn ambas veces
    expect(mockAuthService.isLoggedIn).toHaveBeenCalledTimes(2);
  });

  it('debe manejar URLs complejas con parámetros', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    mockState.url = '/consultar-citas?fecha=2025-11-18&estado=pendiente';

    guard.canActivate(mockRoute, mockState);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/consultar-citas?fecha=2025-11-18&estado=pendiente' }
    });
  });

  it('debe manejar URL raíz', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    mockState.url = '/';

    guard.canActivate(mockRoute, mockState);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/' }
    });
  });
});
