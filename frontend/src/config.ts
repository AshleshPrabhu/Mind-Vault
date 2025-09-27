import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, metaMask} from 'wagmi/connectors'

export const config = createConfig({
    chains: [sepolia],
    connectors: [
        injected(),
        metaMask(),
    ],
    transports: {
        [sepolia.id]: http(),
    },
})

// API Configuration
export const API_BASE_URL = 'http://localhost:3000/api'

// Development mode flag
export const IS_DEV_MODE = import.meta.env.DEV