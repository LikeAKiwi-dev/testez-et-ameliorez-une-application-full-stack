import { describe, it, expect, beforeEach } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionService],
    });

    service = TestBed.inject(SessionService);

    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('$isLogged() should be false when not logged', async () => {
    // force état initial
    (service as any).sessionInformation = undefined;

    const value = await firstValueFrom(service.$isLogged());
    expect(value).toBe(false);
  });

  it('logIn() should set sessionInformation and $isLogged() should be true', async () => {
    const info = { id: 1, admin: true } as any;

    service.logIn(info);

    expect((service as any).sessionInformation).toEqual(info);

    const value = await firstValueFrom(service.$isLogged());
    expect(value).toBe(true);
  });

  it('logOut() should clear sessionInformation and $isLogged() should be false', async () => {
    const info = { id: 1, admin: true } as any;

    service.logIn(info);
    service.logOut();

    expect((service as any).sessionInformation).toBeFalsy();

    const value = await firstValueFrom(service.$isLogged());
    expect(value).toBe(false);
  });
});
