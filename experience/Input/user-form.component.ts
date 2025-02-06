import { Component } from '@angular/core';

@Component({
    selector: 'app-user-form',
    template: `
    <h2>Add User</h2>
    <form (ngSubmit)="addUser()">
      <input type="text" [(ngModel)]="newUser" name="username" data-testid="user-input" required>
      <button type="submit" data-testid="add-button">Add</button>
    </form>
  `,
    styles: []
})
export class UserFormComponent {
    newUser: string = '';
    addUser() {
        console.log('User added:', this.newUser);
    }
}
