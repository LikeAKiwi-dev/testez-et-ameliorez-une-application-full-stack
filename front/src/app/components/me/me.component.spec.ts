import { describe, it, expect, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { MeComponent } from './me.component';
import { SessionService } from 'src/app/core/service/session.service';
import { UserService } from 'src/app/core/service/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('MeComponent (integration)', () => {
  let fixture: ComponentFixture<MeComponent>;
  let component: MeComponent;

  const userServiceMock = {
    getById: jest.fn(),
    delete: jest.fn(),
  };

  const snackBarMock = {
    open: jest.fn(),
  };

  const createComponent = async (admin: boolean) => {
    const sessionServiceMock = {
      sessionInformation: { id: 1, admin },
    };

    userServiceMock.getById.mockReturnValue(
      of({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.com',
        admin,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );

    userServiceMock.delete.mockReturnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [MeComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create', async () => {
    await createComponent(true);
    expect(component).toBeTruthy();
  });

  it('should display user info and "You are admin" when user is admin', async () => {
    await createComponent(true);

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('User information');
    expect(text).toContain('Name: John DOE');
    expect(text).toContain('Email: john@doe.com');
    expect(text).toContain('You are admin');

    // Le bloc "Delete my account" ne doit pas apparaître
    expect(text).not.toContain('Delete my account');
  });

  it('should display delete section when user is not admin', async () => {
    await createComponent(false);

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Delete my account:');
    expect(text).not.toContain('You are admin');

    // Le bouton de suppression doit exister
    const deleteBtn = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Detail')); // c’est le texte actuel dans ton HTML
    expect(deleteBtn).toBeTruthy();
  });

  it('should call delete() when user clicks delete button (non admin)', async () => {
    await createComponent(false);

    // spy direct sur la méthode du composant pour éviter les pièges Material/Zone
    const spy = jest.spyOn(component, 'delete');

    fixture.detectChanges();
    const deleteBtn = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Detail'));
    expect(deleteBtn).toBeTruthy();

    deleteBtn!.click();
    expect(spy).toHaveBeenCalled();
  });
});
