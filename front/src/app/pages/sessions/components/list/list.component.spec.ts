import { describe, it, expect, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ListComponent } from './list.component';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { Session } from '../../../../core/models/session.interface';

import { provideRouter } from '@angular/router';


describe('ListComponent (integration)', () => {
  let fixture: ComponentFixture<ListComponent>;
  let component: ListComponent;

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

  const sessionServiceMock: Partial<SessionService> = {
    sessionInformation: { admin: true } as any,
  };

  const createComponent = async (admin: boolean) => {
    sessionApiMock.all.mockReturnValue(of(sessionsMock));
    (sessionServiceMock as any).sessionInformation = { admin } as any;

    await TestBed.configureTestingModule({
      imports: [ListComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: SessionService, useValue: sessionServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should show Create and Edit buttons when user is admin', async () => {
    await createComponent(true);

    expect(sessionApiMock.all).toHaveBeenCalled();

    const createBtn = fixture.nativeElement.querySelector('button[routerLink="create"]');
    expect(createBtn).not.toBeNull();

    const editBtn = fixture.nativeElement.querySelector('button[ng-reflect-router-link*="update"]');
    expect(editBtn).not.toBeNull();

    const detailBtn = fixture.nativeElement.querySelector('button[ng-reflect-router-link*="detail"]');
    expect(detailBtn).not.toBeNull();
  });

  it('should hide Create and Edit buttons when user is not admin, but still show Detail', async () => {
    await createComponent(false);

    const createBtn = fixture.nativeElement.querySelector('button[routerLink="create"]');
    expect(createBtn).toBeNull();

    const editBtn = fixture.nativeElement.querySelector('button[ng-reflect-router-link*="update"]');
    expect(editBtn).toBeNull();

    const detailBtn = fixture.nativeElement.querySelector('button[ng-reflect-router-link*="detail"]');
    expect(detailBtn).not.toBeNull();
  });
});
