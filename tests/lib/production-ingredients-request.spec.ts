import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';
import {
	production_ingredients_request_result,
	ProductionIngredientsRequest,
} from '../../lib/production-ingredients-request';
import {
	Numbers,
} from '../../lib/Numbers';
import {
	amount_string,
	NumberStrings,
} from '../../lib/NumberStrings';
import BigNumber from 'bignumber.js';
import {
	FGRecipe,
} from '../../generated-types/update8/data/CoreUObject/FGRecipe';
import {
	FGBuildableFrackingActivator,
// eslint-disable-next-line max-len
} from '../../generated-types/update8/data/CoreUObject/FGBuildableFrackingActivator';
import {
	filter_UnrealEngineString_right_x_C_suffix,
	UnrealEngineString_right_x_C_suffix,
} from '../../lib/planner-request';
import {
	FGResourceDescriptor,
} from '../../generated-types/update8/data/CoreUObject/FGResourceDescriptor';
import {
	FGBuildableWaterPump,
} from '../../generated-types/update8/data/CoreUObject/FGBuildableWaterPump';
import {
	FGBuildableResourceExtractor,
// eslint-disable-next-line max-len
} from '../../generated-types/update8/data/CoreUObject/FGBuildableResourceExtractor';

type flattened_result = {
	ingredients: {[key: string]: amount_string},
	output: {[key: string]: amount_string},
	surplus?: {[key: string]: amount_string},
};

function flattened_production_ingredients_request_result(
	input:production_ingredients_request_result
) : flattened_result {
	const calculating:{
		ingredients: {[key: string]: BigNumber},
		output: {[key: string]: BigNumber},
		surplus: {[key: string]: BigNumber},
	} = {
		ingredients: {},
		output: {},
		surplus: {},
	};

	for (const entry of input.ingredients) {
		if (!(entry.item in calculating.ingredients)) {
			calculating.ingredients[entry.item] = BigNumber(0);
		}

		calculating.ingredients[
			entry.item
		] = calculating.ingredients[
			entry.item
		].plus(entry.amount);
	}

	for (const entry of input.output) {
		if (!(entry.item in calculating.output)) {
			calculating.output[entry.item] = BigNumber(0);
		}

		calculating.output[
			entry.item
		] = calculating.output[
			entry.item
		].plus(entry.amount);
	}

	for (const entry of input.surplus || []) {
		if (!(entry.item in calculating.surplus)) {
			calculating.surplus[entry.item] = BigNumber(0);
		}

		calculating.surplus[
			entry.item
		] = calculating.surplus[
			entry.item
		].plus(entry.amount);
	}

	const surplus_entries = Object.entries(
		calculating.surplus
	).map((e): [string, amount_string] => [
		e[0],
		Numbers.round_off(e[1]),
	]);

	const result:flattened_result = {
		ingredients: Object.fromEntries(
			Object.entries(
				calculating.ingredients
			).map(e => [e[0], Numbers.round_off(e[1])])
		),
		output: Object.fromEntries(
			Object.entries(
				calculating.output
			).map(e => [
				e[0],
				Numbers.round_off(e[1]),
			])
		),
	};

	if (surplus_entries.length > 0) {
		result.surplus = Object.fromEntries(surplus_entries);
	}

	return result;
}

