import { describe, it, expect, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';

import { DetailComponent } from './detail.component';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { SessionService } from '../../../../core/service/session.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {SessionInformation} from "../../../../core/models/sessionInformation.interface";

describe('DetailComponent (integration)', () => {
  let fixture: ComponentFixture<DetailComponent>;
  let component: DetailComponent;

  const sessionApiMock = {
    detail: jest.fn(),
    delete: jest.fn(),
    participate: jest.fn(),
    unParticipate: jest.fn(),
  };

  const teacherServiceMock = {
    detail: jest.fn(),
  };

  const snackBarMock = {
    open: jest.fn(),
  };

  const makeActivatedRoute = (id: string) => ({
    snapshot: {
      paramMap: {
        get: (key: string) => (key === 'id' ? id : null),
      },
    },
  });

  const createComponent = async (opts: { admin: boolean; userId: number; sessionUsers: number[] }) => {
    const { admin, userId, sessionUsers } = opts;

    const sessionMock = {
      id: 1,
      name: 'session name',
      description: 'desc',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      teacher_id: 77,
      users: sessionUsers,
    };

    const teacherMock = { id: 77, firstName: 'Ada', lastName: 'Lovelace' };

    sessionApiMock.detail.mockReturnValue(of(sessionMock));
    teacherServiceMock.detail.mockReturnValue(of(teacherMock));

    sessionApiMock.delete.mockReturnValue(of(void 0));
    sessionApiMock.participate.mockReturnValue(of(void 0));
    sessionApiMock.unParticipate.mockReturnValue(of(void 0));

    const sessionInfo: SessionInformation = {
      id: userId,
      admin,
      token: 'fake-token',
      type: admin ? 'ADMIN' : 'USER',
      username: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
    };

    const sessionServiceMock: Partial<SessionService> = {
      sessionInformation: sessionInfo,
    };

    await TestBed.configureTestingModule({
      imports: [DetailComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: makeActivatedRoute('12') },
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load session + teacher and show Delete button when admin', async () => {
    await createComponent({ admin: true, userId: 5, sessionUsers: [1, 2] });

    expect(sessionApiMock.detail).toHaveBeenCalledWith('12');
    expect(teacherServiceMock.detail).toHaveBeenCalledWith('77');

    fixture.detectChanges();

    const deleteBtn = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Delete')
    );
    expect(deleteBtn).toBeTruthy();
  });

  it('should show Participate when not admin and user is NOT participating', async () => {
    await createComponent({ admin: false, userId: 5, sessionUsers: [1, 2] });

    fixture.detectChanges();

    const participateBtn = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Participate')
    );
    expect(participateBtn).toBeTruthy();

    const dontBtn = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Do not participate')
    );
    expect(dontBtn).toBeFalsy();
  });

  it('should show Do not participate when not admin and user IS participating', async () => {
    await createComponent({ admin: false, userId: 5, sessionUsers: [5, 9] });

    fixture.detectChanges();

    const dontBtn = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Do not participate')
    );
    expect(dontBtn).toBeTruthy();
  });

  it('should call delete() and navigate when admin calls delete()', async () => {
    await createComponent({ admin: true, userId: 5, sessionUsers: [1, 2] });

    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.delete();

    expect(sessionApiMock.delete).toHaveBeenCalledWith('12');
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });
});
