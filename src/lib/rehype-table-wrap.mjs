/**
 * Wraps every markdown-authored <table> in <div class="table-wrap"> so wide
 * tables scroll inside their own container instead of forcing the page to
 * scroll horizontally on mobile.
 *
 * Applies to .md and .mdx content. Tables rendered by .astro components already
 * ship their own wrapper, and those are not touched (they never reach here).
 */
export default function rehypeTableWrap() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === 'element' && child.tagName === 'table') {
          node.children[i] = {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-wrap'] },
            children: [child],
          };
          walk(child);
        } else {
          walk(child);
        }
      }
    };
    walk(tree);
  };
}
