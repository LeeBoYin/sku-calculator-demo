<template>
	<div id="app">
		<label>
			<input type="checkbox" v-model="isMultiSku">
			Multiple color
		</label>
		<button @click="resetAll" class="btn">Deselect All</button>
		<div class="option-section">
			<!-- single choice specs -->
			<div v-for="(values, name) in singleChoiceSpecs" :key="'spec-row-' + name" class="spec-row">
				<div class="spec-name">{{ name }}</div>
				<div
					v-for="value in values"
					:title="getSpecHint(name, value)"
					:key="'spec-name-' + value"
					:class="{ selected: selectedSpec[name] === value, disabled: !checkIsSpecSelectable(name, value) }"
					class="spec-value" @click="onClickSpec(name, value)">
					<div>{{ value }}</div>
				</div>
			</div>
			<!-- multiple choice amount -->
			<div v-if="isMultiSku" class="spec-row">
				<div
					v-for="value in multiChoiceSpec"
					:key="'spec-name-' + value">
					<label>
						{{ value }}
						<span v-if="specStatus[multiChoiceSpecName][value].selectable">
								<template v-if="specStatus[multiChoiceSpecName][value].lowestPrice === specStatus[multiChoiceSpecName][value].highestPrice">
									${{ specStatus[multiChoiceSpecName][value].lowestPrice }}
								</template>
								<template v-else>
									from ${{ specStatus[multiChoiceSpecName][value].lowestPrice }} to ${{ specStatus[multiChoiceSpecName][value].highestPrice }}
								</template>
							</span>
						<input class="amount-input" type="number" v-model="amount[value]" min="0" :max="specStatus[multiChoiceSpecName][value].maxAmount" :disabled="!specStatus[multiChoiceSpecName][value].selectable" />
						<sub v-if="specStatus[multiChoiceSpecName][value].selectable">(max: {{ specStatus[multiChoiceSpecName][value].maxAmount }})</sub>
					</label>
				</div>
			</div>
			<!-- single choice amount -->
			<div v-if="!isMultiSku" class="spec-row">
				<div class="spec-name">Amount</div>
				<div>
					<input class="amount-input" type="number" v-model="amount" min="1" :max="statistics.maxAmount" />
					<sub>(max: {{ statistics.maxAmount }})</sub>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';
import SkuCalculator from '@leeboyin/sku-calculator';
import data from './data';
// create SkuCalculator instance
const skuCalculator = new SkuCalculator(data);
export default {
	data() {
		return {
			amount: null,
			isMultiSku: true,
			multiChoiceSpecName: 'color',
			selectedSpec: {},
			skus: data.skus,
			specs: data.specs,
			specStatus: skuCalculator.specStatus,
			statistics: skuCalculator.statistics,
		};
	},
	computed: {
		singleChoiceSpecs() {
			if(!this.isMultiSku) {
				return this.specs;
			}
			const clonedSpecs = _.cloneDeep(this.specs);
			delete(clonedSpecs[this.multiChoiceSpecName]);
			return clonedSpecs;
		},
		multiChoiceSpec() {
			return this.isMultiSku ? this.specs[this.multiChoiceSpecName] : null;
		},
		selectionArray() {
			let selectionArray = [];
			if(this.isMultiSku) {
				_.forEach(this.specs[this.multiChoiceSpecName], (specValue) => {
					const amount = +_.get(this.amount, specValue, 0);
					if(amount === 0) {
						return;
					}
					const spec = _.clone(this.selectedSpec);
					spec[this.multiChoiceSpecName] = specValue;
					selectionArray.push({
						spec,
						amount,
					});
				});

				if(selectionArray.length === 0) {
					selectionArray.push({
						spec: _.clone(this.selectedSpec),
						amount: 0,
					});
				}

				// filter duplicate combination
				selectionArray = _.uniqBy(selectionArray, (selection) => {
					return JSON.stringify(selection.spec);
				});
			} else {
				// 選擇至少一個規格
				if(!_.every(this.selectedSpec, _.isNil)) {
					selectionArray.push({
						spec: _.clone(this.selectedSpec),
						amount: +this.amount,
					});
				}
			}

			// 只留下有選 spec 的
			selectionArray = _.filter(selectionArray, (selection) => {
				return selection.amount > 0 || _.some(selection.spec, (value) => {
					return !_.isNil(value);
				});
			});

			return selectionArray;
		},
	},
	watch: {
		isMultiSku() {
			this.resetAll();
		},
		selectionArray() {
			skuCalculator.setSelectionArray(this.selectionArray);
			this.specStatus = _.cloneDeep(skuCalculator.specStatus);
			this.statistics = _.cloneDeep(skuCalculator.statistics);
		},
	},
	created() {
		this.resetAll();
	},
	methods: {
		checkIsSpecSelectable(specName, specValue) {
			return _.get(this.specStatus, [specName, specValue, 'selectable'], false) && !_.get(this.specStatus, [specName, specValue, 'insufficient'], false);
		},
		getSpecHint(specName, specValue) {
			if(!_.get(this.specStatus, [specName, specValue, 'selectable'])) {
				return 'not exist';
			} else if(_.get(this.specStatus, [specName, specValue, 'insufficient'])) {
				return 'insufficient';
			}

			return null;
		},
		onClickSpec(name, value) {
			if(!this.checkIsSpecSelectable(name, value)) {
				return;
			}

			if (this.selectedSpec[name] === value) {
				this.selectedSpec[name] = null;
			} else {
				this.selectedSpec[name] = value;
			}
		},
		resetAll() {
			this.selectedSpec = {};

			// init selected
			_.forEach(this.specs, (values, name) => {
				if(this.isMultiSku && name === this.multiChoiceSpecName) {
					return;
				}
				Vue.set(this.selectedSpec, name, null);
			});

			// init amount
			if(this.isMultiSku) {
				this.amount = {};
				_.forEach(this.specs[this.multiChoiceSpecName], (value) => {
					Vue.set(this.amount, value, 0);
				});
			} else {
				this.amount = 1;
			}
		},
	},
};
</script>

<style scoped>
	.spec-row {
		margin-bottom: 5px;
	}
	.spec-name {
		font-size: 18px;
		margin-right: 10px;
		margin-bottom: 10px;
		color: #666;
	}
	.spec-value {
		display: inline-block;
		text-align: center;
		padding: 8px 16px;
		margin-right: 10px;
		margin-bottom: 15px;
		border: 1px solid #CCC;
		border-radius: 4px;
		cursor: pointer;
	}
	.spec-value.selected {
		position: relative;
		background-color: #26bec9;
		border-color: #26bec9;
		color: #fff;
	}
	.spec-value.selected:after {
		content: '';
		position: absolute;
		top: 3px;
		right: 3px;
		border-width: 5px;
		border-style: solid;
		border-color: #fff #fff transparent transparent;
	}
	.spec-value.disabled {
		border-color: #eee;
		cursor: default;
		color: #ccc;
	}
	.lowest-price {
		color: #666;
		font-size: 12px;
	}
	.spec-value.selected .lowest-price {
		color: #fff;
		opacity: 0.8;
	}
	.spec-value.disabled .lowest-price {
		color: #CCC;
	}
	.amount-input {
		height: 42px;
		width: 82px;
		padding: 8px 12px;
		border-radius: 4px;
		box-shadow: none;
		border: 1px solid #e1e1e1;
		font-size: 22px;
		text-align: center;
		outline: none;
		margin-left: 10px;
		margin-bottom: 10px;
	}
	.amount-input:focus {
		border-color: #26bec9;
	}
</style>