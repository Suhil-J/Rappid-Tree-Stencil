import { Component, OnInit } from '@angular/core';
import { dia, setTheme, shapes, ui } from '@clientio/rappid';
import { TreeStencilServiceService } from 'src/Service/tree-stencil-service.service';
import { createStencil } from '../../assets/stencil';

@Component({
  selector: 'app-tree-stencil',
  templateUrl: './tree-stencil.component.html',
  styleUrls: ['./tree-stencil.component.scss']
})
export class TreeStencilComponent implements OnInit {

  constructor(private treeStencilServiceService: TreeStencilServiceService,) { }

  ngOnInit(): void {

    setTheme('my-theme');
    this.LoadGraphItems();
  };

  GenerateTreeStencil(treeData: any) {
    const graph = new dia.Graph({}, { cellNamespace: shapes });

    const paper = new dia.Paper({
      el: document.getElementById('paper')!,
      model: graph,
      width: 680,
      height: 600,
      gridSize: 20,
      interactive: true,
      async: true,
      frozen: false,
      sorting: dia.Paper.sorting.APPROX,
      background: { color: '#F3F7F6' },
      cellViewNamespace: shapes
    });

    const stencil = createStencil(paper, 280, treeData, (node) => {
      return new shapes.standard.Rectangle({
        size: {
          width: 120,
          height: 40
        },
        attrs: {
          body: {
            fill: '#333',
            stroke: '#F3F7F6',
            rx: 3,
            ry: 3
          },
          label: {
            fill: '#fff',
            fontSize: 15,
            fontFamily: 'monospace',
            text: `<${node.get('name')}>`
          }
        }
      })
    });

    var Element = document.getElementById('stencil')!;
    Element.appendChild(stencil.el);

    stencil.el.dataset['textNoMatchesFound'] = 'No tags found';
    (<HTMLInputElement>stencil.el.querySelector('.search')).placeholder = 'Search for an angular files';

    stencil.unfreeze();
  }

  LoadGraphItems() {

    this.treeStencilServiceService.LoadGraphItems().subscribe(data => {
      this.GenerateTreeStencil(data);
    }
    );
  }
}
