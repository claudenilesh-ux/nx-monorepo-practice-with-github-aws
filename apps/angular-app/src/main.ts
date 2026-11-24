import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { Shell } from "./app/shell";
import "@nx-learning/shared-ui";
bootstrapApplication(Shell, appConfig).catch((err) => console.error(err));
