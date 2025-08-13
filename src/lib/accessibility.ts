/**
 * Accessibility utilities and helpers
 * WCAG 2.1 AA compliance utilities for comment system
 */

// =============================================================================
// 🎯 Focus Management
// =============================================================================

/**
 * Trap focus within an element (for modals, dropdowns)
 */
export function trapFocus(element: HTMLElement): () => void {
    const focusableSelectors = [
        "button:not([disabled])",
        "[href]",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
        "details",
        "summary",
    ].join(", ");

    const focusableElements = element.querySelectorAll(
        focusableSelectors
    ) as NodeListOf<HTMLElement>;
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
        if (event.key !== "Tab") return;

        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable?.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable?.focus();
            }
        }
    };

    element.addEventListener("keydown", handleTabKey);

    // Focus the first element
    firstFocusable?.focus();

    // Return cleanup function
    return () => {
        element.removeEventListener("keydown", handleTabKey);
    };
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
        "button:not([disabled])",
        "[href]",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
        "details",
        "summary",
    ].join(", ");

    return Array.from(container.querySelectorAll(focusableSelectors));
}

/**
 * Move focus to the next focusable element
 */
export function focusNext(
    current: HTMLElement,
    container?: HTMLElement
): boolean {
    const focusableElements = getFocusableElements(container || document.body);
    const currentIndex = focusableElements.indexOf(current);

    if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
        focusableElements[currentIndex + 1].focus();
        return true;
    }

    return false;
}

/**
 * Move focus to the previous focusable element
 */
export function focusPrevious(
    current: HTMLElement,
    container?: HTMLElement
): boolean {
    const focusableElements = getFocusableElements(container || document.body);
    const currentIndex = focusableElements.indexOf(current);

    if (currentIndex > 0) {
        focusableElements[currentIndex - 1].focus();
        return true;
    }

    return false;
}

// =============================================================================
// 🔊 Screen Reader Utilities
// =============================================================================

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
    message: string,
    priority: "polite" | "assertive" = "polite"
): void {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Create visually hidden element for screen readers
 */
export function createScreenReaderOnly(text: string): HTMLElement {
    const element = document.createElement("span");
    element.className = "sr-only";
    element.textContent = text;
    return element;
}

// =============================================================================
// 🎨 Color and Contrast Utilities
// =============================================================================

/**
 * Calculate color contrast ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
        // Convert hex to RGB
        const hex = color.replace("#", "");
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;

        // Apply gamma correction
        const rsRGB =
            r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        const gsRGB =
            g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        const bsRGB =
            b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

        return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG contrast requirements
 */
export function meetsContrastRequirement(
    foreground: string,
    background: string,
    level: "AA" | "AAA" = "AA",
    size: "normal" | "large" = "normal"
): boolean {
    const ratio = getContrastRatio(foreground, background);

    if (level === "AAA") {
        return size === "large" ? ratio >= 4.5 : ratio >= 7;
    } else {
        return size === "large" ? ratio >= 3 : ratio >= 4.5;
    }
}

// =============================================================================
// ⌨️ Keyboard Navigation Utilities
// =============================================================================

/**
 * Handle roving tabindex for a group of elements
 */
export function createRovingTabindex(elements: HTMLElement[]): {
    setActive: (index: number) => void;
    getActive: () => number;
    moveNext: () => void;
    movePrevious: () => void;
    cleanup: () => void;
} {
    let activeIndex = 0;

    const updateTabindexes = () => {
        elements.forEach((element, index) => {
            element.setAttribute(
                "tabindex",
                index === activeIndex ? "0" : "-1"
            );
        });
    };

    const handleKeydown = (event: KeyboardEvent) => {
        let newIndex = activeIndex;

        switch (event.key) {
            case "ArrowRight":
            case "ArrowDown":
                event.preventDefault();
                newIndex = (activeIndex + 1) % elements.length;
                break;
            case "ArrowLeft":
            case "ArrowUp":
                event.preventDefault();
                newIndex =
                    activeIndex === 0 ? elements.length - 1 : activeIndex - 1;
                break;
            case "Home":
                event.preventDefault();
                newIndex = 0;
                break;
            case "End":
                event.preventDefault();
                newIndex = elements.length - 1;
                break;
        }

        if (newIndex !== activeIndex) {
            activeIndex = newIndex;
            updateTabindexes();
            elements[activeIndex]?.focus();
        }
    };

    // Add event listeners
    elements.forEach((element) => {
        element.addEventListener("keydown", handleKeydown);
        element.addEventListener("focus", () => {
            const index = elements.indexOf(element);
            if (index >= 0) {
                activeIndex = index;
                updateTabindexes();
            }
        });
    });

    // Initialize
    updateTabindexes();

    return {
        setActive: (index: number) => {
            if (index >= 0 && index < elements.length) {
                activeIndex = index;
                updateTabindexes();
                elements[activeIndex]?.focus();
            }
        },
        getActive: () => activeIndex,
        moveNext: () => {
            activeIndex = (activeIndex + 1) % elements.length;
            updateTabindexes();
            elements[activeIndex]?.focus();
        },
        movePrevious: () => {
            activeIndex =
                activeIndex === 0 ? elements.length - 1 : activeIndex - 1;
            updateTabindexes();
            elements[activeIndex]?.focus();
        },
        cleanup: () => {
            elements.forEach((element) => {
                element.removeEventListener("keydown", handleKeydown);
            });
        },
    };
}

// =============================================================================
// 🏷️ ARIA Utilities
// =============================================================================

/**
 * Generate unique IDs for ARIA relationships
 */
export function generateAriaId(prefix: string = "aria"): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Set up ARIA relationships between elements
 */
export function setupAriaRelationship(
    trigger: HTMLElement,
    target: HTMLElement,
    relationship:
        | "controls"
        | "describedby"
        | "labelledby"
        | "owns"
        | "activedescendant"
): string {
    const id = target.id || generateAriaId();

    if (!target.id) {
        target.id = id;
    }

    trigger.setAttribute(`aria-${relationship}`, id);
    return id;
}

/**
 * Create accessible button with proper ARIA attributes
 */
export function createAccessibleButton(
    text: string,
    options: {
        pressed?: boolean;
        expanded?: boolean;
        disabled?: boolean;
        describedBy?: string;
        onClick?: () => void;
    } = {}
): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = text;
    button.type = "button";

    if (options.pressed !== undefined) {
        button.setAttribute("aria-pressed", options.pressed.toString());
    }

    if (options.expanded !== undefined) {
        button.setAttribute("aria-expanded", options.expanded.toString());
    }

    if (options.disabled) {
        button.disabled = true;
    }

    if (options.describedBy) {
        button.setAttribute("aria-describedby", options.describedBy);
    }

    if (options.onClick) {
        button.addEventListener("click", options.onClick);
    }

    return button;
}

