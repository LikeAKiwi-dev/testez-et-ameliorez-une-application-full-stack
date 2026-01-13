import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('login() should POST', () => {
    const payload = { email: 'a@a.com', password: '123' } as any;

    service.login(payload).subscribe();

    const req = httpMock.expectOne((r) => r.method === 'POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1, admin: true });
  });

  it('register() should POST', () => {
    const payload = { email: 'a@a.com', firstName: 'A', lastName: 'B', password: '123' } as any;

    service.register(payload).subscribe();

    const req = httpMock.expectOne((r) => r.method === 'POST');
    expect(req.request.body).toEqual(payload);
    req.flush(null);
  });
});
