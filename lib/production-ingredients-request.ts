import assert from 'node:assert/strict';

import Ajv, {
	SchemaObject,
} from 'ajv/dist/2020';

import production_ingredients_request_schema from
	'../generated-schemas/production-ingredients-request.json' with {type: 'json'};
import recipe_selection_schema from
	'../generated-schemas/recipe-selection.json' with {type: 'json'};
import {
	NoMatchError,
} from '../Docs.json.ts/lib/Exceptions';
import {
	FGItemDescriptor,
} from '../generated-types/update8/data/CoreUObject/FGItemDescriptor';
import {
	FGItemDescriptor__FGResourceDescriptor__type,
} from '../generated-types/update8/classes/CoreUObject/FGItemDescriptor';
import {
	FGRecipe,
} from '../generated-types/update8/data/CoreUObject/FGRecipe';
import {
	FGRecipe__type,
} from '../generated-types/update8/classes/CoreUObject/FGRecipe';
import {
	amount_string,
	Math,
	number_arg,
} from './Math';
import {
	PlannerRequest,
	UnrealEngineString_right_x_C_suffix,
} from './planner-request';
import {
	FGBuildingDescriptor,
} from '../generated-types/update8/data/CoreUObject/FGBuildingDescriptor';
import {
	FGBuildingDescriptor__type,
} from '../generated-types/update8/classes/CoreUObject/FGBuildingDescriptor';
import {
	FGResourceDescriptor,
} from '../generated-types/update8/data/CoreUObject/FGResourceDescriptor';
import {
	FGResourceDescriptor__type,
} from '../generated-types/update8/classes/CoreUObject/FGResourceDescriptor';
import {
	integer_string__type,
} from '../generated-types/update8/common/unassigned';
import {
	UnrealEngineString,
} from '../generated-types/update8/utils/validators';
import BigNumber from 'bignumber.js';
import {
	not_undefined,
} from '../Docs.json.ts/assert/CustomAssert';
import {
	is_string,
} from '../Docs.json.ts/lib/StringStartsWith';

const recipes:{
	[
		key in FGRecipe__type[
			'ClassName'
		]
	]: FGRecipe__type
} = Object.fromEntries(
	FGRecipe.Classes.map(e => [e.ClassName, e])
);
const buildings:{
	[
		key in FGBuildingDescriptor__type[
			'ClassName'
		]
	]: FGBuildingDescriptor__type
} = Object.fromEntries(
	FGBuildingDescriptor.Classes.map(e => [e.ClassName, e])
);
const items:{
	[
		key in FGItemDescriptor__FGResourceDescriptor__type[
			'ClassName'
		]
	]: FGItemDescriptor__FGResourceDescriptor__type;
} = Object.fromEntries(
	FGItemDescriptor.Classes.map(e => [e.ClassName, e])
);
const resources:{
	[
		key in FGResourceDescriptor__type[
			'ClassName'
		]
	]: FGResourceDescriptor__type
} = Object.fromEntries(
	FGResourceDescriptor.Classes.map(e => [e.ClassName, e])
);

export type production_ingredients_request = {
	input?: recipe_ingredients_request_output<amount_string>[],
	recipe_selection?: {
		[key in `${'Desc'|'BP'|'Foundation'}_${string}_C`]: `${'Recipe'|'Build'}_${string}_C`
	},
	pool: {
		production: keyof typeof recipe_selection_schema['properties'],
		amount: number_arg,
	}[],
};

export type recipe_ingredients_request_ingredient<
T extends amount_string|BigNumber = amount_string
> = {
	item: keyof typeof items,
	amount: T,
};
export type recipe_ingredients_request_output<
	T extends amount_string|BigNumber = amount_string
> = {
	item: (
		keyof (
			| typeof buildings
			| typeof items
			| typeof resources
		)
	),
	amount: T,
};

export type production_ingredients_request_result<
	T extends amount_string|BigNumber = amount_string
> = {
	ingredients: recipe_ingredients_request_ingredient<T>[],
	output: recipe_ingredients_request_output<T>[],
	surplus: recipe_ingredients_request_output<T>[],
};

export class ProductionIngredientsRequest extends PlannerRequest<
	production_ingredients_request,
	production_ingredients_request_result
