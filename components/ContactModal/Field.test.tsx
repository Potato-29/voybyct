import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Field from "./Field";

const render = (error?: string) =>
  renderToStaticMarkup(
    <Field label="Email" name="email" error={error}>
      {(control) => <input type="email" {...control} />}
    </Field>,
  );

describe("Field", () => {
  it("links the input to its error message when invalid", () => {
    const html = render("Please enter a valid email.");
    expect(html).toContain('aria-invalid="true"');
    expect(html).toMatch(/<input[^>]*aria-describedby="([^"]+)"/);
    const describedBy = html.match(/<input[^>]*aria-describedby="([^"]+)"/)![1];
    expect(html).toContain(`id="${describedBy}"`);
    expect(html).toContain("Please enter a valid email.");
  });

  it("does not mark a valid input as invalid", () => {
    const html = render();
    expect(html).not.toContain("aria-invalid");
    expect(html).not.toContain("aria-describedby");
  });

  it("associates the label with the input", () => {
    const html = render();
    const inputId = html.match(/<input[^>]*id="([^"]+)"/)![1];
    expect(html).toContain(`for="${inputId}"`);
  });
});
