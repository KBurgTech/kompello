import type { JSX } from "react"
import { useTheme } from "~/components/themeContext"
import { Button } from "~/components/ui/button"
import { Moon, Sun } from "lucide-react"

/**
 * A React component that toggles between light and dark themes.
 *
 * This component uses the `useTheme` hook to access and update the current theme.
 * It renders a button that, when clicked, switches the theme between "light" and "dark".
 * The button displays a Moon icon when the current theme is light, and a Sun icon when the theme is dark.
 *
 * @returns {JSX.Element} The rendered theme switcher button.
 */
export default function ThemeSwitcher(): JSX.Element {
    const { theme, setTheme } = useTheme()

    return (
        <Button variant="secondary" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ?
                (
                    <Moon />
                ) :
                (
                    <Sun />
                )}
        </Button>
    )
}
