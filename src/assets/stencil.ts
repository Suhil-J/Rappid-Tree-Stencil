import { dia, layout, ui } from '@clientio/rappid';
import { StencilNode, StencilLink } from './shapes';

export interface List {
    name?: string;
    icon?: string;
    dir?: boolean;
    collapsed?: boolean;
    children?: Array<List>
}

export function createStencil(
    paper: dia.Paper,
    width: number,
    list: List,
    onNodeDrop: (node: StencilNode) => dia.Element
): ui.Stencil {


    const stencil = new ui.Stencil({
        paper,
        width,
        dropAnimation: true,
        usePaperGrid: true,
        contentOptions: {
            useModelGeometry: true
        },
        paperOptions: {
            async: true,
            sorting: dia.Paper.sorting.APPROX,
            frozen: true,
            viewport:  (view)=> {
                const { model } = view;
                // Never hide elements matched by the search
                if (model.isElement() && model.isMatched()) return true;
                if (model.isLink() && model.graph.get('grid')) return false;
                // Hide elements and links which are currently collapsed
                if (model.isHidden()) return false;
                return true;
            }
        },
        search: (cell: StencilLink | StencilNode | any, keyword: string) => {
            if (keyword === '') return true;
            if (cell.isLink()) return false;
            // Do not show directories in the search results
            if ((<StencilNode>cell).isDirectory()) return false;
            const path = (<StencilNode>cell).getPathString().toLowerCase();
            return path.includes(keyword.toLowerCase());
        },
        // Can be a directory dragged & dropped?
        canDrag: (nodeView: dia.ElementView | any) => {
            const node = <StencilNode>nodeView.model;
            return !node.isDirectory();
        },
        // Replace the stencil shape with an actual shape while dragging
        dragStartClone: (node: StencilNode | any) => onNodeDrop(node)
    });

    stencil.render();

    const stencilPaper = stencil.getPaper();
    const stencilGraph = stencil.getGraph();
    const stencilCells = buildCellsFromList(list);
    stencilGraph.resetCells(stencilCells);
    const [stencilRoot] = stencilGraph.getSources();

    const stencilTree = new layout.TreeLayout({
        graph: stencilGraph,
        direction: 'BR',
        parentGap: -20,
        siblingGap: 5,
        firstChildGap: 5,
        updateVertices: null,
        filter: (siblings: StencilNode[] | any, parent: StencilNode | null | any) => {
            // Layout will skip elements which have been collapsed
            if (!parent || !parent.isCollapsed()) return siblings;
            return [];
        },
        updateAttributes: (_, node: StencilNode | any) => {
            // silent change of hidden attribute (there is no need to trigger an event)
            // silent change of hidden attribute (there is no need to trigger an event)
            node.attributes['hidden'] = false;
            // Update some presentation attributes during the layout
            node.toggleButtonVisibility(!stencilGraph.isSink(node));
            node.toggleButtonSign(!node.isCollapsed());
        }
    });

    function layoutTree() {
        // Reset tree layout start position
        stencilRoot.position(30, 10);
        // Or to Hide the first root level use this.
        stencilGraph.getElements().forEach(el => el.attributes['hidden'] = true);
        stencilTree.layout();
    }

    function resetTree(): void {
        stencilGraph.set('grid', false);
        // Set name value as label and reset text annotations
        stencilGraph.getElements().forEach((node: StencilNode | any) => node.unmatch());
        layoutTree();
    }

    function layoutGrid(matchedGraph: dia.Graph): void {
        // Display grid layout when graph is filtered
        layout.GridLayout.layout(matchedGraph, {
            verticalAlign: 'top',
            horizontalAlign: 'left',
            columns: 1,
            columnWidth: 'auto',
            rowGap: 6,
            marginX: 10,
            marginY: 10
        });
    }

    function resetGrid(matchedGraph: dia.Graph, keyword: string): void {
        stencilGraph.set('grid', true);
        stencilGraph.getElements().forEach((node: StencilNode | any) => {
            if (matchedGraph.getCell(node.id)) {
                node.match(keyword)
            } else {
                node.unmatch();
            }
        });

        layoutGrid(matchedGraph);
    }

    function toggleBranch(root: StencilNode): void {
        const shouldHide = !root.isCollapsed();
        root.set({ collapsed: shouldHide });
        layoutTree();
    }

    // Events

    stencil.on('filter', (matchedGraph: dia.Graph, _group: string, keyword: string) => {
        if (keyword === '') {
            resetTree();
        } else {
            resetGrid(matchedGraph, keyword);
        }
    });

    stencilPaper.on('element:pointerdown', (view: dia.ElementView) => {
        const node = <StencilNode>view.model;
        if (node.isDirectory()) {
            toggleBranch(node);
        }
    });

    resetTree();

    return stencil;
}

const DIRECTORY_ICON = 'assets/directory.svg';
const FILE_ICON = 'assets/file.svg';

function buildCellsFromList(list: List): Array<dia.Cell> {

    const elements: StencilNode[] = [];
    const links: StencilLink[] = [];

    const iterate = (obj: List, pathArray: string[] = []): StencilNode => {

        const { name = '', icon = null, children = [], dir = false, collapsed = false } = obj;
        // Path displayed during search
        const path = pathArray.concat(name);
        const node = new StencilNode({ path, name, dir, collapsed });

        const defaultIcon = dir ? DIRECTORY_ICON : FILE_ICON;
        node.setIcon(icon || defaultIcon);
        node.attr(['root', 'dataDirectory'], dir);

        elements.push(node);

        children.forEach(child => {
            const childNode = iterate(child, path);
            const link = new StencilLink();
            link.connect(<string>node.id, <string>childNode.id);
            links.push(link);
        });

        return node;
    }

    iterate(list);

    return [...elements, ...links];
}
