import { useEffect, useRef } from 'react';
import p5 from 'p5';
import type { TreeNode } from '../types/tree';

interface TreeCanvasProps {
  tree: TreeNode | null;
  width?: number;
  height?: number;
}

export default function TreeCanvas({ tree, width = 800, height = 600 }: TreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current || !tree) return;

    // Destroy previous instance
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
    }
    // Clear container to prevent duplicate canvases in strict mode
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const sketch = (p: p5) => {
      // Tree layout parameters
      const nodeRadius = 20;
      const levelHeight = 120;
      
      let nodes: any[] = [];
      let edges: any[] = [];
      
      // Calculate positions
      const calculatePositions = (node: TreeNode, depth: number, x: number, y: number, widthAlloc: number, isPathHighlighted: boolean = true) => {
        const currentPos = { x, y, node, depth, isHighlighted: isPathHighlighted };
        nodes.push(currentPos);
        
        if (node.children && node.children.length > 0) {
          const childWidthAlloc = widthAlloc / node.children.length;
          let startX = x - (widthAlloc / 2) + (childWidthAlloc / 2);
          
          node.children.forEach((child) => {
            const childHighlighted = isPathHighlighted && !!child.isBest;
            const childPos = calculatePositions(
              child, 
              depth + 1, 
              startX, 
              y + levelHeight, 
              childWidthAlloc,
              childHighlighted
            );
            
            edges.push({
              from: currentPos,
              to: childPos,
              isBest: childHighlighted,
              move: child.move
            });
            
            startX += childWidthAlloc;
          });
        }
        
        return currentPos;
      };

      p.setup = () => {
        // Find max depth to determine tree height
        let maxDepth = 0;
        let countAtDepth: Record<number, number> = {};
        const analyzeTree = (n: TreeNode) => {
          if (n.depth > maxDepth) maxDepth = n.depth;
          countAtDepth[n.depth] = (countAtDepth[n.depth] || 0) + 1;
          if (n.children) n.children.forEach(analyzeTree);
        };
        analyzeTree(tree);

        // Required sizes
        const maxNodesInLevel = Math.max(...Object.values(countAtDepth));
        const computedWidth = Math.max(width, maxNodesInLevel * 80);
        const computedHeight = Math.max(height, 100 + maxDepth * levelHeight);

        p.createCanvas(computedWidth, computedHeight);
        p.textAlign(p.CENTER, p.CENTER);
        
        // Calculate positions starting from top center
        calculatePositions(tree, 0, computedWidth / 2, 50, computedWidth * 0.9, true);
      };

      p.draw = () => {
        p.background('#0a0a0c'); // hextech dark bg
        
        // Draw edges
        for (const edge of edges) {
          p.push();
          if (edge.isBest) {
            p.stroke('#0ac8b9'); // hextech-blue
            p.strokeWeight(3);
          } else {
            p.stroke('#463714'); // hextech-border
            p.strokeWeight(1);
          }
          p.line(edge.from.x, edge.from.y, edge.to.x, edge.to.y);
          p.pop();
        }

        // Draw move labels above edges
        for (const edge of edges) {
          if (edge.move) {
            p.push();
            p.fill('#f0e6d2'); // hextech-gold-light
            p.noStroke();
            p.textSize(12);
            // Translate to middle of line segment and rotate
            const midX = (edge.from.x + edge.to.x) / 2;
            const midY = (edge.from.y + edge.to.y) / 2;
            
            p.translate(midX, midY);
            let moveText = typeof edge.move === 'object' ? JSON.stringify(edge.move) : String(edge.move);
            
            // To prevent overlap, just basic mapping
            p.textAlign(p.CENTER, p.BOTTOM);
            p.text(moveText, 0, -5);
            p.pop();
          }
        }
        
        // Draw nodes
        for (const pos of nodes) {
          p.push();
          p.translate(pos.x, pos.y);
          
          // Check hover
          const d = p.dist(p.mouseX, p.mouseY, pos.x, pos.y);
          const isHovered = d < nodeRadius;
          
          if (isHovered) {
             p.scale(1.1);
          }

          // Outer circle
          p.fill('#1e2328'); // hextech-panel
          if (pos.isHighlighted) {
            p.stroke('#0ac8b9'); // hextech-blue
            p.strokeWeight(3);
          } else {
            p.stroke('#463714'); // hextech-border
            p.strokeWeight(2);
          }
          
          p.circle(0, 0, nodeRadius * 2);
          
          // Node score text
          p.fill('#f0e6d2'); // hextech-gold-light
          p.noStroke();
          p.textSize(14);
          const displayText = pos.node.label !== undefined 
            ? pos.node.label 
            : (pos.node.score !== undefined ? pos.node.score : '?');
          p.text(displayText, 0, 0);
          p.pop();
        }
      };
    };

    p5InstanceRef.current = new p5(sketch, containerRef.current);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [tree, width, height]);

  if (!tree) return null;

  return (
    <div className="flex flex-col items-center justify-center my-6 relative w-full h-full game-anim">
      <h3 className="text-lg font-bold text-[#c89b3c] tracking-widest uppercase mb-6 drop-shadow-md">Game Tree Analysis</h3>
      <div 
        ref={containerRef} 
        className="rounded-lg border border-[#463714] shadow-[0_0_20px_rgba(10,200,185,0.1)] relative z-10 w-full overflow-x-auto overflow-y-hidden custom-scrollbar bg-[#0a0a0c]"
      />
    </div>
  );
}
