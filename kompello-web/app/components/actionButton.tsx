import React, { useState } from "react"
import { Button } from "./ui/button"
import { Check, CircleX, Loader2, type LucideIcon } from "lucide-react";
import type { JSX } from "react/jsx-runtime";

/**
 * `ActionButton` is a customizable button component that executes an asynchronous action when clicked.
 * It provides visual feedback for loading, success, and error states by dynamically updating its icon.
 *
 * @param className - Additional CSS classes to apply to the button.
 * @param variant - The visual style variant of the button.
 * @param size - The size of the button.
 * @param icon - The icon component to display in the button (must be a LucideIcon).
 * @param action - An asynchronous function to execute when the button is clicked.
 * @param asChild - If true, renders the button as a child component (default: false).
 * @param props - Additional props passed to the underlying Button component.
 *
 * @returns A button element that displays a loading spinner while the action is in progress,
 *          a success icon on successful completion, or an error icon if the action fails.
 *
 * @example
 * ```tsx
 * <ActionButton
 *   icon={Save}
 *   action={async () => await saveData()}
 *   variant="primary"
 *   size="lg"
 * >
 *   Save
 * </ActionButton>
 * ```
 */
export default function ActionButton({
    className,
    variant,
    size,
    icon: Icon,
    action,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> & React.ComponentProps<typeof Button> & { icon: LucideIcon; action: () => Promise<void>; }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [buttonIcon, setButtonIcon] = useState<JSX.Element>(<Icon />);


    async function updateIcon(firstIcon: JSX.Element, secondIcon: JSX.Element) {
        setButtonIcon(firstIcon)
        await new Promise(resolve => setTimeout(resolve, 1000));
        setButtonIcon(secondIcon);
    }

    async function actionInvoke() {
        setLoading(true);
        try {
            await action();
            setLoading(false);
            await updateIcon(<Check className="text-green-500 animate-pulse" />, <Icon />);
        }
        catch (error) {
            setLoading(false);
            await updateIcon(<CircleX className="text-red-500 animate-pulse" />, <Icon />);
        }
    }
    const RenderIcon = buttonIcon

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            asChild={asChild}
            onClick={actionInvoke}
            disabled={loading}
            {...props}
        >
            {loading ? (<Loader2 className="animate-spin" />) : RenderIcon}
            {props.children}
        </Button>
    )
}
