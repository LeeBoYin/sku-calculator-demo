<template>
	<div id="app">
		<h1 class="title">@leeboyin/sku-calculator Demo</h1>
		<div class="control">
			<label class="switch">
				<input type="checkbox" v-model="isMultiSku">
				<span>Multiple color</span>
			</label>
			<button @click="resetAll" class="btn">Deselect All</button>
			<hr>
			<a href="https://github.com/LeeBoYin/sku-calculator" target="_blank">View on GitHub →</a>
			<a href="https://www.npmjs.com/package/@leeboyin/sku-calculator" target="_blank">View on npm →</a>
		</div>
		<div class="info">
			<ul>
				<li>
					Total Price: ${{ totalPrice }}
				</li>
			</ul>
		</div>
		<div class="option-section">
			<!-- single choice specs -->
			<div v-for="(values, name) in singleChoiceSpecs" :key="'spec-row-' + name" class="spec-row">
				<div class="spec-name">{{ name }}</div>
				<div
					v-for="value in values"
					v-tooltip="getSpecHint(name, value)"
					:key="'spec-name-' + value"
					:class="{ selected: selectedSpec[name] === value, disabled: !checkIsSpecSelectable(name, value) }"
					class="spec-value" @click="onClickSpec(name, value)">
					<div>{{ value }}</div>
				</div>
			</div>
			<!-- multiple choice amount -->
			<div v-if="isMultiSku" class="spec-row">
				<div class="spec-name">{{ multiChoiceSpecName }}</div>
				<div
					v-for="value in multiChoiceSpec"
					:key="'spec-name-' + value">
					<label>
						{{ value }}
						<input class="amount-input" type="number" v-model.number="amount[value]" min="0" :max="specStatus[multiChoiceSpecName][value].maxAmount" :disabled="!specStatus[multiChoiceSpecName][value].selectable" />
						<small v-if="specStatus[multiChoiceSpecName][value].selectable && !specStatus[multiChoiceSpecName][value].insufficient">
							<template v-if="specStatus[multiChoiceSpecName][value].lowestPrice === specStatus[multiChoiceSpecName][value].highestPrice">
								${{ specStatus[multiChoiceSpecName][value].lowestPrice }}
							</template>
							<template v-else>
								from ${{ specStatus[multiChoiceSpecName][value].lowestPrice }} to ${{ specStatus[multiChoiceSpecName][value].highestPrice }}
							</template>
						</small>
						<small v-if="specStatus[multiChoiceSpecName][value].selectable">(max: {{ specStatus[multiChoiceSpecName][value].maxAmount }})</small>
					</label>
				</div>
			</div>
			<!-- single choice amount -->
			<div v-if="!isMultiSku" class="spec-row">
				<div class="spec-name">amount</div>
				<div>
					<input class="amount-input" type="number" v-model.number="amount" min="1" :max="statistics.maxAmount" />
					<small>
						<template v-if="statistics.lowestPrice === statistics.highestPrice">
							${{ statistics.lowestPrice }}
						</template>
						<template v-else>
							from ${{ statistics.lowestPrice }} to ${{ statistics.highestPrice }}
						</template>
					</small>
					<small>(max: {{ statistics.maxAmount }})</small>
				</div>
			</div>
			<button class="btn" @click="submit">{{ btnText }}</button>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';
import SkuCalculator from '@leeboyin/sku-calculator';
import data from './data';
const skuCalculator = new SkuCalculator(data);
export default {
	data() {
		return {
			amount: null,
			btnText: 'Add to Cart',
			isMultiSku: true,
			isSubmitted: false,
			multiChoiceSpecName: 'color',
			selectedSpec: {},
			skus: data.skus,
			specs: data.specs,
			specStatus: skuCalculator.specStatus,
			statistics: skuCalculator.statistics,
		};
	},
	computed: {
		isDetermined() {
			return !_.isEmpty(this.statistics.determinedAmount);
		},
		multiChoiceSpec() {
			return this.isMultiSku ? this.specs[this.multiChoiceSpecName] : null;
		},
		totalPrice() {
			return _.reduce(this.statistics.determinedAmount, (sum, amount, skuIdx) => {
				return sum += amount * this.skus[skuIdx].price;
			}, 0);
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
		singleChoiceSpecs() {
			if(!this.isMultiSku) {
				return this.specs;
			}
			const clonedSpecs = _.cloneDeep(this.specs);
			delete(clonedSpecs[this.multiChoiceSpecName]);
			return clonedSpecs;
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
		submit() {
			if(!this.isDetermined || this.isSubmitted) {
				return;
			}

			this.btnText = `Total price: ${ this.totalPrice }, Thank you!`;
			this.isSubmitted = true;
			setTimeout(() => {
				this.btnText = 'Add to Cart';
				this.isSubmitted = false;
			}, 3000);
		},
	},
};
</script>
