import { Component, OnInit, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  private readonly store = inject(Storage)

  constructor() {}

  ngOnInit() {
      this.store.create()
  }
}
