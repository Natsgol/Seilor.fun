// Types based on the smart contract definitions in msg.rs and state.rs

export interface TokenInfo {
    creator: string; // Addr is a string on the client side
    creator_royalty_percent: number;
    supply: string; // Uint128 is a string on the client side
    name: string;
    backstory: string;
    image_url: string;
}

export interface GetPriceResponse {
    price: string; // Uint128 is a string on the client side
} 