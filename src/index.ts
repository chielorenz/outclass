type Variant = { name: string; options: Record<string, string> };

type Compound = { choice: Record<string, string | string[]>; value: string };

type Mod = (v: string) => string;

type Op =
	| { type: "input"; value: string }
	| { type: "variant"; value: Variant }
	| { type: "compound"; value: Compound }
	| { type: "mod"; value: Mod }
	| { type: "slot"; value: string }
	| { type: "push-slot" }
	| { type: "pop-slot" };

type ExtractS<T> = T extends { readonly " $slots": infer S } ? S : never;

type ExtractD<T> = T extends { readonly " $hasDefault": infer D }
	? D extends boolean
		? D
		: false
	: false;

type IsString<T> = T extends string ? true : false;

type Or<X extends boolean, Y extends boolean> = true extends X | Y
	? true
	: false;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
	k: infer I,
) => void
	? I
	: never;

type CompoundChoice<V> = {
	[K in keyof V]?: Exclude<V[K], undefined> | Exclude<V[K], undefined>[];
};

export type VariantsOf<T> = T extends {
	resolve(choice?: Partial<infer V>): any;
}
	? V
	: never;

function isObject(value: unknown): value is Record<string, string> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

class Outclass<
	V = {},
	S extends string = never,
	D extends boolean = false,
	A extends string = "base",