> {
	constructor(ajv:Ajv)
	{
		ajv.addSchema(recipe_selection_schema);
		(production_ingredients_request_schema
			.properties
			.pool
			.items
			.properties
			.production
			.enum as unknown) = Object.keys(
				recipe_selection_schema.properties
			);
		super(ajv, production_ingredients_request_schema as SchemaObject);
	}

	fromUrlQuery(query:string): production_ingredients_request
	{
		const regex =
			/^(input|pool|recipe_selection)\[(?:Desc|BP|Foundation)_[^.]+_C\]$/
		;
		const params = new URLSearchParams(query);

		const keys = [...params.keys()].filter(maybe => regex.test(maybe));

		const input = keys.filter(maybe => maybe.startsWith('input['));
		const pool = keys.filter(maybe => maybe.startsWith('pool['));
		const recipe_selection = Object.fromEntries(keys.filter(
			maybe => maybe.startsWith('recipe_selection[')
		).map((e): [string, unknown] => [
			e.substring(17, e.length - 1),
			params.get(e),
		]).filter((maybe): maybe is [
			string,
			`${'Recipe'|'Build'}_${string}_C`,
		] => {
			return (
				is_string(maybe[1])
				&& /^(?:Recipe|Build)_[^.]+_C$/.test(maybe[1])
			);
		}));

		function map_filter<
			Property extends string = string
		>(
			keys:string[],
			key_prefix:string,
			property:Exclude<Property, 'amount'>
		): (
			& {
				[key in Property]: keyof (
					typeof recipe_selection_schema['properties']
				)
			}
			& {amount: amount_string}
		)[] {
			return keys.map((e) => {
				return {
					[property]: e.substring(
						key_prefix.length,
						e.length - 1
					),
					amount: params.get(e),
				};
			}).filter(
				(maybe): maybe is (
					& {
						[key in Property]: keyof (
							typeof recipe_selection_schema['properties']
						)
					}
					& {amount: amount_string}
				) => {
					const value = maybe[property];

					return (
						is_string(value)
						&& value in recipe_selection_schema.properties
						&& Math.is_amount_string(maybe.amount)
					);
				}
			);
		}

		const result:production_ingredients_request = {
			pool: map_filter(pool, 'pool[', 'production'),
		};

		const input_value = map_filter(input, 'input[', 'item');

		if (input_value.length) {
			result.input = input_value;
		}

		if (Object.keys(recipe_selection).length > 0) {
			result.recipe_selection = recipe_selection;
		}

		return result;
	}

	protected amend_ItemClass_amount(
		ItemClass:{
			ItemClass: UnrealEngineString;
			Amount: integer_string__type;
		}
	): {
		ItemClass: UnrealEngineString;
		Amount: number_arg;
	} {

		const Desc_c = UnrealEngineString_right_x_C_suffix(
			ItemClass.ItemClass
		);

		return {
			ItemClass: ItemClass.ItemClass,
			Amount: (
				(
					(
						Desc_c in resources
						&& 'RF_SOLID' !== resources[Desc_c].mForm
					)
					|| (
						Desc_c in items
						&& 'RF_SOLID' !== items[Desc_c].mForm
					)
				)
					? Math.divide(ItemClass.Amount, 1000)
					: ItemClass.Amount
			),
		};
	}

	protected calculate_precisely(
		data:production_ingredients_request,
		surplus?:recipe_ingredients_request_output<BigNumber>[]
	): production_ingredients_request_result<BigNumber> {
		const ingredients:{
			[key in keyof typeof items]: BigNumber;
		} = {};
		const input:{[key: string]: BigNumber} = {};
		for (const entry of (surplus || data.input || [])) {
			if (!(entry.item in input)) {
				input[entry.item] = BigNumber(0);
			}

			input[entry.item] = input[entry.item].plus(entry.amount);
		}
		const output:{
			[key in keyof (
				| typeof buildings
				| typeof resources
			)]: BigNumber;
		} = {};

		for (const entry of data.pool) {
			const {production, amount:output_amount} = entry;
			let {amount} = entry;
			let amount_from_input = BigNumber(0);

			if (production in input) {
				if (input[production].isLessThan(amount)) {
					amount_from_input = input[production].minus(0);
					amount = BigNumber(amount).minus(amount_from_input);
				} else {
					amount_from_input = BigNumber(output_amount);
					amount = BigNumber(0);
				}
			}

			output[production] = amount_from_input;

			if (0 === BigNumber(amount).comparedTo(0)) {
				continue;
			}

			const recipe = (
				data.recipe_selection && production in data.recipe_selection
					? data.recipe_selection[production]
					: recipe_selection_schema.properties[production].default
			);

			if (undefined === recipes[recipe]) {
				assert.equal(
					recipe.startsWith('Build_'),
					true,
					new NoMatchError(
						{
							production,
							amount,
							recipe,
						},
						'Expecting to find a building recipe!'
					)
				);

				assert.equal(production in resources, true, new NoMatchError(
					{
						recipe,
						expected: production,
					},
					`Supported ingredient found but missing item!`
				));

				output[
					production as keyof typeof resources
				] = Math.append_multiply(
					output[production as keyof typeof resources],
					1,
					amount
				);

				continue;
			}

			const {
				mIngredients,
				mProduct,
			} = recipes[recipe];

			const ingredient_amounts = mIngredients.map(
				e => this.amend_ItemClass_amount(e).Amount
			);

			const product_amounts = mProduct.map(
				e => this.amend_ItemClass_amount(e).Amount
			);

			const amounts = [
				...ingredient_amounts,
				...product_amounts,
			];

			assert.equal(
				amounts.length >= 2,
				true,
				new NoMatchError(
					{
						amounts,
					},
					'Expected at least two numbers!'
				)
			);

			const divisor = Math.least_common_multiple(
				[
					1,
					...product_amounts,
				] as [number_arg, number_arg, ...number_arg[]]
			);

			for (const ingredient of mIngredients) {
				const Desc_c = UnrealEngineString_right_x_C_suffix(
					ingredient.ItemClass
				);

				assert.equal(
					(
						Desc_c in items
						|| Desc_c in resources
					),
					true,
					new NoMatchError(
						{
							recipe,
							ingredient: ingredient.ItemClass.right,
							expected: Desc_c,
						},
						`Supported ingredient found (${Desc_c}) but missing item!`
					)
				);

				if (!(Desc_c in ingredients)) {
					ingredients[Desc_c] = BigNumber(0);
				}

				ingredients[Desc_c] = Math.append_multiply(
					ingredients[Desc_c],
					Math.divide(
						this.amend_ItemClass_amount(ingredient).Amount,
						divisor
					),
					amount
				);
			}

			for (const product of mProduct) {
				const Desc_c = UnrealEngineString_right_x_C_suffix(
					product.ItemClass
				);

				assert.equal(
					(
						Desc_c in buildings
						|| Desc_c in items
						|| Desc_c in resources
					),
					true,
					new NoMatchError(
						{
							recipe,
							product: product.ItemClass.right,
							expected: Desc_c,
						},
						'Supported product found but missing item!'
					)
				);

				if (!(Desc_c in output)) {
					output[Desc_c] = BigNumber(0);
				}

				output[Desc_c] = Math.append_multiply(
					output[Desc_c],
					Math.divide(
						this.amend_ItemClass_amount(product).Amount,
						divisor
					),
					amount
				);
			}
		}

		const result:production_ingredients_request_result<BigNumber> = {
			ingredients: Object.entries(ingredients).map(e => {
				return {
					item: e[0],
					amount: BigNumber.max(0, e[1].minus(input[e[0]] || 0)),
				};
			}).filter(maybe => maybe.amount.isGreaterThan(0)),
			output: Object.entries(output).map(e => {
				return {
					item: e[0],
					amount: e[1],
				};
			}),
			surplus: Object.entries(input).map(e => {
				return {
					item: e[0],
					amount: e[1]
						.minus(ingredients[e[0]] || 0)
						.minus(output[e[0]] || 0),
				};
			}).filter(maybe => maybe.amount.isGreaterThan(0)),
		};

		return result;
	}

	protected calculate_validated(
		data:production_ingredients_request
	): production_ingredients_request_result {
		const initial_result = this.calculate_precisely(data);
		const results = [initial_result];
		let surplus:recipe_ingredients_request_output<
			BigNumber
		>[] = initial_result.surplus;

		let checking_recursively = initial_result.ingredients.filter(
			maybe => !(maybe.item in resources)
		);

		while (checking_recursively.length > 0) {
			const when_done:recipe_ingredients_request_ingredient<
				BigNumber
			>[] = [];

			for (const check_deeper of checking_recursively) {
				assert.equal(
					check_deeper.item in recipe_selection_schema['properties'],
					true,
					new NoMatchError(
						check_deeper.item,
						'Item not found in recipe selection!'
					)
				);

				const deeper_result = this.calculate_precisely(
					{
						...data,
						pool: [{
							production: (
								check_deeper.item as keyof (
									typeof recipe_selection_schema[
										'properties'
									]
								)
							),
							amount: check_deeper.amount,
						}],
					},
					surplus
				);
				surplus = deeper_result.surplus;

				const self_output = deeper_result.output.find(
					maybe => maybe.item === check_deeper.item
				);

				not_undefined(self_output);

				self_output.amount = self_output.amount.minus(
					check_deeper.amount
				);

				const maybe_check_further = deeper_result.ingredients.filter(
					maybe => !(maybe.item in resources)
				);

				if (maybe_check_further.length) {
					when_done.push(...maybe_check_further);
				}

				results.push(deeper_result);
			}

			checking_recursively = when_done;
		}

		const ingredients:{[key: string]: BigNumber} = {};
		const output:{[key: string]: BigNumber} = {};

		for (const entry of results) {
			for (const ingredient of entry.ingredients) {
				if (!(ingredient.item in ingredients)) {
					ingredients[ingredient.item] = ingredient.amount;
				} else {
					ingredients[
						ingredient.item
					] = ingredients[ingredient.item].plus(
						ingredient.amount
					);
				}
			}

			for (const output_entry of entry.output) {
				if (!(output_entry.item in output)) {
					output[output_entry.item] = output_entry.amount;
				} else {
					output[
						output_entry.item
					] = output[output_entry.item].plus(
						output_entry.amount
					);
				}
			}
		}

		return {
			ingredients: Object.entries(ingredients).map(e => {
				return {
					item: e[0],
					amount: Math.round_off(e[1]),
				}
			}),
			output: Object.entries(output).map(e => {
				return {
					item: e[0],
					amount: Math.round_off(e[1]),
				}
			}).filter(maybe => '0' !== maybe.amount),
			surplus: surplus.filter(
				maybe => maybe.amount.isGreaterThan(0)
			).map(e => {
				return {
					item: e.item,
					amount: Math.round_off(e.amount),
				};
			}),
		};
	}
}
