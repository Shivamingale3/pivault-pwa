import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KeyRoundIcon } from "lucide-react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "@/components/modules/kit/empty-state";
import { Fab } from "@/components/modules/kit/fab";
import { FilterField } from "@/components/modules/kit/filter-field";

describe("EmptyState", () => {
  it("shows the icon tile, heading, body and actions", () => {
    render(
      <EmptyState
        icon={<KeyRoundIcon />}
        title="No passwords yet"
        actions={<button>Add a password</button>}
      >
        Add your first login.
      </EmptyState>,
    );
    expect(screen.getByRole("heading", { name: "No passwords yet" })).toBeInTheDocument();
    expect(screen.getByText("Add your first login.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add a password" })).toBeInTheDocument();
  });
});

describe("Fab", () => {
  it("is a named round button", async () => {
    const onClick = vi.fn();
    render(<Fab label="Add a note" onClick={onClick} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Add a note" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("FilterField", () => {
  it("filters as you type", async () => {
    function Harness() {
      const [value, setValue] = useState("");
      return (
        <FilterField
          value={value}
          onChange={setValue}
          placeholder="Filter this list"
          label="Filter"
        />
      );
    }
    render(<Harness />);
    const field = screen.getByRole("searchbox", { name: "Filter" });
    expect(field).toHaveAttribute("placeholder", "Filter this list");
    await userEvent.setup().type(field, "git");
    expect(field).toHaveValue("git");
  });
});
