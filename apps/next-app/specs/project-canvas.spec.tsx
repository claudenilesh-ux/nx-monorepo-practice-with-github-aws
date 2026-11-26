import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProjectCanvas from '../src/app/editor/project-canvas';

jest.mock('@xyflow/react', () => {
  const React = require('react');
  return {
    Background: () => null,
    Handle: () => null, Position: { Top: 'top', Bottom: 'bottom' }, MarkerType: { ArrowClosed: 'arrowclosed' },
    useEdgesState: (initial: unknown[]) => { const [edges, setEdges] = React.useState(initial); return [edges, setEdges, () => undefined]; },
    BackgroundVariant: { Dots: 'dots' },
    useNodesState: (initial: unknown[]) => { const [nodes, setNodes] = React.useState(initial); return [nodes, setNodes, () => undefined]; },
    ReactFlow: (props: { nodes: { id: string; data: { componentId: string } }[]; edges: { id: string; source: string; target: string }[]; onConnect: (connection: { source: string; target: string; sourceHandle: string; targetHandle: string }) => void; onInit: (instance: unknown) => void; onMove: (event: null, viewport: { x: number; y: number; zoom: number }) => void }) => {
      const viewport = React.useRef({ x: 0, y: 0, zoom: 1 });
      React.useEffect(() => { props.onInit({ getViewport: () => viewport.current, setViewport: (next: { x: number; y: number; zoom: number }) => { viewport.current = next; props.onMove(null, next); }, screenToFlowPosition: (point: { x: number; y: number }) => point }); }, []);
      return <div data-testid="flow"><button onClick={() => { if (props.nodes.length > 1) { const connection = { source: props.nodes[0].id, target: props.nodes[1].id, sourceHandle: 'out', targetHandle: 'in' }; props.onConnect(connection); props.onConnect(connection); } }}>Native connect twice</button>{props.nodes.map((node: { id: string; data: { componentId: string } }) => <div key={node.id} data-id={node.id} className="react-flow__node" tabIndex={0}>{node.data.componentId}</div>)}{props.edges.map(edge => <div key={edge.id} data-testid="edge">{edge.source} → {edge.target}</div>)}</div>;
    },
  };
});

it('pans by keyboard, clamps zoom and resets', () => {
  render(<ProjectCanvas />);
  const canvas = screen.getByLabelText('Project canvas');
  fireEvent.keyDown(canvas, { key: 'ArrowRight' });
  for (let i = 0; i < 20; i++) fireEvent.click(screen.getByText('Zoom in'));
  expect(screen.getByText('200%')).toBeTruthy();
  expect(screen.getByText('Zoom in').hasAttribute('disabled')).toBe(true);
  fireEvent.click(screen.getByText('Reset'));
  expect(screen.getByText('100%')).toBeTruthy();
  for (let i = 0; i < 20; i++) fireEvent.click(screen.getByText('Zoom out'));
  expect(screen.getByText('25%')).toBeTruthy();
});

it('preserves the viewport when opening and closing the library', () => {
  render(<ProjectCanvas />);
  fireEvent.click(screen.getByText('Zoom in'));
  fireEvent.click(screen.getByText('Components'));
  const library = document.querySelector('sic-component-library');
  expect(library).toBeTruthy();
  act(() => library?.dispatchEvent(new CustomEvent('component-library-close', { bubbles: true })));
  expect(document.querySelector('sic-component-library')).toBeNull();
  expect(screen.getByText('110%')).toBeTruthy();
});

it('adds independent nodes through authenticated library drag and reset preserves them', async () => {
  render(<ProjectCanvas />);
  fireEvent.click(screen.getByText('Components'));
  const library = document.querySelector('sic-component-library');
  const canvas = screen.getByLabelText('Project canvas');
  const transfer = { types: ['application/x-archloom-component'], getData: () => 'aws-ec2', dropEffect: '' };
  for (let i = 0; i < 2; i++) {
    act(() => library?.dispatchEvent(new CustomEvent('component-library-drag-start', { detail: { id: 'aws-ec2' }, bubbles: true })));
    const drop = new MouseEvent('drop', { bubbles: true, clientX: 100, clientY: 100 });
    Object.defineProperty(drop, 'dataTransfer', { value: transfer });
    fireEvent(canvas, drop);
  }
  await waitFor(() => expect(screen.getAllByText('aws-ec2')).toHaveLength(2));
  fireEvent.click(screen.getByText('Reset'));
  expect(screen.getAllByText('aws-ec2')).toHaveLength(2);
  fireEvent.click(screen.getByText('Delete selected node'));
  expect(screen.getAllByText('aws-ec2')).toHaveLength(1);
});

