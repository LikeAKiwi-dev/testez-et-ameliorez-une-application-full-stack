import { describe, it, expect, beforeEach } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SessionService } from './session.service';
import {SessionInformation} from "../models/sessionInformation.interface";

const sessionInfo: SessionInformation = {
  id: 1,
  admin: true,
  token: 'fake-token',
  type: 'ADMIN',
  username: 'admin@test.com',
  firstName: 'Admin',
  lastName: 'User',
};

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
    (service).sessionInformation = undefined;

    const value = await firstValueFrom(service.$isLogged());
    expect(value).toBe(false);
  });

  it('logIn() should set sessionInformation and $isLogged() should be true', async () => {

    service.logIn(sessionInfo);

    expect(service.sessionInformation).toEqual(sessionInfo);

    const value = await firstValueFrom(service.$isLogged());
    expect(value).toBe(true);
  });


  it('logOut() should clear sessionInformation and $isLogged() should be false', async () => {

    service.logIn(sessionInfo);
    service.logOut();

    expect(service.sessionInformation).toBeUndefined();

    const value = await firstValueFrom(service.$isLogged());
    expect(value).toBe(false);
  });

});
