export default function Home() {
    return (
        <h1 className="text-5xl font-bold mb-6 py-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 inline-block">
            Welcome to Nyx.js : test token {process.env.DISCORD_TOKEN}
        </h1>
    );
}
