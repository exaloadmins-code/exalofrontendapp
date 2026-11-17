/**
 * Format a BIDMAS association tree into a bracketed expression string.
 * Mirrors the offline 13B helper: leaves index operands; op_index indexes
 * operators in fixed_tokens. Always wraps binary nodes in parentheses so
 * nesting is unambiguous.
 */

export type AssociationTree =
  | number
  | {
      op_index: number;
      left: AssociationTree;
      right: AssociationTree;
    };

export function formatAssociationTree(
  tree: AssociationTree,
  tokens: readonly string[],
): string {
  if (typeof tree === 'number') {
    const token = tokens[2 * tree];
    if (typeof token !== 'string') {
      throw new Error(`leaf ${tree} is out of range for fixed_tokens`);
    }
    return token;
  }
  const left = formatAssociationTree(tree.left, tokens);
  const right = formatAssociationTree(tree.right, tokens);
  const op = tokens[tree.op_index];
  if (typeof op !== 'string') {
    throw new Error(`op_index ${tree.op_index} is out of range for fixed_tokens`);
  }
  return `(${left} ${op} ${right})`;
}

export function joinFixedTokens(tokens: readonly string[]): string {
  return tokens.join(' ');
}
