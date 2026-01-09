/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "thesivest",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws", // This tells SST to deploy to AWS
    };
  },
  async run() {
    // This is where you define your resources.
    // If you are using TanStack Start, you'd add this:

    const database_connection = new sst.Secret("VITE_DATABASE_URL_POOLER");
    const better_auth_secret = new sst.Secret("BETTER_AUTH_SECRET");
    const better_auth_url = new sst.Secret("BETTER_AUTH_URL");
    const gemini_key = new sst.Secret("GEMINI_API_KEY");

    new sst.aws.TanStackStart("MyWeb", {
      link: [database_connection, better_auth_secret, better_auth_url, gemini_key],
    });
  },
});