void describe('ProductionIngredientsRequest', () => {
	const instance = new ProductionIngredientsRequest();

	let does_not_throw_cases:UnrealEngineString_right_x_C_suffix[] =
		FGRecipe.Classes.reduce(
			(was, is) => {
				for (const product of is.mProduct) {
					const Desc_C = UnrealEngineString_right_x_C_suffix(
						product.ItemClass
					);

					if (!was.includes(Desc_C)) {
						was.push(Desc_C);
					}
				}

				return was;
			},
			FGResourceDescriptor.Classes.filter(
				(maybe) => (
					'RF_SOLID' === maybe.mForm
					&& filter_UnrealEngineString_right_x_C_suffix(
						maybe.ClassName
					)
				)
			).map(e => e.ClassName as UnrealEngineString_right_x_C_suffix)
		);

	does_not_throw_cases = [
		...FGBuildableFrackingActivator.Classes,
		...FGBuildableWaterPump.Classes,
		...FGBuildableResourceExtractor.Classes,
	].reduce(
		(was, is) => {
			if (is.mAllowedResources instanceof Array) {
				for (const resource of is.mAllowedResources) {
					const Desc_C = UnrealEngineString_right_x_C_suffix(
						resource
					);

					if (!was.includes(Desc_C)) {
						was.push(Desc_C);
					}
				}
			}

			return was;
		},
		does_not_throw_cases
	);

	void describe('calculate', () => {
		for (const Desc_C of does_not_throw_cases) {
			void it(
				`${
					instance.constructor.name
				}.calculate({pool: [{item: ${Desc_C}, amount: 1}]}) behaves`,
				() => {
					const get_result = () => instance.calculate({
						pool: [
							{
								item: Desc_C,
								amount: 1,
							},
						],
					});

					assert.doesNotThrow(get_result);
				}
			)
		}
	})

	void describe('validates', () => {
		const result_1:production_ingredients_request_result = {
			ingredients: [
				{
					item: 'Desc_ModularFrame_C',
					amount: NumberStrings.amount_string('15'),
				},
				{
					item: 'Desc_Cable_C',
					amount: NumberStrings.amount_string('25'),
				},
				{
					item: 'Desc_Cement_C',
					amount: NumberStrings.amount_string('100'),
				},
				{
					item: 'Desc_SteelPlate_C',
					amount: NumberStrings.amount_string('100'),
				},
				{
					item: 'Desc_IronPlateReinforced_C',
					amount: NumberStrings.amount_string('22.5'),
				},
				{
					item: 'Desc_IronRod_C',
					amount: NumberStrings.amount_string('157.5'),
				},
				{
					item: 'Desc_IronPlate_C',
					amount: NumberStrings.amount_string('135'),
				},
				{
					item: 'Desc_IronScrew_C',
					amount: NumberStrings.amount_string('270'),
				},
				{
					item: 'Desc_IronIngot_C',
					amount: NumberStrings.amount_string('360'),
				},
				{
					item: 'Desc_OreIron_C',
					amount: NumberStrings.amount_string('760'),
				},
				{
					item: 'Desc_Wire_C',
					amount: NumberStrings.amount_string('50'),
				},
				{
					item: 'Desc_CopperIngot_C',
					amount: NumberStrings.amount_string('25'),
				},
				{
					item: 'Desc_OreCopper_C',
					amount: NumberStrings.amount_string('25'),
				},
				{
					item: 'Desc_Stone_C',
					amount: NumberStrings.amount_string('300'),
				},
				{
					item: 'Desc_SteelIngot_C',
					amount: NumberStrings.amount_string('400'),
				},
				{
					item: 'Desc_Coal_C',
					amount: NumberStrings.amount_string('400'),
				},
			],
			output: [
				{
					item: 'Desc_BlueprintDesigner_C',
					amount: NumberStrings.amount_string('1'),
				},
			],
			combined: [
				{
					item: 'Desc_BlueprintDesigner_C',
					output: NumberStrings.amount_string('1'),
					surplus: NumberStrings.amount_string('0'),
				},
			],
		};
		const result_1000001:production_ingredients_request_result = {
			ingredients: [
				{
					item: 'Desc_ModularFrame_C',
					amount: NumberStrings.amount_string('15.000015'),
				},
				{
					item: 'Desc_Cable_C',
					amount: NumberStrings.amount_string('25.000025'),
				},
				{
					item: 'Desc_Cement_C',
					amount: NumberStrings.amount_string('100.0001'),
				},
				{
					item: 'Desc_SteelPlate_C',
					amount: NumberStrings.amount_string('100.0001'),
				},
				{
					item: 'Desc_IronPlateReinforced_C',
					amount: NumberStrings.amount_string('22.500023'),
				},
				{
					item: 'Desc_IronRod_C',
					amount: NumberStrings.amount_string('157.500158'),
				},
				{
					item: 'Desc_IronPlate_C',
					amount: NumberStrings.amount_string('135.000135'),
				},
				{
					item: 'Desc_IronScrew_C',
					amount: NumberStrings.amount_string('270.00027'),
				},
				{
					item: 'Desc_IronIngot_C',
					amount: NumberStrings.amount_string('360.00036'),
				},
				{
					item: 'Desc_OreIron_C',
					amount: NumberStrings.amount_string('760.00076'),
				},
				{
					item: 'Desc_Wire_C',
					amount: NumberStrings.amount_string('50.00005'),
				},
				{
					item: 'Desc_CopperIngot_C',
					amount: NumberStrings.amount_string('25.000025'),
				},
				{
					item: 'Desc_OreCopper_C',
					amount: NumberStrings.amount_string('25.000025'),
				},
				{
					item: 'Desc_Stone_C',
					amount: NumberStrings.amount_string('300.0003'),
				},
				{
					item: 'Desc_SteelIngot_C',
					amount: NumberStrings.amount_string('400.0004'),
				},
				{
					item: 'Desc_Coal_C',
					amount: NumberStrings.amount_string('400.0004'),
				},
			],
			output: [
				{
					item: 'Desc_BlueprintDesigner_C',
					amount: NumberStrings.amount_string('1.000001'),
				},
			],
			combined: [
				{
					item: 'Desc_BlueprintDesigner_C',
					output: NumberStrings.amount_string('1.000001'),
					surplus: NumberStrings.amount_string('0'),
				},
			],
		};

		const test_cases:[
			unknown,
			| false
			| production_ingredients_request_result,
		][] = [
			[
				{
					pool: [
						{
							item: 'Desc_IronIngot_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					output: [
						{
							item: 'Desc_IronIngot_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_IronIngot_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_IronRod_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_IronIngot_C',
							amount: NumberStrings.amount_string('1'),
						},
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					output: [
						{
							item: 'Desc_IronRod_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_IronRod_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_IronScrew_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_IronRod_C',
							amount: NumberStrings.amount_string('0.25'),
						},
						{
							item: 'Desc_IronIngot_C',
							amount: NumberStrings.amount_string('0.25'),
						},
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('0.25'),
						},
					],
					output: [
						{
							item: 'Desc_IronScrew_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_IronScrew_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_IronPlate_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_IronIngot_C',
							amount: NumberStrings.amount_string('1.5'),
						},
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('1.5'),
						},
					],
					output: [
						{
							item: 'Desc_IronPlate_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_IronPlate_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_Cement_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_Stone_C',
							amount: NumberStrings.amount_string('3'),
						},
					],
					output: [
						{
							item: 'Desc_Cement_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_Cement_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_SteelIngot_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('1'),
						},
						{
							item: 'Desc_Coal_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					output: [
						{
							item: 'Desc_SteelIngot_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_SteelIngot_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_SteelPlate_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_SteelIngot_C',
							amount: NumberStrings.amount_string('4'),
						},
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('4'),
						},
						{
							item: 'Desc_Coal_C',
							amount: NumberStrings.amount_string('4'),
						},
					],
					output: [
						{
							item: 'Desc_SteelPlate_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_SteelPlate_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_CopperIngot_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_OreCopper_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					output: [
						{
							item: 'Desc_CopperIngot_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_CopperIngot_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_Wire_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_CopperIngot_C',
							amount: NumberStrings.amount_string('0.5'),
						},
						{
							item: 'Desc_OreCopper_C',
							amount: NumberStrings.amount_string('0.5'),
						},
					],
					output: [
						{
							item: 'Desc_Wire_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_Wire_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_Cable_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_Wire_C',
							amount: NumberStrings.amount_string('2'),
						},
						{
							item: 'Desc_CopperIngot_C',
							amount: NumberStrings.amount_string('1'),
						},
						{
							item: 'Desc_OreCopper_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					output: [
						{
							item: 'Desc_Cable_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_Cable_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_IronPlateReinforced_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_IronPlate_C',
							amount: NumberStrings.amount_string('6'),
						},
						{
							item: 'Desc_IronScrew_C',
							amount: NumberStrings.amount_string('12'),
						},
						{
							item: 'Desc_IronIngot_C',
							amount: NumberStrings.amount_string('12'),
						},
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('12'),
						},
						{
							item: 'Desc_IronRod_C',
							amount: NumberStrings.amount_string('3'),
						},
					],
					output: [
						{
							item: 'Desc_IronPlateReinforced_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_IronPlateReinforced_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_ModularFrame_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_IronPlateReinforced_C',
							amount: NumberStrings.amount_string('1.5'),
						},
						{
							item: 'Desc_IronRod_C',
							amount: NumberStrings.amount_string('10.5'),
						},
						{
							item: 'Desc_IronPlate_C',
							amount: NumberStrings.amount_string('9'),
						},
						{
							item: 'Desc_IronScrew_C',
							amount: NumberStrings.amount_string('18'),
						},
						{
							item: 'Desc_IronIngot_C',
							amount: NumberStrings.amount_string('24'),
						},
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('24'),
						},
					],
					output: [
						{
							item: 'Desc_ModularFrame_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_ModularFrame_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{pool: [{
					item: 'Desc_BlueprintDesigner_C',
					amount: 1,
				}]},
				result_1,
			],
			[
				{pool: [{
					item: 'Desc_BlueprintDesigner_C',
					amount: '1',
				}]},
				result_1,
			],
			[
				{pool: [{
					item: 'Desc_BlueprintDesigner_C',
					amount: '1.000001',
				}]},
				result_1000001,
			],
			[
				{pool: [{
					item: 'Desc_BlueprintDesigner_C',
					amount: '1.0000001',
				}]},
				false,
			],
			[
				{
					pool: [
						{
							item: 'Desc_Plastic_C',
							amount: '1',
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_LiquidOil_C',
							amount: NumberStrings.amount_string('1.5'),
						},
					],
					output: [
						{
							item: 'Desc_Plastic_C',
							amount: NumberStrings.amount_string('1'),
						},
						{
							item: 'Desc_HeavyOilResidue_C',
							amount: NumberStrings.amount_string('0.5'),
						},
					],
					combined: [
						{
							item: 'Desc_Plastic_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
						{
							item: 'Desc_HeavyOilResidue_C',
							output: NumberStrings.amount_string('0.5'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{pool: [{
					item: 'Desc_Water_C',
					amount: '123.456',
				}]},
				{
					ingredients: [],
					output: [
						{
							item: 'Desc_Water_C',
							amount: NumberStrings.amount_string('123.456'),
						},
					],
					combined: [
						{
							item: 'Desc_Water_C',
							output: NumberStrings.amount_string('123.456'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					recipe_selection: {
						Desc_Water_C: 'Recipe_UnpackageWater_C',
					},
					pool: [
						{
							item: 'Desc_Water_C',
							amount: '123.456',
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_PackagedWater_C',
							amount: NumberStrings.amount_string('123.456'),
						},
						{
							item: 'Desc_Water_C',
							amount: NumberStrings.amount_string('123.456'),
						},
						{
							item: 'Desc_FluidCanister_C',
							amount: NumberStrings.amount_string('123.456'),
						},
						{
							item: 'Desc_Plastic_C',
							amount: NumberStrings.amount_string('61.728'),
						},
						{
							item: 'Desc_LiquidOil_C',
							amount: NumberStrings.amount_string('92.592'),
						},
					],
					output: [
						{
							item: 'Desc_Water_C',
							amount: NumberStrings.amount_string('123.456'),
						},
						{
							item: 'Desc_FluidCanister_C',
							amount: NumberStrings.amount_string('123.456'),
						},
						{
							item: 'Desc_HeavyOilResidue_C',
							amount: NumberStrings.amount_string('30.864'),
						},
					],
					combined: [
						{
							item: 'Desc_Water_C',
							output: NumberStrings.amount_string('123.456'),
							surplus: NumberStrings.amount_string('0'),
						},
						{
							item: 'Desc_FluidCanister_C',
							output: NumberStrings.amount_string('123.456'),
							surplus: NumberStrings.amount_string('0'),
						},
						{
							item: 'Desc_HeavyOilResidue_C',
							output: NumberStrings.amount_string('30.864'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_Cable_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_Wire_C',
							amount: NumberStrings.amount_string('2'),
						},
						{
							item: 'Desc_CopperIngot_C',
							amount: NumberStrings.amount_string('1'),
						},
						{
							item: 'Desc_OreCopper_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					output: [
						{
							item: 'Desc_Cable_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_Cable_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					input: [
						{
							item: 'Desc_Wire_C',
							amount: NumberStrings.amount_string('10'),
						},
					],
					pool: [
						{
							item: 'Desc_Cable_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [],
					output: [
						{
							item: 'Desc_Cable_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					surplus: [
						{
							item: 'Desc_Wire_C',
							amount: NumberStrings.amount_string('8'),
						},
					],
					combined: [
						{
							item: 'Desc_Cable_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
						{
							item: 'Desc_Wire_C',
							output: NumberStrings.amount_string('0'),
							surplus: NumberStrings.amount_string('1'),
						},
					],
				},
			],
			[
				{
					input: [
						{
							item: 'Desc_OreIron_C',
							amount: 30,
						},
					],
					pool: [
						{
							item: 'Desc_ModularFrame_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_IronPlateReinforced_C',
							amount: NumberStrings.amount_string('1.5'),
						},
						{
							item: 'Desc_IronRod_C',
							amount: NumberStrings.amount_string('10.5'),
						},
						{
							item: 'Desc_IronPlate_C',
							amount: NumberStrings.amount_string('9'),
						},
						{
							item: 'Desc_IronScrew_C',
							amount: NumberStrings.amount_string('18'),
						},
						{
							item: 'Desc_IronIngot_C',
							amount: NumberStrings.amount_string('24'),
						},
					],
					output: [
						{
							item: 'Desc_ModularFrame_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					surplus: [
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('6'),
						},
					],
					combined: [
						{
							item: 'Desc_ModularFrame_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
						{
							item: 'Desc_OreIron_C',
							output: NumberStrings.amount_string('0'),
							surplus: NumberStrings.amount_string('6'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_UraniumCell_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_Cement_C',
							amount: NumberStrings.amount_string('0.6'),
						},
						{
							item: 'Desc_OreUranium_C',
							amount: NumberStrings.amount_string('2'),
						},
						{
							item: 'Desc_Stone_C',
							amount: NumberStrings.amount_string('1.8'),
						},
						{
							item: 'Desc_Sulfur_C',
							amount: NumberStrings.amount_string('1.6'),
						},
						{
							item: 'Desc_SulfuricAcid_C',
							amount: NumberStrings.amount_string('1.6'),
						},
						{
							item: 'Desc_Water_C',
							amount: NumberStrings.amount_string('1.6'),
						},
					],
					output: [
						{
							item: 'Desc_UraniumCell_C',
							amount: NumberStrings.amount_string('1'),
						},
						{
							item: 'Desc_SulfuricAcid_C',
							amount: NumberStrings.amount_string('0.4'),
						},
					],
					combined: [
						{
							item: 'Desc_UraniumCell_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
						{
							item: 'Desc_SulfuricAcid_C',
							output: NumberStrings.amount_string('0.4'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_NuclearFuelRod_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_Cement_C',
							amount: NumberStrings.amount_string('45'),
						},
						{
							item: 'Desc_CircuitBoardHighSpeed_C',
							amount: NumberStrings.amount_string('5'),
						},
						{
							item: 'Desc_Coal_C',
							amount: NumberStrings.amount_string('81.75'),
						},
						{
							item: 'Desc_CopperIngot_C',
							amount: NumberStrings.amount_string('80'),
						},
						{
							item: 'Desc_CopperSheet_C',
							amount: NumberStrings.amount_string('25'),
						},
						{
							item: 'Desc_ElectromagneticControlRod_C',
							amount: NumberStrings.amount_string('5'),
						},
						{
							item: 'Desc_GoldIngot_C',
							amount: NumberStrings.amount_string('20'),
						},
						{
							item: 'Desc_HighSpeedWire_C',
							amount: NumberStrings.amount_string('100'),
						},
						{
							item: 'Desc_OreCopper_C',
							amount: NumberStrings.amount_string('80'),
						},
						{
							item: 'Desc_OreGold_C',
							amount: NumberStrings.amount_string('60'),
						},
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('81.75'),
						},
						{
							item: 'Desc_OreUranium_C',
							amount: NumberStrings.amount_string('100'),
						},
						{
							item: 'Desc_Stator_C',
							amount: NumberStrings.amount_string('7.5'),
						},
						{
							item: 'Desc_SteelIngot_C',
							amount: NumberStrings.amount_string('81.75'),
						},
						{
							item: 'Desc_SteelPipe_C',
							amount: NumberStrings.amount_string('22.5'),
						},
						{
							item: 'Desc_SteelPlateReinforced_C',
							amount: NumberStrings.amount_string('3'),
						},
						{
							item: 'Desc_SteelPlate_C',
							amount: NumberStrings.amount_string('12'),
						},
						{
							item: 'Desc_Stone_C',
							amount: NumberStrings.amount_string('135'),
						},
						{
							item: 'Desc_Sulfur_C',
							amount: NumberStrings.amount_string('80'),
						},
						{
							item: 'Desc_SulfuricAcid_C',
							amount: NumberStrings.amount_string('80'),
						},
						{
							item: 'Desc_UraniumCell_C',
							amount: NumberStrings.amount_string('50'),
						},
						{
							item: 'Desc_Water_C',
							amount: NumberStrings.amount_string('80'),
						},
						{
							item: 'Desc_Wire_C',
							amount: NumberStrings.amount_string('60'),
						},
					],
					output: [
						{
							item: 'Desc_NuclearFuelRod_C',
							amount: NumberStrings.amount_string('1'),
						},
						{
							item: 'Desc_SulfuricAcid_C',
							amount: NumberStrings.amount_string('20'),
						},
					],
					combined: [
						{
							item: 'Desc_NuclearFuelRod_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
						{
							item: 'Desc_SulfuricAcid_C',
							output: NumberStrings.amount_string('20'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_NuclearWaste_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_Cement_C',
							amount: NumberStrings.amount_string('0.9'),
						},
						{
							item: 'Desc_CircuitBoardHighSpeed_C',
							amount: NumberStrings.amount_string('0.1'),
						},
						{
							item: 'Desc_Coal_C',
							amount: NumberStrings.amount_string('1.635'),
						},
						{
							item: 'Desc_CopperIngot_C',
							amount: NumberStrings.amount_string('1.6'),
						},
						{
							item: 'Desc_CopperSheet_C',
							amount: NumberStrings.amount_string('0.5'),
						},
						{
							item: 'Desc_ElectromagneticControlRod_C',
							amount: NumberStrings.amount_string('0.1'),
						},
						{
							item: 'Desc_GoldIngot_C',
							amount: NumberStrings.amount_string('0.4'),
						},
						{
							item: 'Desc_HighSpeedWire_C',
							amount: NumberStrings.amount_string('2'),
						},
						{
							item: 'Desc_NuclearFuelRod_C',
							amount: NumberStrings.amount_string('0.02'),
						},
						{
							item: 'Desc_OreCopper_C',
							amount: NumberStrings.amount_string('1.6'),
						},
						{
							item: 'Desc_OreGold_C',
							amount: NumberStrings.amount_string('1.2'),
						},
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('1.635'),
						},
						{
							item: 'Desc_OreUranium_C',
							amount: NumberStrings.amount_string('2'),
						},
						{
							item: 'Desc_Stator_C',
							amount: NumberStrings.amount_string('0.15'),
						},
						{
							item: 'Desc_SteelIngot_C',
							amount: NumberStrings.amount_string('1.635'),
						},
						{
							item: 'Desc_SteelPipe_C',
							amount: NumberStrings.amount_string('0.45'),
						},
						{
							item: 'Desc_SteelPlateReinforced_C',
							amount: NumberStrings.amount_string('0.06'),
						},
						{
							item: 'Desc_SteelPlate_C',
							amount: NumberStrings.amount_string('0.24'),
						},
						{
							item: 'Desc_Stone_C',
							amount: NumberStrings.amount_string('2.7'),
						},
						{
							item: 'Desc_Sulfur_C',
							amount: NumberStrings.amount_string('1.6'),
						},
						{
							item: 'Desc_SulfuricAcid_C',
							amount: NumberStrings.amount_string('1.6'),
						},
						{
							item: 'Desc_UraniumCell_C',
							amount: NumberStrings.amount_string('1'),
						},
						{
							item: 'Desc_Water_C',
							amount: NumberStrings.amount_string('1.6'),
						},
						{
							item: 'Desc_Wire_C',
							amount: NumberStrings.amount_string('1.2'),
						},
					],
					output: [
						{
							item: 'Desc_NuclearWaste_C',
							amount: NumberStrings.amount_string('1'),
						},
						{
							item: 'Desc_SulfuricAcid_C',
							amount: NumberStrings.amount_string('0.4'),
						},
					],
					combined: [
						{
							item: 'Desc_NuclearWaste_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
						{
							item: 'Desc_SulfuricAcid_C',
							output: NumberStrings.amount_string('0.4'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					recipe_selection: {
						Desc_Plastic_C: 'Recipe_Alternate_Plastic_1_C',
						Desc_Rubber_C: 'Recipe_Alternate_RecycledRubber_C',
					},
					pool: [
						{
							item: 'Desc_Plastic_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_LiquidOil_C',
							amount: NumberStrings.amount_string('1.5'),
						},
						{
							item: 'Desc_LiquidFuel_C',
							amount: NumberStrings.amount_string('0.1'),
						},
						{
							item: 'Desc_Plastic_C',
							amount: NumberStrings.amount_string('0.333334'),
						},
						{
							item: 'Desc_Rubber_C',
							amount: NumberStrings.amount_string('0.666667'),
						},
					],
					output: [
						{
							item: 'Desc_Plastic_C',
							amount: NumberStrings.amount_string('1'),
						},
						{
							item: 'Desc_PolymerResin_C',
							amount: NumberStrings.amount_string('0.75'),
						},
					],
					surplus: [
						{
							item: 'Desc_Plastic_C',
							amount: NumberStrings.amount_string('0.083334'),
						},
					],
					combined: [
						{
							item: 'Desc_Plastic_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
						{
							item: 'Desc_PolymerResin_C',
							output: NumberStrings.amount_string('0.75'),
							surplus: NumberStrings.amount_string('0'),
						},
						{
							item: 'Desc_Plastic_C',
							output: NumberStrings.amount_string('0'),
							surplus: NumberStrings.amount_string('0.083334'),
						},
					],
				},
			],
			[
				{
					recipe_selection: {
						Desc_IronPlate_C: 'Recipe_Alternate_CoatedIronPlate_C',
						Desc_Plastic_C: 'Recipe_Alternate_Plastic_1_C',
						Desc_Rubber_C: 'Recipe_Alternate_RecycledRubber_C',
					},
					pool: [
						{
							item: 'Desc_IronPlate_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_IronIngot_C',
							amount: NumberStrings.amount_string('0.666667'),
						},
						{
							item: 'Desc_LiquidFuel_C',
							amount: NumberStrings.amount_string('0.133334'),
						},
						{
							item: 'Desc_LiquidOil_C',
							amount: NumberStrings.amount_string('0.2'),
						},
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('0.666667'),
						},
						{
							item: 'Desc_Plastic_C',
							amount: NumberStrings.amount_string('0.177778'),
						},
						{
							item: 'Desc_Rubber_C',
							amount: NumberStrings.amount_string('0.088889'),
						},
					],
					output: [
						{
							item: 'Desc_IronPlate_C',
							amount: NumberStrings.amount_string('1'),
						},
						{
							item: 'Desc_PolymerResin_C',
							amount: NumberStrings.amount_string('0.1'),
						},
					],
					combined: [
						{
							item: 'Desc_IronPlate_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
						{
							item: 'Desc_PolymerResin_C',
							output: NumberStrings.amount_string('0.1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_IronPlate_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_IronIngot_C',
							amount: NumberStrings.amount_string('1.5'),
						},
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('1.5'),
						},
					],
					output: [
						{
							item: 'Desc_IronPlate_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_IronPlate_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					input: [
						{
							item: 'Desc_IronIngot_C',
							amount: 3,
						},
					],
					pool: [
						{
							item: 'Desc_IronPlate_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [],
					output: [
						{
							item: 'Desc_IronPlate_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					surplus: [
						{
							item: 'Desc_IronIngot_C',
							amount: NumberStrings.amount_string('1.5'),
						},
					],
					combined: [
						{
							item: 'Desc_IronPlate_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
						{
							item: 'Desc_IronIngot_C',
							output: NumberStrings.amount_string('0'),
							surplus: NumberStrings.amount_string('1.5'),
						},
					],
				},
			],
			[
				{
					pool: [
						{
							item: 'Desc_SteelPlate_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_SteelIngot_C',
							amount: NumberStrings.amount_string('4'),
						},
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('4'),
						},
						{
							item: 'Desc_Coal_C',
							amount: NumberStrings.amount_string('4'),
						},
					],
					output: [
						{
							item: 'Desc_SteelPlate_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_SteelPlate_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					recipe_selection: {
						Desc_SteelIngot_C: 'Recipe_Alternate_IngotSteel_1_C',
					},
					pool: [
						{
							item: 'Desc_SteelPlate_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_SteelIngot_C',
							amount: NumberStrings.amount_string('4'),
						},
						{
							item: 'Desc_IronIngot_C',
							amount: NumberStrings.amount_string('2.666667'),
						},
						{
							item: 'Desc_OreIron_C',
							amount: NumberStrings.amount_string('2.666667'),
						},
						{
							item: 'Desc_Coal_C',
							amount: NumberStrings.amount_string('2.666667'),
						},
					],
					output: [
						{
							item: 'Desc_SteelPlate_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					combined: [
						{
							item: 'Desc_SteelPlate_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
					],
				},
			],
			[
				{
					input: [
						{
							item: 'Desc_IronIngot_C',
							amount: 3,
						},
					],
					recipe_selection: {
						Desc_SteelIngot_C: 'Recipe_Alternate_IngotSteel_1_C',
					},
					pool: [
						{
							item: 'Desc_SteelPlate_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: [
						{
							item: 'Desc_SteelIngot_C',
							amount: NumberStrings.amount_string('4'),
						},
						{
							item: 'Desc_Coal_C',
							amount: NumberStrings.amount_string('2.666667'),
						},
					],
					output: [
						{
							item: 'Desc_SteelPlate_C',
							amount: NumberStrings.amount_string('1'),
						},
					],
					surplus: [
						{
							item: 'Desc_IronIngot_C',
							amount: NumberStrings.amount_string('0.333334'),
						},
					],
					combined: [
						{
							item: 'Desc_SteelPlate_C',
							output: NumberStrings.amount_string('1'),
							surplus: NumberStrings.amount_string('0'),
						},
						{
							item: 'Desc_IronIngot_C',
							output: NumberStrings.amount_string('0'),
							surplus: NumberStrings.amount_string('0.333334'),
						},
					],
				},
			],
			[
				{
					input: [
						{
							item: 'Desc_IronIngot_C',
							amount: 360,
						},
					],
					pool: [
						{
							item: 'Desc_BlueprintDesigner_C',
							amount: 1,
						},
					],
				},
				{
					ingredients: result_1.ingredients.filter(
						(maybe) => 'Desc_IronIngot_C' !== maybe.item
					).map(
						(ingredient) => {
							if (ingredient.item === 'Desc_OreIron_C') {
								return {
									item: 'Desc_OreIron_C',
									amount: NumberStrings.amount_string('400'),
								};
							}

							return ingredient;
						}
					),
					output: result_1.output,
					combined: result_1.output.map(e => {
						return {
							item: e.item,
							output: e.amount,
							surplus: '0',
						};
					}),
				},
			],
		];

		for (const entry of test_cases) {
			const [data, expectation] = entry;

			void it(
				`${
					expectation ? 'behaves' : 'throws'
				} with ${JSON.stringify(data)}`,
				() => {
					const get_result = () => instance.validate(
						data
					);

					if (false === expectation) {
						assert.throws(get_result);
					} else {
						assert.doesNotThrow(get_result);

						assert.deepEqual(
							flattened_production_ingredients_request_result(
								instance.calculate(data)
							),
							flattened_production_ingredients_request_result(
								expectation
							)
						);
					}
				}
			)
		}

		for (const Desc_C of does_not_throw_cases) {
			void it(
				`${
					instance.constructor.name
				}.validate({pool: [{item: ${Desc_C}, amount: 1}]}) behaves`,
				() => {
					const get_result = () => instance.validate({
						pool: [
							{
								item: Desc_C,
								amount: 1,
							},
						],
					});

					assert.doesNotThrow(get_result);
				}
			)
		}
	})
})
