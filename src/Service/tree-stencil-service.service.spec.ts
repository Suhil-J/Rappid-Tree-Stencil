import { TestBed } from '@angular/core/testing';

import { TreeStencilServiceService } from './tree-stencil-service.service';

describe('TreeStencilServiceService', () => {
  let service: TreeStencilServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeStencilServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
