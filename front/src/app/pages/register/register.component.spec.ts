import { describe, it, expect, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/service/auth.service';

describe('RegisterComponent (integration)', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;

  const routerMock = { navigate: jest.fn() };
  const authServiceMock = { register: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      // Standalone => imports (pas declarations)
      imports: [RegisterComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should disable submit button when form is invalid (required fields)', () => {
    expect(component.form.invalid).toBe(true);

    const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button).not.toBeNull();
    expect(button!.disabled).toBe(true);

    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('should register successfully and navigate to /login', () => {
    authServiceMock.register.mockReset();
    authServiceMock.register.mockReturnValue(of(void 0));
    component.onError = false;


    component.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      password: '123',
    });

    expect(component.form.valid).toBe(true);

    component.submit();


    expect(authServiceMock.register).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      password: '123',
    });

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.onError).toBe(false);
  });

  it('should set onError to true and display error message when register fails', () => {
    authServiceMock.register.mockReturnValue(throwError(() => new Error('error')));

    component.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      password: '123',
    });

    component.submit();

    expect(component.onError).toBe(true);

    fixture.detectChanges();
    const errorEl: HTMLElement | null = fixture.nativeElement.querySelector('.error');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toContain('An error occurred');

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