// =============================================================================
// 📱 Responsive Accessibility
// =============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if user is using high contrast mode
 */
export function isHighContrastMode(): boolean {
    return window.matchMedia("(prefers-contrast: high)").matches;
}

/**
 * Get user's preferred color scheme
 */
export function getPreferredColorScheme(): "light" | "dark" {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

/**
 * Check if user is using a keyboard for navigation
 */
export function isKeyboardUser(): boolean {
    let isUsingKeyboard = false;

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === "Tab") {
            isUsingKeyboard = true;
            document.body.classList.add("using-keyboard");
        }
    };

    const handleMousedown = () => {
        isUsingKeyboard = false;
        document.body.classList.remove("using-keyboard");
    };

    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("mousedown", handleMousedown);

    return isUsingKeyboard;
}

// =============================================================================
// 🧪 Accessibility Testing Utilities
// =============================================================================

/**
 * Check element for common accessibility issues
 */
export function checkAccessibility(element: HTMLElement): {
    issues: string[];
    warnings: string[];
    score: number;
} {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for alt text on images
    const images = element.querySelectorAll("img");
    images.forEach((img) => {
        if (!img.alt && img.alt !== "") {
            issues.push(`Image missing alt text: ${img.src}`);
        }
    });

    // Check for proper heading structure
    const headings = element.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let lastLevel = 0;
    headings.forEach((heading) => {
        const level = parseInt(heading.tagName[1]);
        if (level > lastLevel + 1) {
            warnings.push(
                `Heading level skipped: ${heading.tagName} after h${lastLevel}`
            );
        }
        lastLevel = level;
    });

    // Check for form labels
    const inputs = element.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
        if (!input.id || !element.querySelector(`label[for="${input.id}"]`)) {
            if (
                !input.getAttribute("aria-label") &&
                !input.getAttribute("aria-labelledby")
            ) {
                issues.push("Form input missing label");
            }
        }
    });

    // Check for sufficient color contrast
    const textElements = element.querySelectorAll("*");
    textElements.forEach((el) => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;

        if (
            color &&
            backgroundColor &&
            color !== "rgba(0, 0, 0, 0)" &&
            backgroundColor !== "rgba(0, 0, 0, 0)"
        ) {
            // This would need actual color conversion for proper testing
            // For now, just check for obvious issues
            if (color === backgroundColor) {
                issues.push("Text and background color are the same");
            }
        }
    });

    // Check for keyboard accessibility
    const interactiveElements = element.querySelectorAll(
        "button, a, input, textarea, select, [tabindex]"
    );
    interactiveElements.forEach((el) => {
        if (el.getAttribute("tabindex") === "-1" && el.tagName !== "DIV") {
            warnings.push("Interactive element removed from tab order");
        }
    });

    // Calculate basic accessibility score
    const totalChecks =
        images.length + inputs.length + interactiveElements.length;
    const totalIssues = issues.length;
    const score =
        totalChecks > 0
            ? Math.max(0, ((totalChecks - totalIssues) / totalChecks) * 100)
            : 100;

    return {
        issues,
        warnings,
        score: Math.round(score),
    };
}

// =============================================================================
// 🎛️ Accessibility Settings
// =============================================================================

export interface AccessibilitySettings {
    reducedMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
    keyboardNavigation: boolean;
    screenReaderOptimized: boolean;
}

/**
 * Get user's accessibility preferences
 */
export function getAccessibilitySettings(): AccessibilitySettings {
    return {
        reducedMotion: prefersReducedMotion(),
        highContrast: isHighContrastMode(),
        largeText: window.matchMedia("(prefers-contrast: high)").matches,
        keyboardNavigation: isKeyboardUser(),
        screenReaderOptimized:
            window.navigator.userAgent.includes("NVDA") ||
            window.navigator.userAgent.includes("JAWS") ||
            window.navigator.userAgent.includes("VoiceOver"),
    };
}

/**
 * Apply accessibility settings to the document
 */
export function applyAccessibilitySettings(
    settings: AccessibilitySettings
): void {
    const body = document.body;

    body.classList.toggle("reduced-motion", settings.reducedMotion);
    body.classList.toggle("high-contrast", settings.highContrast);
    body.classList.toggle("large-text", settings.largeText);
    body.classList.toggle("keyboard-navigation", settings.keyboardNavigation);
    body.classList.toggle(
        "screen-reader-optimized",
        settings.screenReaderOptimized
    );
}
