import {Component, DestroyRef, inject} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionInformation } from 'src/app/core/models/sessionInformation.interface';
import { SessionService } from 'src/app/core/service/session.service';
import { LoginRequest } from '../../core/models/loginRequest.interface';
import { AuthService } from '../../core/service/auth.service';
import {MaterialModule} from "../../shared/material.module";
import { CommonModule } from '@angular/common';
import {FlexModule} from "@angular/flex-layout";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule, FlexModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private sessionService = inject(SessionService);

  public hide = true;
  public onError = false;
  private readonly destroyRef = inject(DestroyRef);


  public form = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.min(3)
      ]
    ]
  });

  public submit(): void {
    const loginRequest = this.form.value as LoginRequest;
    this.authService.login(loginRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: SessionInformation) => {
        this.sessionService.logIn(response);
        this.router.navigate(['/sessions']);
      },
      error: (): void => {
        this.onError = true;
      },
    });
  }
}
