import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    username = '';
    password = '';
    error = '';

    constructor(private http: HttpClient, private router: Router) {}

    login() {
        this.error = '';
        this.http.post<any>('http://localhost:8080/backend/api/auth/login', {
            username: this.username,
            password: this.password
        }).subscribe({
            next: () => this.router.navigate(['/main']),
            error: () => this.error = 'Неверный логин или пароль'
        });
    }
}
