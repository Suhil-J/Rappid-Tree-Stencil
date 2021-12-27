import { dia, shapes, g, Vectorizer } from '@clientio/rappid';

const WIDTH = 80;
const HEIGHT = 20;

export class StencilNode extends dia.Element {
     override defaults() {
        return {
            ...super.defaults,
            type: 'app.StencilNode',
            hidden: false,
            collapsed: false,
            matched: false,
            z: 2,
            size: {
                width: WIDTH,
                height: HEIGHT
            },
            path: [] as Array<string>,
            attrs: {
                body: {
                    ref: 'label',
                    refWidth: '100%',
                    refHeight: '100%',
                    refX: -3,
                    refY: -3,
                    refWidth2: 6,
                    refHeight2: 6,
                    fill: 'transparent'
                },
                label: {
                    refX: 25,
                    refY: '50%',
                    textVerticalAnchor: 'middle',
                    textAnchor: 'start',
                    fontSize: 13,
                    fontFamily: 'sans-serif'
                },
                icon: {
                    width: 20,
                    height: 20,
                },
                buttonGroup: {
                    refX: -15,
                    refY: '50%',
                },
                button: {
                    fill: '#FFFFFF',
                    stroke: '#808080',
                    x: -5,
                    y: -5,
                    height: 10,
                    width: 10,
                    cursor: 'pointer',
                    event: 'element:collapse',
                },
                buttonSign: {
                    refX: -5,
                    refY: -5,
                    stroke: '#808080',
                    strokeWidth: 1.6
                }
            }
        }
    }
    PLUS_SIGN = 'M 1 5 9 5 M 5 1 5 9'
    MINUS_SIGN = 'M 2 5 8 5'

     override markup = [{
        tagName: 'rect',
        selector: 'body',
    }, {
        tagName: 'text',
        selector: 'label'
    }, {
        tagName: 'image',
        selector: 'icon'
    },{
        tagName: 'g',
        selector: 'buttonGroup',
        children: [{
            tagName: 'rect',
            selector: 'button'
        }, {
            tagName: 'path',
            selector: 'buttonSign',
            attributes: {
                'fill': 'none',
                'pointer-events': 'none'
            }
        }]
    }]
    setIcon(icon: string): StencilNode {
        return this.attr(['icon', 'xlinkHref'], icon);
    }
    isHidden(): boolean {
        return Boolean(this.get('hidden'));
    }
    isCollapsed(): boolean {
        return Boolean(this.get('collapsed'));
    }
    isMatched(): boolean {
        return Boolean(this.get('matched'));
    }
    isDirectory(): boolean {
        return Boolean(this.get('dir'));
    }
    toggleButtonVisibility(visible: boolean): StencilNode {
        return this.attr('buttonGroup', { display: visible ? 'block' : 'none' });
    }
    toggleButtonSign(collapse: boolean): StencilNode {
        return this.attr('buttonSign', { d: collapse? this.MINUS_SIGN : this.PLUS_SIGN });
    }
    getPathString(separator = '/'): string {
        return this.get('path').join(separator);
    }
    match(keyword: string): void {

        // Set path value as label and annotate text

        const name = this.get('name');
        const displayName = this.getPathString(' / ');

        const annotations: Array<Vectorizer.TextAnnotation> = [{
            // Bold Node Name
            start: 0,
            end: displayName.length - name.length,
            attrs: {
                'fill': '#999'
            }
        }];

        const matchIndex = displayName.toLowerCase().lastIndexOf(keyword.toLowerCase());
        if (matchIndex > -1) {
            annotations.push({
                // Underlined Keyword
                start: matchIndex,
                end: matchIndex + keyword.length,
                attrs: {
                    'text-decoration': 'underline'
                }
            });
        }

        this.toggleButtonVisibility(false);
        this.prop({
            matched: true,
            attrs: {
                label: {
                    text: displayName,
                    annotations
                }
            }
        });
    }
    unmatch(): void {
        this.prop({
            matched: false,
            attrs: {
                label: {
                    text: this.get('name'),
                    annotations: null
                }
            }
        });
    }
}

export class StencilLink extends dia.Link {
     override defaults() {
        return {
            ...super.defaults,
            type: 'app.StencilLink',
            z: 1,
            router: (_vertices: Array<g.Point>, _opt: Object, linkView: dia.LinkView) => {
                const { x } = linkView.getEndAnchor('source');
                const { y } = linkView.getEndAnchor('target');
                return [new g.Point(x, y)];
            },
            attrs: {
                root: {
                    pointerEvents: 'none'
                },
                line: {
                    connection: true,
                    stroke: '#808080',
                    strokeWidth: 0.5,
                    shapeRendering: 'optimizeSpeed',
                    vertexMarker: {
                        type: 'circle',
                        r: 1
                    }
                }
            }
        }
    }
     override markup = [{
        tagName: 'path',
        selector: 'line',
        attributes: {
            'fill': 'none',
        }
    }]
    connect(parentId: string, childId: string): void {
        this.set({
            source: {
                id: parentId,
                anchor: {
                    name: 'modelCenter',
                    args: {
                        dx: - (WIDTH / 2) + 5,
                        dy: HEIGHT / 2
                    }
                }
            },
            target: {
                id: childId,
                anchor: {
                    name: 'modelCenter',
                    args: { dx: - (WIDTH / 2) }
                }
            }
        });
    }
    isHidden(): boolean {
        // If the target element is collapsed, we don't want to
        // show the link either
        const targetElement = this.getTargetElement() as StencilNode;
        return !targetElement || targetElement.isHidden();
    }
}

Object.assign(shapes, {
    app: {
        StencilNode,
        StencilLink
    }
});
