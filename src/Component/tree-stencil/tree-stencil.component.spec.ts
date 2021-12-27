import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeStencilComponent } from './tree-stencil.component';

describe('TreeStencilComponent', () => {
  let component: TreeStencilComponent;
  let fixture: ComponentFixture<TreeStencilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeStencilComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeStencilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
