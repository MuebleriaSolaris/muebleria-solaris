// change-detector.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChangeDetectorService {
  private changesMap: {[key: string]: boolean} = {};

  setChangesDetected(key: string, value: boolean) {
    this.changesMap[key] = value;
  }

  hasChanges(key: string): boolean {
    return this.changesMap[key] || false;
  }

  reset(key: string) {
    this.changesMap[key] = false;
  }
}