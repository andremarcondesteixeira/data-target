export function getAugmentedAnchorsFrom(parent) {
    return parent.querySelectorAll('a[data-target], a[data-module]');
}
