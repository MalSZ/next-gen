import { SvelteSet } from "svelte/reactivity";
import { describe, expect } from "vitest";
import { SelectionState } from "./selection-state.svelte";
import { testWithEffect } from "./test.svelte";

describe("alt-selection-state", () => {
	testWithEffect("uncontrolled single", () => {
		const state = new SelectionState({
			multiple: false,
		});
		expect(state.current).toBeUndefined();
		state.add("test");
		expect(state.current).toBe("test");
		state.add("hithere");
		expect(state.current).toBe("hithere");
	});

	testWithEffect("uncontrolled multiple", () => {
		const state = new SelectionState({
			multiple: true,
		});
		expect(state.current).toEqual(new SvelteSet([]));
		state.add("test");
		expect(state.current).toEqual(new SvelteSet(["test"]));
		state.add("hithere");
		expect(state.current).toEqual(new SvelteSet(["test", "hithere"]));
	});

	testWithEffect("defaultValue single", () => {
		const state = new SelectionState({
			value: "1",
		});
		expect(state.current).toBe("1");
		state.add("2");
		expect(state.current).toBe("2");
	});

	testWithEffect("defaultValue multiple", () => {
		const state = new SelectionState({
			multiple: true,
			value: ["1"],
		});
		expect(state.current).toEqual(new SvelteSet(["1"]));
		state.add("2");
		expect(state.current).toEqual(new SvelteSet(["1", "2"]));
	});

	testWithEffect("controlled single", async () => {
		let value = $state<string | undefined>("1");
		const state = new SelectionState({
			multiple: false,
			value: () => value,
			onChange: (v) => {
				value = v;
			},
		});
		expect(state.current).toBe("1");
		state.add("2");
		expect(state.current).toBe("2");
		expect(value).toBe("2");

		await new Promise((res) => setTimeout(res, 100));
		expect(state.current).toBe("2");
		expect(value).toBe("2");
	});

	testWithEffect("controlled multiple", async () => {
		let value = $state<string[] | undefined>(["1"]);
		const state = new SelectionState({
			multiple: true,
			value: () => value,
			onChange: (v) => {
				value = [...v.values()];
			},
		});
		expect(state.current).toEqual(new SvelteSet(["1"]));
		state.add("2");
		expect(state.current).toEqual(new SvelteSet(["1", "2"]));
		expect(value).toEqual(["1", "2"]);

		await new Promise((res) => setTimeout(res, 100));
		expect(state.current).toEqual(new SvelteSet(["1", "2"]));
		expect(value).toEqual(["1", "2"]);
	});

	testWithEffect("uncontrolled alternating between single and multiple", async () => {
		let multiple = $state<boolean>(false);
		const state = new SelectionState({
			multiple: () => multiple,
			value: "1",
		});

		expect(state.current).toBe("1");

		state.add("2");
		expect(state.current).toBe("2");

		multiple = true;
		expect(state.current).toEqual(new SvelteSet(["2"]));

		state.add("1");
		expect(state.current).toEqual(new SvelteSet(["1", "2"]));

		multiple = false;
		expect(state.current).toBe("1");
	});
});
