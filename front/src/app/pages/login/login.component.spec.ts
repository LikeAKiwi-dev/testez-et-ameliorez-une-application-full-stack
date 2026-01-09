import { describe, it, expect, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LoginComponent } from './login.component';
import { AuthService } from '../../core/service/auth.service';
import { SessionService } from 'src/app/core/service/session.service';
import { SessionInformation } from 'src/app/core/models/sessionInformation.interface';

describe('LoginComponent (integration)', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;

  const routerMock = { navigate: jest.fn() };

  const authServiceMock = {
    login: jest.fn(),
  };

  const sessionServiceMock = {
    logIn: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      // LoginComponent est standalone => il va dans imports
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should disable submit button when form is invalid (required fields)', () => {
    expect(component.form.invalid).toBe(true);

    const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button).not.toBeNull();
    expect(button!.disabled).toBe(true);
  });

  it('should login successfully: call sessionService.logIn and navigate to /sessions', () => {
    const response = { token: 'abc' } as unknown as SessionInformation;
    authServiceMock.login.mockReturnValue(of(response));

    component.form.setValue({ email: 'test@test.com', password: '123' });
    expect(component.form.valid).toBe(true);

    component.submit();

    expect(authServiceMock.login).toHaveBeenCalledWith({ email: 'test@test.com', password: '123' });
    expect(sessionServiceMock.logIn).toHaveBeenCalledWith(response);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
    expect(component.onError).toBe(false);
  });

  it('should set onError to true and display error message when login fails', () => {
    authServiceMock.login.mockReturnValue(throwError(() => new Error('bad credentials')));

    component.form.setValue({ email: 'test@test.com', password: '123' });
    component.submit();

    expect(component.onError).toBe(true);

    fixture.detectChanges();
    const errorEl: HTMLElement | null = fixture.nativeElement.querySelector('p.error');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toContain('An error occurred');

    expect(sessionServiceMock.logIn).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
