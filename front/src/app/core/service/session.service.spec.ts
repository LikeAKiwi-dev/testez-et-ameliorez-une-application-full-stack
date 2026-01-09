import { describe, it, expect, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { SessionApiService } from './session-api.service';

describe('SessionService', () => {
  let service: SessionService;

  const sessionApiMock = {
    all: jest.fn(),
    detail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    participate: jest.fn(),
    unParticipate: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SessionService,
        { provide: SessionApiService, useValue: sessionApiMock },
      ],
    });

    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
