import { describe, it, expect } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';


import { SessionApiService } from './session-api.service';
import { Session } from '../models/session.interface';

describe('SessionApiService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SessionApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });


    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('all() should GET api/session', () => {
    const mock: Session[] = [] as unknown as Session[];

    service.all().subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('detail() should GET api/session/:id', () => {
    const mock: Session = { id: 12 } as unknown as Session;

    service.detail('12').subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne('api/session/12');
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('delete() should DELETE api/session/:id', () => {
    service.delete('9').subscribe((res) => {
      expect(res).toBeUndefined();
    });

    const req = httpMock.expectOne('api/session/9');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('create() should POST api/session with body', () => {
    const payload: Session = { name: 'Yoga' } as unknown as Session;

    service.create(payload).subscribe((res) => {
      expect(res).toEqual(payload);
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(payload);
  });

  it('update() should PUT api/session/:id with body', () => {
    const payload: Session = { name: 'Yoga', description: 'v2' } as unknown as Session;

    service.update('7', payload).subscribe((res) => {
      expect(res).toEqual(payload);
    });

    const req = httpMock.expectOne('api/session/7');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(payload);
  });

  it('participate() should POST api/session/:id/participate/:userId with null body', () => {
    service.participate('3', '42').subscribe((res) => {
      expect(res).toBeUndefined();
    });

    const req = httpMock.expectOne('api/session/3/participate/42');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(null);
  });

  it('unParticipate() should DELETE api/session/:id/participate/:userId', () => {
    service.unParticipate('3', '42').subscribe((res) => {
      expect(res).toBeUndefined();
    });

    const req = httpMock.expectOne('api/session/3/participate/42');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
