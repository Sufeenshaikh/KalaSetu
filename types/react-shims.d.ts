// Temporary shims to allow the editor/typechecker to work when node_modules aren't installed.
// These are minimal and safe — they only declare the module and allow any JSX intrinsic elements.

declare module 'react' {
  // Minimal named exports used by the project. These are intentionally untyped (any)
  // to allow the editor to work when node_modules are not installed. Replace with
  // proper @types/react when dependencies are available.
  // Provide minimal typed signatures for common hooks so generics work in source files
  export function useState<S = any>(initialState?: S | (() => S)):
    [S, (value: S | ((prev: S) => S)) => void];

  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;

  export function useRef<T = any>(initial?: T): { current: T };
  export function useContext<T = any>(context: any): T;

  export const Fragment: any;
  export const createElement: any;
  export default any;

  // Minimal namespace for types referenced in the codebase
  export namespace React {
    export type ReactNode = any;
    export type FC<P = {}> = (props: P & { children?: ReactNode }) => any;
    export type ChangeEvent<T = any> = any;
    export type FormEvent = any;
    export type ComponentType<P = {}> = any;
  }
}

declare namespace JSX {
  // Allow any intrinsic element (div, svg, path, etc.) without full react types.
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface ElementClass {}
  interface ElementAttributesProperty { props: any }
}
