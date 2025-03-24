import { TestBed } from '@angular/core/testing';

import { ImageStateService } from './image-state.service';

describe('ImageStateService', () => {
  let service: ImageStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
