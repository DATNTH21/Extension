import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
    <h1>Angular UI Test App</h1>
    <app-user-form></app-user-form>
    <app-user-list></app-user-list>
  `,
    styles: []
})
export class AppComponent { }
