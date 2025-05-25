import { createContext, useContext, useState } from "react";

export const TitleContext = createContext({
    title: "",
    setTitle: (title: string) => { }
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
    return (
        <TitleContext.Provider value={{ title, setTitle }}>
            {children}
        </TitleContext.Provider>
    );
}