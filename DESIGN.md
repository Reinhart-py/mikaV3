# The "Genius" Architecture

## Core Philosophy

We don't do local `.session` files. That's for peasants. We serialize the session auth key into a string and shove it into a MongoDB document. This makes the session "immortal" (until Telegram bans it, lol).

## Components

1.  **The Brain (mika.js)**: The main event loop. It asks you what you want to do and screams at you if you do it wrong.
2.  **The Muscle (src/engine.js)**: Wraps GramJS. It handles the MTProto handshake without crying.
3.  **The Vault (src/storage.js)**: Mongoose schemas. It talks to the cloud.
4.  **The Bouncer (src/security.js)**: Checks your HWID against a license key.

## Data Flow

User Input -> Enquirer -> GramJS -> StringSession -> MongoDB

## Security

We salt the HWID with some random garbage to make it look cool. The license check is basically a vibe check for your machine.
