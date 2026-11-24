import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
@Component({
  imports: [RouterModule],
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App {
  protected title = "angular-app";
  clickCount = 0;

  incrementCount(): void {
    this.clickCount++;
  }

  resetCount(): void {
    this.clickCount = 0;
  }

  tab = "overview";
  modalOpen = false;
}
