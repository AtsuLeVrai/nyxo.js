import { Gateway } from "@nyxjs/gateway";
import { Rest } from "@nyxjs/rest";
import { BenchmarkManager } from "./benchmark.js";
import { BENCHMARK_OPTIONS, GATEWAY_OPTIONS, REST_OPTIONS } from "./config.js";

async function main(): Promise<void> {
  try {
    const rest = new Rest(REST_OPTIONS);
    const gateway = new Gateway(rest, GATEWAY_OPTIONS);
    const benchmark = new BenchmarkManager(gateway, BENCHMARK_OPTIONS);

    rest.on("rateLimit", (info) => console.warn("Rate limit atteint :", info));
    rest.on("response", console.log);
    rest.on("request", console.log);

    gateway.on("error", console.error);
    gateway.on("warn", console.warn);
    gateway.on("debug", console.log);
    gateway.on("dispatch", console.log);

    gateway.on("connecting", () =>
      console.info("Connexion au Gateway en cours..."),
    );
    gateway.on("connected", () =>
      console.info("Connecté au Gateway avec succès !"),
    );

    console.info("Démarrage du bot...");
    await gateway.connect();

    const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGUSR2"];

    for (const signal of signals) {
      process.on(signal, () => {
        console.info(`Signal ${signal} reçu, fermeture en cours...`);
        benchmark.destroy();
        gateway.destroy();
        process.exit(0);
      });
    }
    setTimeout(async () => {
      try {
        await rest.get("/test");
      } catch (error) {
        console.error("Erreur fatale :", error);
      }
    }, 5000);
  } catch (error) {
    console.error("Erreur fatale :", error);
  }
}

main().catch((error) => {
  console.error("Erreur non gérée :", error);
});
