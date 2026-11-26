'use client';
import { useCallback, useEffect, useRef, useState, type DetailedHTMLProps, type HTMLAttributes } from 'react';
import { ReactFlow, Background, BackgroundVariant, Handle, Position, MarkerType, useNodesState, useEdgesState, type Connection, type Edge, type Node, type NodeProps, type ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './project-canvas.css';
import { componentCatalog } from './component-catalog';
import type { ComponentEntry } from '@nx-learning/shared-sections';

const Button = 'uic-button' as React.ElementType<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { disabled?: boolean }>;
const Icon = 'uic-icon' as React.ElementType<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { name: ComponentEntry['icon'] }>;
const Library = 'sic-component-library' as React.ElementType<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { entries: readonly ComponentEntry[] }>;
type FlowNode = Node<{ componentId: string }, 'architecture'>;
const origin: [number, number] = [0.5, 0.5];
const initial = { x: 0, y: 0, zoom: 1 };
const mime = 'application/x-archloom-component';
function ArchitectureNode({ data }: NodeProps<FlowNode>) {
  const entry = componentCatalog.find(item => item.id === data.componentId);
  return entry ? <div className="architecture-node"><Handle type="target" position={Position.Top} id="in" aria-label="Incoming connection" /><Handle type="source" position={Position.Bottom} id="out" aria-label="Outgoing connection" /><Icon name={entry.icon} aria-hidden="true" /><span>{entry.label}</span></div> : null;
}
const nodeTypes = { architecture: ArchitectureNode };

export default function ProjectCanvas() {
  const [nodes, setNodes, changes] = useNodesState<FlowNode>([]);
  const [edges, setEdges, edgeChanges] = useEdgesState<Edge>([]);
  const [connectOpen, setConnectOpen] = useState(false);
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const connectToggle = useRef<HTMLElement>(null);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const mounted = useRef(true);
  nodesRef.current = nodes;
  edgesRef.current = edges;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const valid = useCallback((connection: Connection | Edge) => {
    const { source, target, sourceHandle, targetHandle } = connection;
    return !!source && !!target && source !== target && sourceHandle === 'out' && targetHandle === 'in' &&
      nodesRef.current.some(node => node.id === source) && nodesRef.current.some(node => node.id === target) &&
      !edgesRef.current.some(edge => edge.source === source && edge.target === target);
  }, []);
  const commit = useCallback((connection: Connection) => {
    if (!mounted.current || !valid(connection)) return;
    const edge: Edge = { ...connection, id: crypto.randomUUID(), type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--accent-primary)' }, selected: false };
    edgesRef.current = [...edgesRef.current, edge];
    setEdges(edgesRef.current);
  }, [setEdges, valid]);
  const closeConnect = () => {
    setConnectOpen(false); setSource(''); setTarget('');
    connectToggle.current?.shadowRoot?.querySelector<HTMLButtonElement>('button')?.focus();
  };
  const [view, setView] = useState(initial);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [message, setMessage] = useState('');
  const canvas = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLElement>(null);
  const flow = useRef<ReactFlowInstance<FlowNode> | null>(null);
  const activeDrag = useRef<string | null>(null);
  const draggingNode = useRef(false);
  const placement = useRef(0);
  const pending = useRef<string | null>(null);
  const pendingFocus = useRef<string | null>(null);
  const selected = nodes.find(node => node.selected);
  const selectedEdge = edges.find(edge => edge.selected);
  const closeLibrary = useCallback(() => {
    activeDrag.current = null;
    setLibraryOpen(false);
    toggle.current?.shadowRoot?.querySelector<HTMLButtonElement>('button')?.focus();
  }, []);
  const add = useCallback((id: string, x: number, y: number) => {
    if (!flow.current || !componentCatalog.some(item => item.id === id) || !Number.isFinite(x) || !Number.isFinite(y)) return;
    const position = flow.current.screenToFlowPosition({ x, y });
    if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) return;
    const nodeId = crypto.randomUUID();
    pendingFocus.current = nodeId;
    setEdges(previous => previous.map(edge => ({ ...edge, selected: false })));
    setNodes(previous => [...previous.map(node => ({ ...node, selected: false })), { id: nodeId, type: 'architecture', position, data: { componentId: id }, selected: true, ariaLabel: `${componentCatalog.find(item => item.id === id)?.label} ${nodeId}` }]);
    setMessage('');
  }, []);
  useEffect(() => {
    if (!pendingFocus.current) return;
    const node = canvas.current?.querySelector<HTMLElement>(`[data-id="${pendingFocus.current}"]`);
    if (node) { node.focus(); pendingFocus.current = null; }
  }, [nodes]);
  useEffect(() => {
    if (libraryOpen || !pending.current) return;
    const id = pending.current;
    pending.current = null;
    const frame = requestAnimationFrame(() => {
      const rect = canvas.current?.getBoundingClientRect();
      if (!rect || rect.width < 80 || rect.height < 80) { setMessage('Not enough visible canvas space to add a component.'); return; }
      const y = rect.top + rect.height / 2;
      let start = -1; let bestStart = -1; let bestWidth = 0;
      for (let x = rect.left; x <= rect.right; x += 4) {
        const target = document.elementFromPoint(x, y);
        if (target && canvas.current?.contains(target)) { if (start < 0) start = x; }
        else if (start >= 0) { if (x - start > bestWidth) { bestStart = start; bestWidth = x - start; } start = -1; }
      }
      if (start >= 0 && rect.right - start > bestWidth) { bestStart = start; bestWidth = rect.right - start; }
      if (bestWidth < 80) { setMessage('Not enough visible canvas space to add a component.'); return; }
      const x = bestStart + bestWidth / 2;
      const offset = (placement.current++ % 5) * 24 * (flow.current?.getViewport().zoom ?? 1);
      const offsetTarget = document.elementFromPoint(x + offset, y + offset);
      const offsetVisible = !!offsetTarget && !!canvas.current?.contains(offsetTarget);
      add(id, offsetVisible ? x + offset : x, offsetVisible ? y + offset : y);
    });
    return () => cancelAnimationFrame(frame);
  }, [libraryOpen, add]);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || !event.deltaY || draggingNode.current || !flow.current) return;
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const previous = flow.current.getViewport();
      const zoom = Math.min(2, Math.max(0.25, Math.round((previous.zoom + (event.deltaY < 0 ? 0.1 : -0.1)) * 100) / 100));
      const x = event.clientX - rect.left; const y = event.clientY - rect.top;
      const ratio = zoom / previous.zoom;
      void flow.current.setViewport({ zoom, x: x - (x - previous.x) * ratio, y: y - (y - previous.y) * ratio });
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, []);
  const zoom = (step: number) => {
    if (!flow.current || draggingNode.current || !canvas.current) return;
    const previous = flow.current.getViewport();
    const next = Math.min(2, Math.max(0.25, Math.round((previous.zoom + step) * 100) / 100));
    const { width, height } = canvas.current.getBoundingClientRect();
    const ratio = next / previous.zoom;
    void flow.current.setViewport({ zoom: next, x: width / 2 - (width / 2 - previous.x) * ratio, y: height / 2 - (height / 2 - previous.y) * ratio });
  };
  const remove = () => {
    if (selected) {
      nodesRef.current = nodesRef.current.filter(node => node.id !== selected.id);
      edgesRef.current = edgesRef.current.filter(edge => edge.source !== selected.id && edge.target !== selected.id);
      setNodes(nodesRef.current); setEdges(edgesRef.current);
      if (source === selected.id) setSource('');
      if (target === selected.id) setTarget('');
    } else if (selectedEdge) {
      edgesRef.current = edgesRef.current.filter(edge => edge.id !== selectedEdge.id);
      setEdges(edgesRef.current);
    } else return;
    canvas.current?.focus();
  };
  return <div className="project-canvas-wrap">
    <div ref={canvas} className="project-canvas" tabIndex={0} role="region" aria-label="Project canvas"
      onKeyDown={event => {
        if (event.target === event.currentTarget && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) && flow.current && !draggingNode.current) {
          event.preventDefault(); const v = flow.current.getViewport();
          void flow.current.setViewport({ ...v, x: v.x + (event.key === 'ArrowRight' ? 20 : event.key === 'ArrowLeft' ? -20 : 0), y: v.y + (event.key === 'ArrowDown' ? 20 : event.key === 'ArrowUp' ? -20 : 0) });
        }
        const target = event.target as HTMLElement;
        if ((event.key === 'Delete' || event.key === 'Backspace') && !target.closest('input, textarea, select, [contenteditable=true]') && ((selected && target.closest('.react-flow__node')?.getAttribute('data-id') === selected.id) || (selectedEdge && target.closest('.react-flow__edge')?.getAttribute('data-id') === selectedEdge.id))) { event.preventDefault(); remove(); }
        if (event.key === 'Escape') { setNodes(previous => previous.map(node => ({ ...node, selected: false }))); setEdges(previous => previous.map(edge => ({ ...edge, selected: false }))); }
      }}
      onDragOver={event => { if (activeDrag.current && event.dataTransfer.types.includes(mime)) { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; } }}
      onDrop={event => { const id = activeDrag.current; activeDrag.current = null; if (!id || event.dataTransfer.getData(mime) !== id || !flow.current) return; event.preventDefault(); add(id, event.clientX, event.clientY); }}>
      <ReactFlow<FlowNode> nodes={nodes} edges={edges} onEdgesChange={edgeChanges} onConnect={commit} isValidConnection={valid} connectOnClick edgesReconnectable={false} autoPanOnConnect={false} onNodeClick={() => setEdges(previous => previous.map(edge => ({ ...edge, selected: false })))} onEdgeClick={() => setNodes(previous => previous.map(node => ({ ...node, selected: false })))} nodeTypes={nodeTypes} nodeOrigin={origin} onNodesChange={changes} onInit={instance => { flow.current = instance; }} onMove={(_, viewport) => setView(viewport)} minZoom={0.25} maxZoom={2} defaultViewport={initial} nodesConnectable elementsSelectable multiSelectionKeyCode={null} selectionKeyCode={null} deleteKeyCode={null} autoPanOnNodeDrag={false} autoPanOnNodeFocus={false} zoomOnScroll={false} zoomOnPinch={false} zoomOnDoubleClick={false} panOnScroll={false} onNodeDragStart={() => { draggingNode.current = true; }} onNodeDragStop={() => { draggingNode.current = false; }}>
        <Background variant={BackgroundVariant.Dots} gap={16} color="var(--border-default)" />
      </ReactFlow>
    </div>
    <div className="diagram-notice">Temporary diagram — refreshing or leaving this project will discard nodes and connections.</div>
    <div className="component-toggle"><Button ref={toggle} onClick={() => libraryOpen ? closeLibrary() : setLibraryOpen(true)}>Components</Button></div>
    {libraryOpen && <Library className="component-panel" role="complementary" aria-label="Components" entries={componentCatalog}
      {...{ 'oncomponent-library-close': closeLibrary, 'oncomponent-library-activate': (event: CustomEvent<{ id: string }>) => { pending.current = event.detail.id; closeLibrary(); }, 'oncomponent-library-drag-start': (event: CustomEvent<{ id: string }>) => { activeDrag.current = event.detail.id; }, 'oncomponent-library-drag-end': () => { activeDrag.current = null; } }} />}
    <div className="project-canvas-controls" aria-label="Canvas controls">
      <Button ref={connectToggle} onClick={() => { setSource(selected?.id ?? ''); setConnectOpen(true); }}>Connect</Button>
      {(selected || selectedEdge) && <Button onClick={remove}>Delete selected {selected ? 'node' : 'connection'}</Button>}
      <Button disabled={view.zoom <= 0.25} onClick={() => zoom(-0.1)}>Zoom out</Button><span aria-live="polite">{Math.round(view.zoom * 100)}%</span><Button disabled={view.zoom >= 2} onClick={() => zoom(0.1)}>Zoom in</Button><Button onClick={() => { if (!draggingNode.current) void flow.current?.setViewport(initial); }}>Reset</Button>
    </div>
    {connectOpen && <div className="connect-panel" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); closeConnect(); } }}>
      <label>Source <select value={source} onChange={event => setSource(event.target.value)}><option value="">Select source</option>{nodes.map(node => <option key={node.id} value={node.id}>{componentCatalog.find(entry => entry.id === node.data.componentId)?.label} ({node.id})</option>)}</select></label>
      <label>Target <select value={target} onChange={event => setTarget(event.target.value)}><option value="">Select target</option>{nodes.map(node => <option key={node.id} value={node.id}>{componentCatalog.find(entry => entry.id === node.data.componentId)?.label} ({node.id})</option>)}</select></label>
      <Button disabled={!valid({ source, target, sourceHandle: 'out', targetHandle: 'in' })} onClick={() => { commit({ source, target, sourceHandle: 'out', targetHandle: 'in' }); closeConnect(); }}>Create connection</Button>
      <Button onClick={closeConnect}>Cancel</Button>
    </div>}
    {message && <div role="status" className="diagram-message">{message}</div>}
  </div>;
}
