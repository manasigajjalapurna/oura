# Setting Up Locally

## Quick Start

1. **Clone the repo** (if you haven't):
```bash
git clone https://github.com/manasigajjalapurna/oura.git
cd oura
git checkout claude/oura-ring-dashboard-X5WUO
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create `.env.local`** in the project root:
```env
OURA_API_TOKEN=your_oura_token_here
ANTHROPIC_API_KEY=your_anthropic_key_here
INITIAL_SYNC_DAYS=60
MORNING_DIGEST_HOUR=6
AFTERNOON_DIGEST_HOUR=14
EVENING_DIGEST_HOUR=21
```

Replace `your_oura_token_here` with your actual Oura API token and `your_anthropic_key_here` with your Anthropic API key.

4. **Setup database**:
```bash
npm run setup
```

5. **Start the server**:
```bash
npm run dev
```

6. **Open in browser**:
```
http://localhost:3000
```

7. **IMPORTANT - First thing to do**:
   - Click "⟳ Sync Oura Data"
   - Wait 30-60 seconds for it to fetch your real data
   - Then refresh the digest

## Why It Didn't Work on the Remote Server

The Oura API couldn't be reached from the development environment (network restrictions). On your local laptop with normal internet access, it will work perfectly!
