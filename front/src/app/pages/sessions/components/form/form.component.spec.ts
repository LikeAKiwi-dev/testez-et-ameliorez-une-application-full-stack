import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';

import { FormComponent } from './form.component';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {SessionInformation} from "../../../../core/models/sessionInformation.interface";

describe('FormComponent (integration)', () => {
  let fixture: ComponentFixture<FormComponent>;
  let component: FormComponent;

  const sessionApiMock = {
    detail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const teacherServiceMock = {
    all: jest.fn(),
  };

  const snackBarMock = {
    open: jest.fn(),
  };

  const makeActivatedRoute = (id?: string) => ({
    snapshot: {
      paramMap: {
        get: (key: string) => (key === 'id' ? id ?? null : null),
      },
    },
  });

  const createComponent = async (opts: { admin: boolean; update?: boolean }) => {
    TestBed.resetTestingModule();

    const { admin, update } = opts;
    const routerMock = {
      url: update ? '/sessions/update/12' : '/sessions/create',
      navigate: jest.fn(),
    };

    const sessionInfo: SessionInformation = {
      id: 1,
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

    teacherServiceMock.all.mockReturnValue(of([{ id: 1, firstName: 'Ada', lastName: 'Lovelace' }]));

    if (update) {
      sessionApiMock.detail.mockReturnValue(
        of({
          id: 12,
          name: 'Yoga',
          description: 'desc',
          date: new Date().toISOString(),
          teacher_id: 1,
          users: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
      sessionApiMock.update.mockReturnValue(of({}));
    } else {
      sessionApiMock.create.mockReturnValue(of({}));
    }

    await TestBed.configureTestingModule({
      imports: [FormComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: makeActivatedRoute(update ? '12' : undefined) },
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    return { routerMock };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to /sessions if user is not admin', async () => {
    const { routerMock } = await createComponent({ admin: false });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  it('should init form in create mode and call create()', async () => {
    const { routerMock } = await createComponent({ admin: true });

    expect(component.sessionForm).toBeTruthy();

    component.sessionForm!.setValue({
      name: 'Yoga',
      date: '2024-01-01',
      teacher_id: 1,
      description: 'desc',
    });

    component.submit();

    expect(sessionApiMock.create).toHaveBeenCalled();

    expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should load session and update when in update mode', async () => {
    const { routerMock } = await createComponent({ admin: true, update: true });

    expect(sessionApiMock.detail).toHaveBeenCalledWith('12');
    expect(component.onUpdate).toBe(true);
    expect(component.sessionForm).toBeTruthy();

    component.sessionForm!.setValue({
      name: 'Yoga v2',
      date: '2024-01-02',
      teacher_id: 1,
      description: 'updated',
    });

    component.submit();

    expect(sessionApiMock.update).toHaveBeenCalledWith(
      '12',
      {
        name: 'Yoga v2',
        date: '2024-01-02',
        teacher_id: 1,
        description: 'updated',
      }
    );

    expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
  });
});