> {
	declare readonly " $slots": S;
	declare readonly " $hasDefault": D;

	#parent?: Outclass<any, any, any, any>;
	#ops: Op[];
	#collectedOps?: Op[];
	#collectedVariants?: Variant[];
	#hasSlot?: boolean;
	#hasDynamic?: boolean;
	#staticResult?: string | Record<string, string>;
	#choiceKeys?: string[];
	#dynamicCache?: Record<string, string | Record<string, string>>;

	constructor(parent?: Outclass<any, any, any, any>, ops?: Op[]) {
		this.#parent = parent;
		this.#ops = ops ?? [];
	}

	#ensureCached(): void {
		if (this.#collectedOps) return;

		const chunks: Op[][] = [];
		let cur: Outclass<any, any, any, any> | undefined = this;
		while (cur) {
			if (cur.#collectedOps) {
				chunks.push(cur.#collectedOps);
				break;
			}
			chunks.push(cur.#ops);
			cur = cur.#parent;
		}
		const cached: Op[] = [];
		for (let i = chunks.length - 1; i >= 0; i--) {
			for (let j = 0; j < chunks[i].length; j++) {
				cached.push(chunks[i][j]);
			}
		}
		this.#collectedOps = cached;

		this.#ops = [];
		this.#parent = undefined;

		const variants: Variant[] = [];
		const choiceKeys = new Set<string>();
		let hasSlot = false;
		let hasDynamic = false;
		for (let i = 0; i < cached.length; i++) {
			const op = cached[i];
			if (op.type === "variant" || op.type === "compound") hasDynamic = true;
			if (op.type === "variant") {
				variants.push(op.value);
				choiceKeys.add(op.value.name);
			} else if (op.type === "compound") {
				for (const k in op.value.choice) choiceKeys.add(k);
			} else if (op.type === "slot") {
				hasSlot = true;
			}
		}
		this.#collectedVariants = variants;
		this.#hasSlot = hasSlot;
		this.#hasDynamic = hasDynamic;
		this.#choiceKeys = Array.from(choiceKeys);
	}

	static #collect(oc: Outclass<any, any, any, any>, out: Op[]): void {
		oc.#ensureCached();
		for (let i = 0; i < oc.#collectedOps!.length; i++) {
			out.push(oc.#collectedOps![i]);
		}
	}

	variant<K extends string, O extends Record<string, string>>(
		name: K,
		options: O,
	): Outclass<
		V & Partial<Record<K, keyof O & string>>,
		S,
		Or<D, A extends "base" ? true : false>,
		A
	>;
	variant(
		choice: CompoundChoice<V>,
		value: string,
	): Outclass<V, S, Or<D, A extends "base" ? true : false>, A>;
	variant(arg1: any, arg2: any): any {
		if (typeof arg1 === "string" && isObject(arg2)) {
			return new Outclass(this, [
				{ type: "variant", value: { name: arg1, options: arg2 } },
			]);
		}

		if (isObject(arg1) && typeof arg2 === "string") {
			return new Outclass(this, [
				{ type: "compound", value: { choice: arg1, value: arg2 } },
			]);
		}
		throw new Error(
			"Invalid arguments passed to variant(). Expected (name, options) or (choice, value).",
		);
	}

	slot<K extends string>(name: K): Outclass<V, S | K, D, K> {
		return new Outclass<V, S | K, D, K>(this, [{ type: "slot", value: name }]);
	}

	transform(...values: Mod[]): Outclass<V, S, D, A> {
		const ops: Op[] = [];
		for (const value of values) ops.push({ type: "mod", value });
		return new Outclass(this, ops);
	}

	add<C extends unknown[]>(
		...values: C
	): Outclass<
		V & UnionToIntersection<VariantsOf<C[number]>>,
		S | (ExtractS<C[number]> & string),
		Or<
			D,
			A extends "base" ? Or<ExtractD<C[number]>, IsString<C[number]>> : false
		>,
		A
	> {
		const ops: Op[] = [];
		for (let i = 0; i < values.length; i++) {
			const value = values[i];
			if (typeof value === "string") {
				if (!/[\s]/.test(value)) {
					if (value) ops.push({ type: "input", value });
				} else {
					const cleaned = value.trim().replace(/\s+/g, " ");
					if (cleaned) ops.push({ type: "input", value: cleaned });
				}
			} else if (value instanceof Outclass) {
				ops.push({ type: "push-slot" });
				Outclass.#collect(value, ops);
				ops.push({ type: "pop-slot" });
			}
		}
		return new Outclass(this, ops);
	}

	resolve(
		choice?: Partial<V>,
	): [S] extends [never]
		? string
		: [D] extends [true]
			? Record<S | "base", string>
			: Record<S, string>;
	resolve(choice?: Record<string, any>) {
		this.#ensureCached();
		if (!this.#hasDynamic && this.#staticResult !== undefined) {
			return this.#staticResult;
		}

		let cacheKey = "";
		if (this.#hasDynamic) {
			const keys = this.#choiceKeys!;
			for (let i = 0; i < keys.length; i++) {
				const k = keys[i];
				const val = choice?.[k];
				if (val !== undefined) {
					cacheKey += `${k}:${typeof val}:${val};`;
				}
			}
			if (this.#dynamicCache && this.#dynamicCache[cacheKey] !== undefined) {
				return this.#dynamicCache[cacheKey];
			}
		}

		const ops = this.#collectedOps!;
		const variants = this.#collectedVariants!;

		const selection: Record<string, string> = {};
		for (let i = 0; i < variants.length; i++) {
			const variant = variants[i];
			const choosen = choice?.[variant.name];
			if (choosen && variant.options[choosen]) {
				selection[variant.name] = variant.options[choosen];
			} else if (variant.options.default) {
				selection[variant.name] = variant.options.default;
			}
		}

		const slotStack = ["base"];
		const classes: Record<string, string[]> = {};
		const globalMods: Mod[] = [];
		const slotMods: Record<string, Mod[]> = {};

		for (let i = 0; i < ops.length; i++) {
			const op = ops[i];
			const currentSlot = slotStack[slotStack.length - 1]!;
			if (op.type === "input") {
				(classes[currentSlot] ??= []).push(op.value);
			} else if (op.type === "variant") {
				const selected = selection[op.value.name];
				if (selected) (classes[currentSlot] ??= []).push(selected);
			} else if (op.type === "compound") {
				let isActive = true;
				for (const variantName in op.value.choice) {
					const variantOption = op.value.choice[variantName];
					const selectedOption = choice?.[variantName] || "default";
					const isMatch = Array.isArray(variantOption)
						? variantOption.includes(selectedOption)
						: variantOption === selectedOption;
					if (!isMatch) {
						isActive = false;
						break;
					}
				}
				if (isActive) (classes[currentSlot] ??= []).push(op.value.value);
			} else if (op.type === "mod") {
				if (currentSlot === "base") {
					if (!globalMods.includes(op.value)) globalMods.push(op.value);
				} else {
					slotMods[currentSlot] ??= [];
					if (!slotMods[currentSlot].includes(op.value))
						slotMods[currentSlot].push(op.value);
				}
			} else if (op.type === "slot") {
				slotStack[slotStack.length - 1] = op.value;
				classes[op.value] ??= [];
			} else if (op.type === "push-slot") {
				slotStack.push(currentSlot);
			} else if (op.type === "pop-slot") {
				slotStack.pop();
			}
		}

		const slotsObj: Record<string, string> = {};
		for (const slotName in classes) {
			let slotString = classes[slotName].join(" ");
			const scoped = slotMods[slotName];
			if (scoped) {
				slotString = scoped.reduce(
					(v, mod) => (globalMods.includes(mod) ? v : mod(v)),
					slotString,
				);
			}
			slotString = globalMods.reduce((v, mod) => mod(v), slotString);
			slotsObj[slotName] = slotString;
		}

		const result = this.#hasSlot ? slotsObj : (slotsObj.base ?? "");
		if (!this.#hasDynamic) {
			this.#staticResult = result;
		} else {
			if (!this.#dynamicCache) this.#dynamicCache = Object.create(null);
			this.#dynamicCache![cacheKey] = result;
		}
		return result;
	}
}

const oc = new Outclass();

export { type Outclass, oc };
