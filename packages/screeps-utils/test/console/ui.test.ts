import { expect } from "chai";
import { createElement } from "../../src/console/ui.ts";

describe("Console UI helpers", () => {
  beforeEach(() => {
    (globalThis as { Game?: { time: number } }).Game = { time: 1234 };
  });

  it("escapes button onclick command attributes while preserving executable command text", () => {
    const command = `() => Game.rooms["W1N1"].name + ' ok'`;

    const html = createElement.button({ content: "Run", command });

    expect(html).to.include("\\&quot;W1N1\\&quot;");
    expect(html).to.include("' ok'");
    expect(html).to.not.include('Game.rooms["W1N1"]');
  });

  it("escapes form onclick attributes generated from command wrappers", () => {
    const html = createElement.form(
      "testForm",
      [{ type: "input", name: "name", label: "Name" }],
      { content: "Submit", command: `({name}) => "hello " + name` }
    );

    expect(html).to.include("onclick=");
    expect(html).to.include("&quot;hello &quot;");
    expect(html).to.not.include('({name}) => "hello " + name');
  });
});
