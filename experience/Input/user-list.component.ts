import { Component } from '@angular/core';

@Component({
    selector: 'app-user-list',
    template: `
    <h2>User List</h2>
    <ul>
      <li *ngFor="let user of users" data-testid="user-item">{{ user }}</li>
    </ul>
  `,
    styles: []
})
export class UserListComponent {
    users: string[] = ['Alice', 'Bob', 'Charlie'];
}
