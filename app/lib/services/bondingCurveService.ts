// Placeholder for bonding curve logic

const initialPrice = 0.001;
const increment = 0.0001;

/**
 * Calculates the price to buy the next token.
 * Formula: price = initial_price + (supply^1.5 * increment)
 * @param supply - The current supply of the token.
 * @returns The price for the next token.
 */
export const getBuyPrice = (supply: number): number => {
  return initialPrice + Math.pow(supply, 1.5) * increment;
};

/**
 * Calculates the amount received for selling a token.
 * This would typically be the price of the previous token.
 * @param supply - The current supply of the token.
 * @returns The price for selling one token.
 */
export const getSellPrice = (supply: number): number => {
  if (supply <= 0) {
    return 0;
  }
  // The sell price is the price at the previous supply level
  return initialPrice + Math.pow(supply - 1, 1.5) * increment;
}; 