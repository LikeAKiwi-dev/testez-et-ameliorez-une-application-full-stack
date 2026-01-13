import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { of, firstValueFrom } from 'rxjs';

import { AppComponent } from './app.component';
import { SessionService } from './core/service/session.service';
import { AuthService } from './core/service/auth.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  const sessionServiceMock = {
    $isLogged: jest.fn(),
    logOut: jest.fn(),
  };

  const authServiceMock = {
    login: jest.fn(),
    register: jest.fn(),
  };

  const createComponent = async (logged: boolean) => {
    TestBed.resetTestingModule();

    sessionServiceMock.$isLogged.mockReturnValue(of(logged));

    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    // volontairement : pas de detectChanges()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create', async () => {
    await createComponent(false);
    expect(component).toBeTruthy();
  });

  it('should expose $isLogged observable returning true/false', async () => {
    await createComponent(true);
    await expect(firstValueFrom(component.$isLogged())).resolves.toBe(true);

    await createComponent(false);
    await expect(firstValueFrom(component.$isLogged())).resolves.toBe(false);
  });

  it('should call logout() and navigate', async () => {
    await createComponent(true);

    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true as any);

    component.logout();

    expect(sessionServiceMock.logOut).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalled();
  });

});
