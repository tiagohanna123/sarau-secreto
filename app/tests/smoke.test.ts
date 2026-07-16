import { describe, it, expect } from "vitest";

describe("App", () => {
  it("exports are defined", async () => {
    // Smoke test: o módulo app é importável
    // Isso verifica que não há erros de sintaxe ou dependências quebradas
    const mod = await import("../src/app");
    expect(mod).toBeDefined();
  });
});
