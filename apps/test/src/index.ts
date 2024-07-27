import { ApiVersions } from "@lunajs/rest";
import { Gateway } from "@lunajs/server";

const gateway = new Gateway({
	compress: true,
	intents: 513,
	token: "",
	properties: {
		browser: "Luna",
		device: "Luna",
		os: "linux",
	},
}, {
	v: ApiVersions.V10,
	encoding: "json",
	compress: "zlib-stream",
});
gateway.connect();
gateway.on("DEBUG", console.log);
gateway.on("ERROR", console.log);
gateway.on("CLOSE", console.log);
