import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface HeaderAction {
    breadcrumbs?: BreadcrumbItem[];
    rightContent?: ReactNode;
}

export const TitleContext = createContext({
    title: "",
    setTitle: (title: string) => { },
    headerAction: undefined as HeaderAction | undefined,
    setHeaderAction: (action: HeaderAction | undefined) => { }
});

export const useTitle = () => useContext(TitleContext);

/**
 * Provides the `title` state and its updater function to all descendant components via React Context.
 *
 * @param children - The React node(s) that will have access to the title context.
 * @returns A context provider that supplies `title` and `setTitle` to its children.
 *
 * @example
 * ```tsx
 * <TitleProvider>
 *   <MyComponent />
 * </TitleProvider>
 * ```
 */
export function TitleProvider({ children }) {
    const [title, setTitle] = useState("");
    const [headerAction, setHeaderAction] = useState<HeaderAction | undefined>(undefined);
    return (
        <TitleContext.Provider value={{ title, setTitle, headerAction, setHeaderAction }}>
            {children}
        </TitleContext.Provider>
    );
}