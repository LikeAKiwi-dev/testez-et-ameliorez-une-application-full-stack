import { describe, it, expect, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ListComponent } from './list.component';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { Session } from '../../../../core/models/session.interface';

import { provideRouter } from '@angular/router';
import { SessionInformation } from '../../../../core/models/sessionInformation.interface';

describe('ListComponent (integration)', () => {
  const sessionsMock: Session[] = [
    {
      id: 1,
      name: 'Session 1',
      description: 'Desc 1',
      date: new Date().toISOString(),
    } as unknown as Session,
  ];

  const sessionApiMock = {
    all: jest.fn(),
  };

  const makeSessionInfo = (admin: boolean): SessionInformation => ({
    id: 1,
    admin,
    token: 'fake-token',
    type: admin ? 'ADMIN' : 'USER',
    username: 'test@test.com',
    firstName: 'Test',
    lastName: 'User',
  });

  const sessionServiceMock: Partial<SessionService> = {
    sessionInformation: makeSessionInfo(true),
  };

  const createComponent = async (
    admin: boolean
  ): Promise<ComponentFixture<ListComponent>> => {
    sessionApiMock.all.mockReturnValue(of(sessionsMock));
    sessionServiceMock.sessionInformation = makeSessionInfo(admin);

    await TestBed.configureTestingModule({
      imports: [ListComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: SessionService, useValue: sessionServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ListComponent);
    fixture.detectChanges();

    return fixture;
  };

  it('should show Create and Edit buttons when user is admin', async () => {
    const fixture = await createComponent(true);

    expect(sessionApiMock.all).toHaveBeenCalled();

    const createBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[routerLink="create"]');
    expect(createBtn).not.toBeNull();

    const editBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[ng-reflect-router-link*="update"]');
    expect(editBtn).not.toBeNull();

    const detailBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[ng-reflect-router-link*="detail"]');
    expect(detailBtn).not.toBeNull();
  });

  it('should hide Create and Edit buttons when user is not admin, but still show Detail', async () => {
    const fixture = await createComponent(false);

    const createBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[routerLink="create"]');
    expect(createBtn).toBeNull();

    const editBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[ng-reflect-router-link*="update"]');
    expect(editBtn).toBeNull();

    const detailBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[ng-reflect-router-link*="detail"]');
    expect(detailBtn).not.toBeNull();
  });
});