it('rejects external drops without a matching active library drag', () => {
  render(<ProjectCanvas />);
  const canvas = screen.getByLabelText('Project canvas');
  const drop = new MouseEvent('drop', { bubbles: true, clientX: 100, clientY: 100 });
  Object.defineProperty(drop, 'dataTransfer', { value: { getData: () => 'aws-ec2' } });
  fireEvent(canvas, drop);
  expect(screen.queryByText('aws-ec2')).toBeNull();
});

it('rejects a stale drop after the component library closes during a drag', () => {
  render(<ProjectCanvas />);
  fireEvent.click(screen.getByText('Components'));
  const library = document.querySelector('sic-component-library');
  act(() => library?.dispatchEvent(new CustomEvent('component-library-drag-start', { detail: { id: 'aws-ec2' }, bubbles: true })));
  act(() => library?.dispatchEvent(new CustomEvent('component-library-close', { bubbles: true })));
  const drop = new MouseEvent('drop', { bubbles: true, clientX: 100, clientY: 100 });
  Object.defineProperty(drop, 'dataTransfer', { value: { getData: () => 'aws-ec2' } });
  fireEvent(screen.getByLabelText('Project canvas'), drop);
  expect(screen.queryByText('aws-ec2')).toBeNull();
});

it('offers an accessible connection control', () => {
  render(<ProjectCanvas />);
  expect(screen.getByText('Connect')).toBeTruthy();
});


it('validates directed connections and removes incident edges', () => {
  render(<ProjectCanvas />);
  fireEvent.click(screen.getByText('Components'));
  const library = document.querySelector('sic-component-library');
  const canvas = screen.getByLabelText('Project canvas');
  for (let i = 0; i < 2; i++) {
    act(() => library?.dispatchEvent(new CustomEvent('component-library-drag-start', { detail: { id: 'aws-ec2' }, bubbles: true })));
    const drop = new MouseEvent('drop', { bubbles: true, clientX: 100, clientY: 100 });
    Object.defineProperty(drop, 'dataTransfer', { value: { getData: () => 'aws-ec2' } });
    fireEvent(canvas, drop);
  }
  fireEvent.click(screen.getByText('Connect'));
  const source = screen.getByLabelText('Source') as HTMLSelectElement;
  const target = screen.getByLabelText('Target') as HTMLSelectElement;
  const first = source.options[1].value;
  const second = source.options[2].value;
  fireEvent.change(source, { target: { value: first } });
  fireEvent.change(target, { target: { value: first } });
  expect(screen.getByText('Create connection').hasAttribute('disabled')).toBe(true);
  fireEvent.change(target, { target: { value: second } });
  fireEvent.click(screen.getByText('Create connection'));
  expect(screen.getAllByTestId('edge')).toHaveLength(1);
  fireEvent.click(screen.getByText('Connect'));
  fireEvent.change(screen.getByLabelText('Source'), { target: { value: first } });
  fireEvent.change(screen.getByLabelText('Target'), { target: { value: second } });
  expect(screen.getByText('Create connection').hasAttribute('disabled')).toBe(true);
  fireEvent.change(screen.getByLabelText('Source'), { target: { value: second } });
  fireEvent.change(screen.getByLabelText('Target'), { target: { value: first } });
  fireEvent.click(screen.getByText('Create connection'));
  expect(screen.getAllByTestId('edge')).toHaveLength(2);
  fireEvent.click(screen.getByText('Delete selected node'));
  expect(screen.queryByTestId('edge')).toBeNull();
});


it('revalidates rapid native duplicate submissions', () => {
  render(<ProjectCanvas />);
  fireEvent.click(screen.getByText('Components'));
  const library = document.querySelector('sic-component-library');
  for (let i = 0; i < 2; i++) {
    act(() => library?.dispatchEvent(new CustomEvent('component-library-drag-start', { detail: { id: 'aws-ec2' }, bubbles: true })));
    const drop = new MouseEvent('drop', { bubbles: true, clientX: 100, clientY: 100 });
    Object.defineProperty(drop, 'dataTransfer', { value: { getData: () => 'aws-ec2' } });
    fireEvent(screen.getByLabelText('Project canvas'), drop);
  }
  fireEvent.click(screen.getByText('Native connect twice'));
  expect(screen.getAllByTestId('edge')).toHaveLength(1);
});
